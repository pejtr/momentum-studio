import { Server as HTTPServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import type { Socket } from "socket.io";
import type { Request } from "express";
import * as db from "../db";
import { sdk } from "./sdk";

interface CursorPosition {
  x: number;
  y: number;
  userId: number;
  userName: string;
  scriptId: number;
}

interface NodeUpdate {
  scriptId: number;
  nodeId: string;
  position?: { x: number; y: number };
  data?: Record<string, unknown>;
  userId: number;
}

interface EdgeUpdate {
  scriptId: number;
  edgeId: string;
  source: string;
  target: string;
  userId: number;
}

interface ExecutionNotification {
  executionId: number;
  scriptId: number;
  status: "completed" | "failed" | "running";
  message: string;
  timestamp: number;
  userId: number;
}

type AuthenticatedSocket = Socket & { data: { userId: number; userName: string } };

let io: SocketIOServer | null = null;

function isAllowedSocketOrigin(origin: string | undefined) {
  if (!origin) return process.env.NODE_ENV === "development";
  if (/^https:\/\/[^/]+\.manus\.space$/.test(origin)) return true;
  if (/^https:\/\/[^/]+\.manus\.computer$/.test(origin)) return true;
  return process.env.NODE_ENV === "development" && /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
}

function isScriptId(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value > 0;
}

export function initializeWebSocket(httpServer: HTTPServer) {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: (origin, callback) => callback(isAllowedSocketOrigin(origin) ? null : new Error("WebSocket origin not allowed"), true),
      methods: ["GET", "POST"],
      credentials: true,
    },
    path: "/socket.io/",
  });

  io.use(async (socket, next) => {
    if (!isAllowedSocketOrigin(socket.handshake.headers.origin)) {
      return next(new Error("WebSocket origin not allowed"));
    }

    try {
      const user = await sdk.authenticateRequest(socket.request as Request);
      (socket as AuthenticatedSocket).data = { userId: user.id, userName: user.name || "Operator" };
      return next();
    } catch {
      return next(new Error("Authentication required"));
    }
  });

  io.on("connection", (rawSocket: Socket) => {
    const socket = rawSocket as AuthenticatedSocket;
    const userRoom = `user-${socket.data.userId}`;
    socket.join(userRoom);

    const scriptRoom = (scriptId: number) => `script-${scriptId}`;
    const canBroadcastToScript = (scriptId: unknown) => isScriptId(scriptId) && socket.rooms.has(scriptRoom(scriptId));
    const deny = (code: "INVALID_SCRIPT" | "FORBIDDEN") => socket.emit("collaboration-error", { code });

    socket.on("join-script", async (scriptId: unknown) => {
      if (!isScriptId(scriptId)) return deny("INVALID_SCRIPT");
      const script = await db.getScriptById(scriptId, socket.data.userId);
      if (!script) return deny("FORBIDDEN");
      socket.join(scriptRoom(scriptId));
      socket.emit("script-joined", { scriptId });
    });

    socket.on("leave-script", (scriptId: unknown) => {
      if (!isScriptId(scriptId)) return deny("INVALID_SCRIPT");
      socket.leave(scriptRoom(scriptId));
    });

    const broadcastToScript = (event: string, data: { scriptId: unknown; userId?: unknown; userName?: unknown }) => {
      if (!canBroadcastToScript(data.scriptId)) return deny("FORBIDDEN");
      const scriptId = data.scriptId as number;
      socket.to(scriptRoom(scriptId)).emit(event, {
        socketId: socket.id,
        ...data,
        scriptId,
        userId: socket.data.userId,
        userName: socket.data.userName,
      });
    };

    socket.on("cursor-move", (data: CursorPosition) => broadcastToScript("cursor-update", data));
    socket.on("node-update", (data: NodeUpdate) => broadcastToScript("node-changed", data));
    socket.on("node-add", (data: NodeUpdate) => broadcastToScript("node-added", data));
    socket.on("node-delete", (data: { scriptId: number; nodeId: string; userId: number }) => broadcastToScript("node-deleted", data));
    socket.on("edge-update", (data: EdgeUpdate) => broadcastToScript("edge-changed", data));
    socket.on("edge-add", (data: EdgeUpdate) => broadcastToScript("edge-added", data));
    socket.on("edge-delete", (data: { scriptId: number; edgeId: string; userId: number }) => broadcastToScript("edge-deleted", data));
    socket.on("user-join", (data: { scriptId: number; userId: number; userName: string }) => broadcastToScript("user-joined", data));
    socket.on("user-leave", (data: { scriptId: number; userId: number }) => broadcastToScript("user-left", data));
  });

  return io;
}

export function broadcastExecutionNotification(notification: ExecutionNotification) {
  if (!io) {
    console.warn("[WebSocket] Cannot broadcast notification: WebSocket not initialized");
    return;
  }

  io.to(`user-${notification.userId}`).emit("execution-notification", notification);
}

export function getWebSocketServer() {
  return io;
}

export function getIO(): SocketIOServer | null {
  return io;
}

export function broadcastToScript(scriptId: number, event: string, data: unknown) {
  io?.to(`script-${scriptId}`).emit(event, data);
}
