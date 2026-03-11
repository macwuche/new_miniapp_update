import { useEffect, useRef, useCallback, useState } from "react";

interface TicketMessage {
  sender: "user" | "admin";
  text: string;
  timestamp: string;
}

interface UseTicketWebSocketOptions {
  ticketId: number | null;
  role: "user" | "admin";
  onNewMessage?: (message: TicketMessage, ticket: any) => void;
  onTicketUpdate?: (ticket: any) => void;
}

export function useTicketWebSocket({ ticketId, role, onNewMessage, onTicketUpdate }: UseTicketWebSocketOptions) {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [connected, setConnected] = useState(false);

  const onNewMessageRef = useRef(onNewMessage);
  const onTicketUpdateRef = useRef(onTicketUpdate);
  onNewMessageRef.current = onNewMessage;
  onTicketUpdateRef.current = onTicketUpdate;

  const connect = useCallback(() => {
    if (!ticketId) return;

    if (wsRef.current && (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING)) {
      return;
    }

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const ws = new WebSocket(`${protocol}//${window.location.host}/ws/tickets`);
    wsRef.current = ws;

    ws.onopen = () => {
      setConnected(true);
      ws.send(JSON.stringify({ type: "join", ticketId, role }));
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === "new_message" && data.ticketId === ticketId) {
          onNewMessageRef.current?.(data.message, data.ticket);
        }

        if (data.type === "ticket_update" && data.ticketId === ticketId) {
          onTicketUpdateRef.current?.(data.ticket);
        }
      } catch {
        // ignore
      }
    };

    ws.onclose = () => {
      setConnected(false);
      if (ticketId) {
        reconnectTimerRef.current = setTimeout(() => {
          connect();
        }, 3000);
      }
    };

    ws.onerror = () => {
      ws.close();
    };
  }, [ticketId, role]);

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      setConnected(false);
    };
  }, [connect]);

  return { connected };
}
