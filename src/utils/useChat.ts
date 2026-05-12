import tmi from 'tmi.js';
let chat: tmi.Client | null = null;
let connected = false;
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

export const useChat = () => {
  const connect = async () => {
    if (connected) return;
    try {
      await chat?.connect();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      events.onError.forEach((ev) => ev(message));
    }
  };

  const disposeCurrent = () => {
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
  };

  const create = (channel: string) => {
    disposeCurrent();

    chat = new tmi.Client({
      channels: [channel],
    });

    chat.on('connected', () => {
      connected = true;
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
      const detail = reason ? String(reason) : 'unknown reason';
      events.onError.forEach((ev) => ev(detail));
      setTimeout(connect, 500);
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
