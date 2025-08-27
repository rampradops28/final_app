import { useState, useEffect } from "react"
import { apiRequest } from "@/lib/queryClient"

export function useAuth() {
  const [authState, setAuthState] = useState({
    user: null,
    sessionId: null,
    isAuthenticated: false,
    isLoading: true,
  })

  useEffect(() => {
    // Check if user is already logged in (from localStorage)
    const storedUser = localStorage.getItem("user")
    const storedSessionId = localStorage.getItem("sessionId")
    
    if (storedUser && storedSessionId) {
      setAuthState({
        user: JSON.parse(storedUser),
        sessionId: storedSessionId,
        isAuthenticated: true,
        isLoading: false,
      })
    } else {
      setAuthState((prev) => ({ ...prev, isLoading: false }))
    }
  }, [])

  const login = async (username, password) => {
    try {
      const response = await apiRequest("POST", "/api/auth/login", {
        username,
        password,
      })
      
      const data = await response.json()
      
      setAuthState({
        user: data.user,
        sessionId: data.sessionId,
        isAuthenticated: true,
        isLoading: false,
      })

      // Store in localStorage for persistence
      localStorage.setItem("user", JSON.stringify(data.user))
      localStorage.setItem("sessionId", data.sessionId)
      
      return { success: true }
    } catch (error) {
      console.error("Login error:", error)
      return { success: false, error: error instanceof Error ? error.message : "Login failed" }
    }
  }

  const logout = () => {
    setAuthState({
      user: null,
      sessionId: null,
      isAuthenticated: false,
      isLoading: false,
    })
    
    localStorage.removeItem("user")
    localStorage.removeItem("sessionId")
  }

  return {
    ...authState,
    login,
    logout,
  }
}
