"use client"

import { useEffect } from "react"
import { useAuthStore } from "@/src/store/AuthStore"

export function AuthInitializer({ children }: { children: React.ReactNode }) {
  const initialize = useAuthStore(state => state.initialize)

  useEffect(() => {
    initialize()
  }, [initialize])

  return <>{children}</>
}
