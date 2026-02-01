import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { auth, getAccessToken } from '../utils/osmAuth'
import type { User } from '../types'
import { STORAGE_KEYS } from '../constants'

interface AuthContextType {
  user: User | null
  token: string | null
  login: (user: User, token: string) => void
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    const storedUser = localStorage.getItem(STORAGE_KEYS.OSM_USER)
    const storedToken = getAccessToken()

    if (storedUser && storedToken && auth.authenticated()) {
      setUser(JSON.parse(storedUser))
      setToken(storedToken)
    } else if (!auth.authenticated()) {
      setUser(null)
      setToken(null)
      localStorage.removeItem(STORAGE_KEYS.OSM_USER)
    }
  }, [])

  const login = (userData: User, userToken: string) => {
    setUser(userData)
    setToken(userToken)
    localStorage.setItem(STORAGE_KEYS.OSM_USER, JSON.stringify(userData))
  }

  const logout = () => {
    auth.logout()
    setUser(null)
    setToken(null)
    localStorage.removeItem(STORAGE_KEYS.OSM_USER)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        isAuthenticated: !!user && !!token && auth.authenticated(),
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
