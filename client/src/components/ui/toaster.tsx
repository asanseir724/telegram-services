import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import * as React from "react"

// Define a simpler structure that matches what we need
interface ToastItem {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: React.ReactElement
  open?: boolean
  [key: string]: any
}

export function Toaster() {
  // Use a simpler approach to get toasts
  const hookResult = useToast()
  // Safely access toasts or provide empty array
  const toasts = (hookResult as any)?.toasts || []

  return (
    <ToastProvider>
      {Array.isArray(toasts) && toasts.map(function ({ id, title, description, action, ...props }: ToastItem) {
        return (
          <Toast key={id} {...props}>
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
