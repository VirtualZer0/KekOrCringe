import { markRaw, type Component } from 'vue';
import { toast } from 'vue-sonner';
import AppToast from '@/components/AppToast.vue';

export type ToastTone = 'success' | 'error' | 'warning' | 'info';

export type NotifyOptions = {
  description?: string;
  duration?: number;
  action?: { label: string; onClick: () => void };
};

const RawAppToast = markRaw(AppToast as Component);

const show = (type: ToastTone, title: string, opts: NotifyOptions = {}) =>
  toast.custom(RawAppToast, {
    duration: opts.duration,
    componentProps: {
      type,
      title,
      description: opts.description,
      action: opts.action,
    },
  });

export const notify = {
  success: (title: string, opts?: NotifyOptions) =>
    show('success', title, opts),
  error: (title: string, opts?: NotifyOptions) => show('error', title, opts),
  warning: (title: string, opts?: NotifyOptions) =>
    show('warning', title, opts),
  info: (title: string, opts?: NotifyOptions) => show('info', title, opts),
  dismiss: toast.dismiss,
};
