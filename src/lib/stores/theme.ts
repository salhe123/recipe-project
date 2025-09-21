import { writable } from "svelte/store"
import { browser } from "$app/environment"

type Theme = "light" | "dark"

function createThemeStore() {
  const defaultTheme: Theme = "light"
  const initialTheme = browser ? (localStorage.getItem("theme") as Theme) || defaultTheme : defaultTheme

  const { subscribe, set } = writable<Theme>(initialTheme)

  return {
    subscribe,
    toggle: () => {
      set(initialTheme === "light" ? "dark" : "light")
    },
    set: (theme: Theme) => {
      if (browser) {
        localStorage.setItem("theme", theme)
        document.documentElement.classList.toggle("dark", theme === "dark")
      }
      set(theme)
    },
  }
}

export const theme = createThemeStore()
