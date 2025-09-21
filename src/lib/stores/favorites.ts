import { writable } from "svelte/store"

function createFavoritesStore() {
  const { subscribe, set, update } = writable<string[]>([])

  return {
    subscribe,
    addFavorite: (recipeId: string) => {
      update((favorites) => (favorites.includes(recipeId) ? favorites : [...favorites, recipeId]))
    },
    removeFavorite: (recipeId: string) => {
      update((favorites) => favorites.filter((id) => id !== recipeId))
    },
    toggleFavorite: (recipeId: string) => {
      update((favorites) =>
        favorites.includes(recipeId) ? favorites.filter((id) => id !== recipeId) : [...favorites, recipeId],
      )
    },
    isFavorite: (recipeId: string, favorites: string[]) => {
      return favorites.includes(recipeId)
    },
  }
}

export const favorites = createFavoritesStore()
