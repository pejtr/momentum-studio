import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createServer, type Server as HttpServer } from "http";
import { io as createClient, type Socket as ClientSocket } from "socket.io-client";

const { authenticateRequestMock, getScriptByIdMock } = vi.hoisted(() => ({
  authenticateRequestMock: vi.fn(),
  getScriptByIdMock: vi.fn(),
}));

vi.mock("./sdk", () => ({
  sdk: { authenticateRequest: authenticateRequestMock },
}));

vi.mock("../db", () => ({
  getScriptById: getScriptByIdMock,
}));

import { getIO, initializeWebSocket } from "./websocket";

const trustedOrigin = "https://omnimatrix.manus.space";
let httpServer: HttpServer;
let baseUrl: string;
const clients: ClientSocket[] = [];

function authenticatedUser(id = 990001) {
  return {
    id,
    openId: `socket-test-${id}`,
    name: "Socket Test User",
    email: null,
    loginMethod: "manus",
    role: "user" as const,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };
}

function connect(origin = trustedOrigin) {
  return new Promise<ClientSocket>((resolve, reject) => {
    const client = createClient(baseUrl, {
      transports: ["websocket"],
      extraHeaders: { origin },
      forceNew: true,
      timeout: 2_000,
    });
    clients.push(client);
    client.once("connect", () => resolve(client));
    client.once("connect_error", reject);
  });
}

function once<T>(client: ClientSocket, event: string) {
  return new Promise<T>((resolve) => client.once(event, resolve));
}

beforeEach(async () => {
  authenticateRequestMock.mockReset();
  getScriptByIdMock.mockReset();
  authenticateRequestMock.mockResolvedValue(authenticatedUser());
  httpServer = createServer();
  initializeWebSocket(httpServer);
  await new Promise<void>((resolve) => httpServer.listen(0, "127.0.0.1", resolve));
  const address = httpServer.address();
  if (!address || typeof address === "string") throw new Error("Test server did not bind to a TCP port");
  baseUrl = `http://127.0.0.1:${address.port}`;
});

afterEach(async () => {
  clients.splice(0).forEach((client) => client.disconnect());
  await new Promise<void>((resolve) => getIO()?.close(() => resolve()));
  await new Promise<void>((resolve) => httpServer.close(() => resolve()));
});

describe("WebSocket authorization", () => {
  it("rejects an anonymous handshake", async () => {
    authenticateRequestMock.mockRejectedValue(new Error("missing session"));
    const client = createClient(baseUrl, {
      transports: ["websocket"],
      extraHeaders: { origin: trustedOrigin },
      forceNew: true,
      timeout: 2_000,
    });
    clients.push(client);

    const error = await once<Error>(client, "connect_error");
    expect(error.message).toBe("Authentication required");
  });

  it("rejects a script room that is not owned by the authenticated user", async () => {
    getScriptByIdMock.mockResolvedValue(undefined);
    const client = await connect();
    const error = once<{ code: string }>(client, "collaboration-error");

    client.emit("join-script", 321);

    await expect(error).resolves.toEqual({ code: "FORBIDDEN" });
    expect(getScriptByIdMock).toHaveBeenCalledWith(321, 990001);
  });

  it("permits an owned room and overwrites spoofed collaboration identity", async () => {
    getScriptByIdMock.mockResolvedValue({ id: 321 });
    const sender = await connect();
    const receiver = await connect();

    const senderJoined = once<{ scriptId: number }>(sender, "script-joined");
    sender.emit("join-script", 321);
    await expect(senderJoined).resolves.toEqual({ scriptId: 321 });

    const receiverJoined = once<{ scriptId: number }>(receiver, "script-joined");
    receiver.emit("join-script", 321);
    await expect(receiverJoined).resolves.toEqual({ scriptId: 321 });

    const cursorUpdate = once<{ userId: number; userName: string; scriptId: number }>(receiver, "cursor-update");
    sender.emit("cursor-move", {
      scriptId: 321,
      x: 10,
      y: 20,
      userId: 123456,
      userName: "spoofed identity",
    });

    await expect(cursorUpdate).resolves.toMatchObject({
      scriptId: 321,
      userId: 990001,
      userName: "Socket Test User",
    });
  });
});
