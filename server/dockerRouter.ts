import { z } from "zod";
import { adminProcedure, router } from "./_core/trpc";
import Docker from "dockerode";
import { TRPCError } from "@trpc/server";

// Initialize Docker client
const docker = new Docker({ socketPath: "/var/run/docker.sock" });

const dockerIdentifierSchema = z.string()
  .min(1)
  .max(128)
  .regex(/^[A-Za-z0-9][A-Za-z0-9_.-]*$/, "Neplatný identifikátor Docker kontejneru.");

const dockerImageSchema = z.string()
  .min(1)
  .max(255)
  .regex(/^[A-Za-z0-9][A-Za-z0-9_.:@/-]*$/, "Neplatný název Docker image.");

function dockerOperationFailed(operation: string, error: unknown): TRPCError {
  console.error(`[Docker] ${operation} failed`, error);
  return new TRPCError({
    code: "INTERNAL_SERVER_ERROR",
    message: "Operaci Docker se nepodařilo dokončit. Zkontrolujte stav služby a oprávnění administrátora.",
  });
}

export const dockerRouter = router({
  // List all containers
  listContainers: adminProcedure
    .input(z.object({
      all: z.boolean().optional().default(true),
    }))
    .query(async ({ input }) => {
      try {
        const containers = await docker.listContainers({ all: input.all });
        return containers.map(container => ({
          id: container.Id,
          name: container.Names[0]?.replace("/", "") || "unknown",
          image: container.Image,
          state: container.State,
          status: container.Status,
          created: container.Created,
          ports: container.Ports,
        }));
      } catch (error) {
        throw dockerOperationFailed("list containers", error);
      }
    }),

  // Get container stats
  getContainerStats: adminProcedure
    .input(z.object({
      containerId: dockerIdentifierSchema,
    }))
    .query(async ({ input }) => {
      try {
        const container = docker.getContainer(input.containerId);
        const stats = await container.stats({ stream: false });
        
        // Calculate CPU percentage
        const cpuDelta = stats.cpu_stats.cpu_usage.total_usage - stats.precpu_stats.cpu_usage.total_usage;
        const systemDelta = stats.cpu_stats.system_cpu_usage - stats.precpu_stats.system_cpu_usage;
        const cpuPercent = systemDelta > 0
          ? (cpuDelta / systemDelta) * stats.cpu_stats.online_cpus * 100
          : 0;

        // Calculate memory usage
        const memoryUsage = stats.memory_stats.usage || 0;
        const memoryLimit = stats.memory_stats.limit || 1;
        const memoryPercent = (memoryUsage / memoryLimit) * 100;

        return {
          cpuPercent: cpuPercent.toFixed(2),
          memoryUsage: (memoryUsage / 1024 / 1024).toFixed(2), // MB
          memoryLimit: (memoryLimit / 1024 / 1024).toFixed(2), // MB
          memoryPercent: memoryPercent.toFixed(2),
          networkRx: stats.networks?.eth0?.rx_bytes || 0,
          networkTx: stats.networks?.eth0?.tx_bytes || 0,
        };
      } catch (error) {
        throw dockerOperationFailed("read container stats", error);
      }
    }),

  // Start container
  startContainer: adminProcedure
    .input(z.object({
      containerId: dockerIdentifierSchema,
    }))
    .mutation(async ({ input }) => {
      try {
        const container = docker.getContainer(input.containerId);
        await container.start();
        return { success: true, message: "Container started successfully" };
      } catch (error) {
        throw dockerOperationFailed("start container", error);
      }
    }),

  // Stop container
  stopContainer: adminProcedure
    .input(z.object({
      containerId: dockerIdentifierSchema,
    }))
    .mutation(async ({ input }) => {
      try {
        const container = docker.getContainer(input.containerId);
        await container.stop();
        return { success: true, message: "Container stopped successfully" };
      } catch (error) {
        throw dockerOperationFailed("stop container", error);
      }
    }),

  // Remove container
  removeContainer: adminProcedure
    .input(z.object({
      containerId: dockerIdentifierSchema,
      force: z.boolean().optional().default(false),
    }))
    .mutation(async ({ input }) => {
      try {
        const container = docker.getContainer(input.containerId);
        await container.remove({ force: input.force });
        return { success: true, message: "Container removed successfully" };
      } catch (error) {
        throw dockerOperationFailed("remove container", error);
      }
    }),

  // Create and start container
  createContainer: adminProcedure
    .input(z.object({
      name: z.string().min(1).max(63).regex(/^[A-Za-z0-9][A-Za-z0-9_.-]*$/, "Neplatný název kontejneru."),
      image: dockerImageSchema,
      env: z.array(z.string().min(1).max(4_096).regex(/^[A-Za-z_][A-Za-z0-9_]*=.*/, "Proměnná prostředí musí mít tvar KEY=VALUE.")).max(50).optional(),
      ports: z.record(
        z.string().regex(/^\d{1,5}\/(tcp|udp)$/, "Neplatný port Dockeru."),
        z.array(z.object({ HostPort: z.string().regex(/^\d{1,5}$/, "Neplatný host port.") })).min(1).max(10)
      ).optional(),
      volumes: z.array(z.string().min(1).max(512).regex(/^[-A-Za-z0-9_./]+:[-A-Za-z0-9_./]+(?::(?:ro|rw))?$/, "Neplatný Docker volume bind.")).max(20).optional(),
      command: z.array(z.string().min(1).max(1_024)).max(64).optional(),
      restartPolicy: z.enum(["no", "always", "unless-stopped", "on-failure"]).optional().default("unless-stopped"),
    }))
    .mutation(async ({ input }) => {
      try {
        // Pull image if not exists
        try {
          await docker.getImage(input.image).inspect();
        } catch {
          await new Promise((resolve, reject) => {
            docker.pull(input.image, {}, (err: any, stream: any) => {
              if (err) return reject(err);
              docker.modem.followProgress(stream, (err: any) => {
                if (err) return reject(err);
                resolve(true);
              });
            });
          });
        }

        // Create container
        const container = await docker.createContainer({
          name: input.name,
          Image: input.image,
          Env: input.env,
          ExposedPorts: input.ports ? Object.keys(input.ports).reduce((acc, port) => {
            acc[port] = {};
            return acc;
          }, {} as any) : undefined,
          HostConfig: {
            PortBindings: input.ports,
            Binds: input.volumes,
            RestartPolicy: {
              Name: input.restartPolicy,
              MaximumRetryCount: input.restartPolicy === "on-failure" ? 3 : 0,
            },
          },
          Cmd: input.command,
        });

        await container.start();

        return {
          success: true,
          containerId: container.id,
          message: "Container created and started successfully",
        };
      } catch (error) {
        throw dockerOperationFailed("create container", error);
      }
    }),

  // Get container logs
  getContainerLogs: adminProcedure
    .input(z.object({
      containerId: dockerIdentifierSchema,
      tail: z.number().int().min(1).max(1_000).optional().default(100),
    }))
    .query(async ({ input }) => {
      try {
        const container = docker.getContainer(input.containerId);
        const logs = await container.logs({
          stdout: true,
          stderr: true,
          tail: input.tail,
          timestamps: true,
        });
        
        return {
          logs: logs.toString("utf-8"),
        };
      } catch (error) {
        throw dockerOperationFailed("read container logs", error);
      }
    }),

  // List images
  listImages: adminProcedure.query(async () => {
    try {
      const images = await docker.listImages();
      return images.map(image => ({
        id: image.Id,
        tags: image.RepoTags || [],
        size: image.Size,
        created: image.Created,
      }));
    } catch (error) {
      throw dockerOperationFailed("list images", error);
    }
  }),

  // Pull image
  pullImage: adminProcedure
    .input(z.object({
      image: dockerImageSchema,
    }))
    .mutation(async ({ input }) => {
      try {
        await new Promise((resolve, reject) => {
          docker.pull(input.image, {}, (err: any, stream: any) => {
            if (err) return reject(err);
            docker.modem.followProgress(stream, (err: any) => {
              if (err) return reject(err);
              resolve(true);
            });
          });
        });
        return { success: true, message: "Image pulled successfully" };
      } catch (error) {
        throw dockerOperationFailed("pull image", error);
      }
    }),
});
