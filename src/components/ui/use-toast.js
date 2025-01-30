import { useEffect, useState } from "react"

const TOAST_TIMEOUT = 5000

export function useToast() {
  const [toasts, setToasts] = useState([])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (toasts.length > 0) {
        setToasts((prevToasts) => prevToasts.slice(1))
      }
    }, TOAST_TIMEOUT)

    return () => clearTimeout(timer)
  }, [toasts])

  function toast({ title, description, variant = "default" }) {
    setToasts((prevToasts) => [
      ...prevToasts,
      { id: Math.random(), title, description, variant },
    ])
  }

  return { toast, toasts }
}

export { ToastProvider, ToastViewport } from "./toast" 