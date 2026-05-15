import tmi from 'tmi.js';
let chat: tmi.Client | null = null;
let connected = false;
let connecting = false;
let reconnectAttempts = 0;
let reconnectTimer: number | null = null;
// Tracks whether the current outage has already surfaced an error toast.
// Reset on every successful connection.
let errorFired = false;

const RECONNECT_DELAYS_MS = [500, 1000, 2000, 5000, 10000, 30000];

const events: {
  onReward: ((user: string, msg: string, rewardId: string) => void)[];
  onMessage: ((user: string, msg: string) => void)[];
  onBits: ((user: string, msg: string, count: number) => void)[];
  onConnected: (() => void)[];
  onError: ((message: string) => void)[];
} = {
  onReward: [],
  onMessage: [],
  onBits: [],
  onConnected: [],
  onError: [],
};

const fireError = (message: string) => {
  if (errorFired) return;
  errorFired = true;
  events.onError.forEach((ev) => ev(message));
};

const cancelReconnect = () => {
  if (reconnectTimer !== null) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
};

export const useChat = () => {
  const connect = async () => {
    if (connected || connecting || !chat) return;
    connecting = true;
    try {
      await chat.connect();
      // 'connected' event handler will flip `connected` and reset state.
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      fireError(message);
      // tmi may not emit 'disconnected' on initial connect failure — retry ourselves.
      scheduleReconnect();
    } finally {
      connecting = false;
    }
  };

  const scheduleReconnect = () => {
    cancelReconnect();
    if (!chat) return;
    const delay =
      RECONNECT_DELAYS_MS[
        Math.min(reconnectAttempts, RECONNECT_DELAYS_MS.length - 1)
      ];
    reconnectAttempts++;
    reconnectTimer = window.setTimeout(() => {
      reconnectTimer = null;
      connect();
    }, delay);
  };

  const disposeCurrent = () => {
    cancelReconnect();
    if (chat) {
      try {
        chat.removeAllListeners();
      } catch {
        // ignore
      }
      chat.disconnect().catch(() => {
        // ignore disconnect errors (already disconnected, etc.)
      });
    }
    chat = null;
    connected = false;
    connecting = false;
    reconnectAttempts = 0;
    errorFired = false;
  };

  const create = (channel: string) => {
    disposeCurrent();

    chat = new tmi.Client({
      channels: [channel],
    });

    chat.on('connected', () => {
      connected = true;
      reconnectAttempts = 0;
      errorFired = false;
      events.onConnected.forEach((ev) => ev());
    });

    chat.on('message', (ch, context, message) => {
      if (context['custom-reward-id']) {
        events.onReward.forEach((ev) =>
          ev(
            context['display-name'] ?? '',
            message,
            context['custom-reward-id'],
          ),
        );
      } else {
        events.onMessage.forEach((ev) =>
          ev(context['display-name'] ?? '', message),
        );
      }
    });

    chat.on('cheer', (ch, context, message) => {
      events.onBits.forEach((ev) =>
        ev(
          context['display-name'] ?? '',
          message,
          parseInt(context.bits ?? '0'),
        ),
      );
    });

    chat.on('disconnected', (reason) => {
      connected = false;
      // chat == null means an intentional destroy() — don't retry or toast.
      if (!chat) return;
      const detail = reason ? String(reason) : 'unknown reason';
      fireError(detail);
      scheduleReconnect();
    });
  };

  const destroy = () => {
    disposeCurrent();
  };

  const on = (
    type: 'Reward' | 'Message' | 'Bits' | 'Connected' | 'Error',
    cb: (...args: any) => void,
  ) => {
    events[`on${type}`].push(cb);
  };

  const off = (
    type: 'Reward' | 'Message' | 'Bits' | 'Connected' | 'Error',
    cb: (...args: any) => void,
  ) => {
    const index = events[`on${type}`].indexOf(cb);
    if (index > -1) {
      events[`on${type}`].splice(index, 1);
    }
  };

  return {
    create,
    connect,
    destroy,
    on,
    off,
  };
};
