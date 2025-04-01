import { Toast, ToastActionElement, ToastProps } from "@/components/ui/toast";
import {
  useToast as useToastImpl,
  type ToastOptions as ToastOptionsImpl,
} from "@/components/ui/use-toast";

type ToastOptions = Omit<ToastOptionsImpl, "title"> & {
  title: string;
  description?: React.ReactNode;
  action?: ToastActionElement;
};

export function useToast() {
  const { toast: toastImpl, dismiss, update } = useToastImpl();

  return {
    toast: ({ title, description, action, ...props }: ToastOptions) => {
      return toastImpl({ title, description, action, ...props } as ToastProps);
    },
    dismiss,
    update,
  };
}
