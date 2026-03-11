import { WebSocketServer, WebSocket } from "ws";
import type { Server } from "http";

interface TicketConnection {
  ws: WebSocket;
  ticketId: number;
  role: "user" | "admin";
}

const connectionsByTicket = new Map<number, Set<TicketConnection>>();
const connectionBySocket = new Map<WebSocket, TicketConnection>();

export function setupTicketWebSocket(server: Server) {
  const wss = new WebSocketServer({ server, path: "/ws/tickets" });

  wss.on("connection", (ws) => {
    ws.on("message", (data) => {
      try {
        const msg = JSON.parse(data.toString());

        if (msg.type === "join" && typeof msg.ticketId === "number") {
          const existing = connectionBySocket.get(ws);
          if (existing) {
            const ticketConns = connectionsByTicket.get(existing.ticketId);
            if (ticketConns) {
              ticketConns.delete(existing);
              if (ticketConns.size === 0) connectionsByTicket.delete(existing.ticketId);
            }
          }

          const role = msg.role === "admin" ? "admin" as const : "user" as const;
          const conn: TicketConnection = { ws, ticketId: msg.ticketId, role };
          connectionBySocket.set(ws, conn);

          if (!connectionsByTicket.has(msg.ticketId)) {
            connectionsByTicket.set(msg.ticketId, new Set());
          }
          connectionsByTicket.get(msg.ticketId)!.add(conn);
        }
      } catch {
        // ignore malformed messages
      }
    });

    const cleanup = () => {
      const conn = connectionBySocket.get(ws);
      if (conn) {
        const ticketConns = connectionsByTicket.get(conn.ticketId);
        if (ticketConns) {
          ticketConns.delete(conn);
          if (ticketConns.size === 0) connectionsByTicket.delete(conn.ticketId);
        }
        connectionBySocket.delete(ws);
      }
    };

    ws.on("close", cleanup);
    ws.on("error", cleanup);
  });

  console.log("[WebSocket] Ticket WebSocket server ready on /ws/tickets");
  return wss;
}

export function broadcastTicketUpdate(ticketId: number, ticket: any) {
  const conns = connectionsByTicket.get(ticketId);
  if (!conns) return;

  const payload = JSON.stringify({
    type: "ticket_update",
    ticketId,
    ticket,
  });

  for (const conn of conns) {
    if (conn.ws.readyState === WebSocket.OPEN) {
      conn.ws.send(payload);
    }
  }
}

export function broadcastNewMessage(ticketId: number, message: { sender: string; text: string; timestamp: string }, ticket: any) {
  const conns = connectionsByTicket.get(ticketId);
  if (!conns) return;

  const payload = JSON.stringify({
    type: "new_message",
    ticketId,
    message,
    ticket,
  });

  for (const conn of conns) {
    if (conn.ws.readyState === WebSocket.OPEN) {
      conn.ws.send(payload);
    }
  }
}
