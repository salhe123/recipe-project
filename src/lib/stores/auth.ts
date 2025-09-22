import { writable } from "svelte/store"

export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  role: "user" | "admin"
  createdAt: Date
}

// Dummy users for testing
const dummyUsers: User[] = [
  {
    id: "1",
    email: "john@example.com",
    name: "John Doe",
    avatar: "/diverse-chef-preparing-food.png",
    role: "user",
    createdAt: new Date("2024-01-15"),
  },
  {
    id: "2",
    email: "admin@example.com",
    name: "Admin User",
    avatar: "/admin-interface.png",
    role: "admin",
    createdAt: new Date("2024-01-01"),
  },
]

function createAuthStore() {
  const { subscribe, set, update } = writable<User | null>(null)

  return {
    subscribe,
    login: async (email: string, password: string) => {
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const user = dummyUsers.find((u) => u.email === email)
      if (user && password === "password") {
        set(user)
        return { success: true }
      }
      return { success: false, error: "Invalid credentials" }
    },
    signup: async (email: string, password: string, name: string) => {
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const newUser: User = {
        id: Date.now().toString(),
        email,
        name,
        avatar: "/abstract-geometric-shapes.png",
        role: "user",
        createdAt: new Date(),
      }

      dummyUsers.push(newUser)
      set(newUser)
      return { success: true }
    },
    logout: () => {
      set(null)
    },
    updateProfile: (updates: Partial<User>) => {
      update((user) => (user ? { ...user, ...updates } : null))
    },
  }
}

export const auth = createAuthStore()
