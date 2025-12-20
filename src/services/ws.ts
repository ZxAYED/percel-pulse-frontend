export type WsAuthMessage = { type: "auth"; token: string };
export type WsJoinMessage = { type: "join"; parcelId: string };
export type WsAgentLocationUpdateMessage = {
  type: "agent_location_update";
  parcelId: string;
  latitude: number;
  longitude: number;
  speedKph?: number;
  heading?: number;
};

export type WsParcelLocationMessage = {
  type: "parcel_location";
  parcelId: string;
  latitude: number;
  longitude: number;
  speedKph?: number;
  heading?: number;
  recordedAt: string;
};

export type WsMessage = WsParcelLocationMessage | { type: string; [key: string]: unknown };

function getWsUrl(): string {
  const configured = (import.meta.env.VITE_BACKEND_WS_URL as string | undefined)?.trim();
  if (configured) {
    try {
      const direct = new URL(configured);
      if (!direct.pathname || direct.pathname === "/") direct.pathname = "/ws";
      return direct.toString();
    } catch {
      // fall through to resolve relative to origin
    }
  }

  // Fallback: same host as the current page. In dev we default to :5000 unless a port is already present.
  const base = new URL(window.location.origin);
  const secure = base.protocol === "https:";
  const ws = new URL(base.toString());
  ws.protocol = secure ? "wss:" : "ws:";
  if (!secure && !ws.port) {
    ws.port = "5000";
  }
  ws.pathname = "/ws";
  ws.search = "";
  ws.hash = "";
  return ws.toString();
}

function parseLooseMessage(raw: string): WsMessage | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
    try {
      const parsed = JSON.parse(trimmed) as unknown;
      if (parsed && typeof parsed === "object") return parsed as WsMessage;
    } catch {
      return null;
    }
  }

  const parts = trimmed.split(",").map((p) => p.trim()).filter(Boolean);
  const obj: Record<string, unknown> = {};
  for (const part of parts) {
    const [k, ...rest] = part.split("=");
    const key = (k ?? "").trim();
    if (!key) continue;
    const valueRaw = rest.join("=").trim();
    const num = Number(valueRaw);
    obj[key] = valueRaw !== "" && Number.isFinite(num) ? num : valueRaw;
  }
  if (!obj.type) return null;
  return obj as WsMessage;
}

type ClientOpts = {
  token: string;
  onMessage?: (msg: WsMessage) => void;
  onOpen?: () => void;
  onClose?: (ev: CloseEvent) => void;
  onError?: (ev: Event) => void;
};

export function createWsClient(opts: ClientOpts) {
  let ws: WebSocket | null = null;
  let closedByUser = false;
  let reconnectTimer: number | null = null;
  const queue: string[] = [];

  const flush = () => {
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    while (queue.length) {
      const msg = queue.shift();
      if (msg) ws.send(msg);
    }
  };

  const send = (payload: unknown) => {
    const encoded = typeof payload === "string" ? payload : JSON.stringify(payload);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(encoded);
      return;
    }
    queue.push(encoded);
  };

  const connect = () => {
    closedByUser = false;
    if (reconnectTimer) {
      window.clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
    if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) return;
    ws = new WebSocket(getWsUrl());
    ws.onopen = () => {
      send({ type: "auth", token: opts.token } satisfies WsAuthMessage);
      flush();
      opts.onOpen?.();
    };
    ws.onmessage = (event) => {
      const msg =
        typeof event.data === "string"
          ? parseLooseMessage(event.data)
          : event.data && typeof event.data === "object"
            ? (event.data as WsMessage)
            : null;
      if (msg) opts.onMessage?.(msg);
    };
    ws.onerror = (ev) => {
      opts.onError?.(ev);
    };
    ws.onclose = (ev) => {
      opts.onClose?.(ev);
      if (closedByUser) return;
      reconnectTimer = window.setTimeout(() => {
        connect();
      }, 2000);
    };
  };

  const close = () => {
    closedByUser = true;
    if (reconnectTimer) {
      window.clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
    if (ws) ws.close();
    ws = null;
  };

  const joinParcel = (parcelId: string) => {
    send({ type: "join", parcelId } satisfies WsJoinMessage);
  };

  const sendAgentLocationUpdate = (payload: Omit<WsAgentLocationUpdateMessage, "type">) => {
    send({ type: "agent_location_update", ...payload } satisfies WsAgentLocationUpdateMessage);
  };

  return { connect, close, joinParcel, sendAgentLocationUpdate };
}
