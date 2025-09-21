import { writable, derived } from "svelte/store"

export interface Recipe {
  id: string
  title: string
  description: string
  ingredients: string[]
  steps: string[]
  images: string[]
  tags: string[]
  prepTime: number // in minutes
  cookTime: number // in minutes
  servings: number
  difficulty: "easy" | "medium" | "hard"
  authorId: string
  authorName: string
  authorAvatar?: string
  createdAt: Date
  updatedAt: Date
  likes: number
  rating: number
  totalRatings: number
}

export interface Comment {
  id: string
  recipeId: string
  userId: string
  userName: string
  userAvatar?: string
  content: string
  rating: number
  createdAt: Date
}

// Dummy recipes data
const dummyRecipes: Recipe[] = [
  {
    id: "1",
    title: "Classic Chocolate Chip Cookies",
    description: "Soft and chewy chocolate chip cookies that are perfect for any occasion.",
    ingredients: [
      "2 1/4 cups all-purpose flour",
      "1 tsp baking soda",
      "1 tsp salt",
      "1 cup butter, softened",
      "3/4 cup granulated sugar",
      "3/4 cup brown sugar",
      "2 large eggs",
      "2 tsp vanilla extract",
      "2 cups chocolate chips",
    ],
    steps: [
      "Preheat oven to 375°F (190°C).",
      "Mix flour, baking soda, and salt in a bowl.",
      "Cream butter and sugars until fluffy.",
      "Beat in eggs and vanilla.",
      "Gradually mix in flour mixture.",
      "Stir in chocolate chips.",
      "Drop rounded tablespoons onto ungreased baking sheets.",
      "Bake 9-11 minutes until golden brown.",
      "Cool on baking sheet for 2 minutes before removing.",
    ],
    images: ["/chocolate-chip-cookies.png"],
    tags: ["dessert", "cookies", "chocolate", "baking"],
    prepTime: 15,
    cookTime: 11,
    servings: 24,
    difficulty: "easy",
    authorId: "1",
    authorName: "John Doe",
    authorAvatar: "/diverse-chef-preparing-food.png",
    createdAt: new Date("2024-01-20"),
    updatedAt: new Date("2024-01-20"),
    likes: 45,
    rating: 4.8,
    totalRatings: 23,
  },
  {
    id: "2",
    title: "Creamy Mushroom Risotto",
    description: "Rich and creamy risotto with mixed mushrooms and parmesan cheese.",
    ingredients: [
      "1 1/2 cups Arborio rice",
      "4 cups warm chicken broth",
      "1 lb mixed mushrooms, sliced",
      "1 medium onion, diced",
      "3 cloves garlic, minced",
      "1/2 cup white wine",
      "1/2 cup grated Parmesan",
      "3 tbsp butter",
      "2 tbsp olive oil",
      "Salt and pepper to taste",
      "Fresh parsley for garnish",
    ],
    steps: [
      "Heat olive oil in a large pan and sauté mushrooms until golden.",
      "Remove mushrooms and set aside.",
      "In the same pan, melt 1 tbsp butter and sauté onion until translucent.",
      "Add garlic and rice, stirring for 2 minutes.",
      "Pour in wine and stir until absorbed.",
      "Add warm broth one ladle at a time, stirring constantly.",
      "Continue until rice is creamy and tender (about 18-20 minutes).",
      "Stir in mushrooms, remaining butter, and Parmesan.",
      "Season with salt and pepper, garnish with parsley.",
    ],
    images: ["/mushroom-risotto.png"],
    tags: ["dinner", "italian", "mushrooms", "rice", "vegetarian"],
    prepTime: 10,
    cookTime: 25,
    servings: 4,
    difficulty: "medium",
    authorId: "1",
    authorName: "John Doe",
    authorAvatar: "/diverse-chef-preparing-food.png",
    createdAt: new Date("2024-01-18"),
    updatedAt: new Date("2024-01-18"),
    likes: 32,
    rating: 4.6,
    totalRatings: 18,
  },
  {
    id: "3",
    title: "Fresh Garden Salad",
    description: "A vibrant mix of fresh greens, vegetables, and a homemade vinaigrette.",
    ingredients: [
      "4 cups mixed greens",
      "1 cucumber, sliced",
      "2 tomatoes, chopped",
      "1 red onion, thinly sliced",
      "1 bell pepper, chopped",
      "1/4 cup olive oil",
      "2 tbsp balsamic vinegar",
      "1 tsp Dijon mustard",
      "1 tsp honey",
      "Salt and pepper to taste",
    ],
    steps: [
      "Wash and dry all vegetables thoroughly.",
      "Combine mixed greens, cucumber, tomatoes, onion, and bell pepper in a large bowl.",
      "In a small bowl, whisk together olive oil, balsamic vinegar, Dijon mustard, and honey.",
      "Season dressing with salt and pepper.",
      "Drizzle dressing over salad just before serving.",
      "Toss gently to coat all ingredients.",
      "Serve immediately.",
    ],
    images: ["/fresh-garden-salad.jpg"],
    tags: ["salad", "healthy", "vegetarian", "fresh", "quick"],
    prepTime: 15,
    cookTime: 0,
    servings: 4,
    difficulty: "easy",
    authorId: "2",
    authorName: "Admin User",
    authorAvatar: "/admin-interface.png",
    createdAt: new Date("2024-01-22"),
    updatedAt: new Date("2024-01-22"),
    likes: 28,
    rating: 4.4,
    totalRatings: 15,
  },
]

// Dummy comments data
const dummyComments: Comment[] = [
  {
    id: "1",
    recipeId: "1",
    userId: "2",
    userName: "Admin User",
    userAvatar: "/admin-interface.png",
    content: "These cookies turned out amazing! My family loved them.",
    rating: 5,
    createdAt: new Date("2024-01-21"),
  },
  {
    id: "2",
    recipeId: "2",
    userId: "1",
    userName: "John Doe",
    userAvatar: "/diverse-chef-preparing-food.png",
    content: "Perfect risotto recipe. The mushrooms add such great flavor!",
    rating: 5,
    createdAt: new Date("2024-01-19"),
  },
]

function createRecipeStore() {
  const { subscribe, set, update } = writable<Recipe[]>(dummyRecipes)

  return {
    subscribe,
    addRecipe: (recipe: Omit<Recipe, "id" | "createdAt" | "updatedAt" | "likes" | "rating" | "totalRatings">) => {
      const newRecipe: Recipe = {
        ...recipe,
        id: Date.now().toString(),
        createdAt: new Date(),
        updatedAt: new Date(),
        likes: 0,
        rating: 0,
        totalRatings: 0,
      }
      update((recipes) => [...recipes, newRecipe])
      return newRecipe
    },
    updateRecipe: (id: string, updates: Partial<Recipe>) => {
      update((recipes) =>
        recipes.map((recipe) => (recipe.id === id ? { ...recipe, ...updates, updatedAt: new Date() } : recipe)),
      )
    },
    deleteRecipe: (id: string) => {
      update((recipes) => recipes.filter((recipe) => recipe.id !== id))
    },
    likeRecipe: (id: string) => {
      update((recipes) => recipes.map((recipe) => (recipe.id === id ? { ...recipe, likes: recipe.likes + 1 } : recipe)))
    },
  }
}

function createCommentStore() {
  const { subscribe, set, update } = writable<Comment[]>(dummyComments)

  return {
    subscribe,
    addComment: (comment: Omit<Comment, "id" | "createdAt">) => {
      const newComment: Comment = {
        ...comment,
        id: Date.now().toString(),
        createdAt: new Date(),
      }
      update((comments) => [...comments, newComment])
      return newComment
    },
    getCommentsForRecipe: (recipeId: string) => {
      return derived([{ subscribe }], ([$comments]) => $comments.filter((comment) => comment.recipeId === recipeId))
    },
  }
}

export const recipes = createRecipeStore()
export const comments = createCommentStore()

// Search and filter functionality
export const searchQuery = writable("")
export const selectedTags = writable<string[]>([])
export const difficultyFilter = writable<string>("all")
export const sortBy = writable<"newest" | "oldest" | "rating" | "likes">("newest")

export const filteredRecipes = derived(
  [recipes, searchQuery, selectedTags, difficultyFilter, sortBy],
  ([$recipes, $searchQuery, $selectedTags, $difficultyFilter, $sortBy]) => {
    let filtered = $recipes

    // Search by title or description
    if ($searchQuery) {
      filtered = filtered.filter(
        (recipe) =>
          recipe.title.toLowerCase().includes($searchQuery.toLowerCase()) ||
          recipe.description.toLowerCase().includes($searchQuery.toLowerCase()),
      )
    }

    // Filter by tags
    if ($selectedTags.length > 0) {
      filtered = filtered.filter((recipe) => $selectedTags.some((tag) => recipe.tags.includes(tag)))
    }

    // Filter by difficulty
    if ($difficultyFilter !== "all") {
      filtered = filtered.filter((recipe) => recipe.difficulty === $difficultyFilter)
    }

    // Sort recipes
    filtered.sort((a, b) => {
      switch ($sortBy) {
        case "newest":
          return b.createdAt.getTime() - a.createdAt.getTime()
        case "oldest":
          return a.createdAt.getTime() - b.createdAt.getTime()
        case "rating":
          return b.rating - a.rating
        case "likes":
          return b.likes - a.likes
        default:
          return 0
      }
    })

    return filtered
  },
)
