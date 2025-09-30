<script lang="ts">
  import "../app.css";
  import { page } from "$app/stores";
  import { auth } from "$lib/stores/auth";
  import { theme } from "$lib/stores/theme";
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { toast } from 'svelte-sonner';

  interface User {
    userID: string;
    email: string;
    username: string;
    avatar?: string;
    role: 'user' | 'admin';
    createdAt?: Date;
    exp?: number;
  }

  interface Props {
    children?: import("svelte").Snippet;
  }

  let { children }: Props = $props();

  let currentUser: User | null = $state(null);
  let currentTheme = $state("light");

  $effect(() => {
    const unsubscribeAuth = auth.subscribe((user) => {
      currentUser = user;
    });

    const unsubscribeTheme = theme.subscribe((t) => {
      currentTheme = t;
      if (typeof document !== "undefined") {
        document.documentElement.classList.toggle("dark", t === "dark");
      }
    });

    return () => {
      unsubscribeAuth();
      unsubscribeTheme();
    };
  });

  onMount(async () => {
    const savedTheme = localStorage.getItem("theme") || "light";
    theme.set(savedTheme as "light" | "dark");
    await auth.checkAuth();
  });

  function toggleTheme() {
    const newTheme = currentTheme === "light" ? "dark" : "light";
    theme.set(newTheme);
  }

  function handleLogout() {
    auth.logout();
    toast.success('Logged out successfully!');
    goto("/login");
  }

  let isAuthPage = $derived($page.url.pathname === '/login' || $page.url.pathname === '/signup');
</script>

<div class="min-h-screen bg-background text-foreground">
  <header
    class="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
  >
    <div class="container flex h-16 items-center px-4">
      <div class="flex items-center gap-6">
        <a href="/" class="flex items-center gap-2">
          <div
            class="h-8 w-8 rounded-lg bg-primary flex items-center justify-center"
          >
            <span class="text-primary-foreground font-bold text-lg">R</span>
          </div>
          <span class="font-bold text-xl">RecipeShare</span>
        </a>

        <nav class="hidden md:flex items-center gap-6">
          <a
            href="/"
            class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 {$page.url.pathname === '/' ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'hover:text-primary'} h-9 px-3"
          >
            Home
          </a>
          <a
            href="/recipes"
            class="text-sm font-medium transition-colors {$page.url.pathname === '/recipes' ? 'text-primary font-bold' : 'hover:text-primary'}"
          >
            Recipes
          </a>
          {#if currentUser && !isAuthPage}
            <a
              href="/create"
              class="text-sm font-medium transition-colors {$page.url.pathname === '/create' ? 'text-primary font-bold' : 'hover:text-primary'}"
            >
              Create Recipe
            </a>
            <a
              href="/profile"
              class="text-sm font-medium transition-colors {$page.url.pathname === '/profile' ? 'text-primary font-bold' : 'hover:text-primary'}"
            >
              My Profile
            </a>
            {#if currentUser?.role === "admin"}
              <a
                href="/admin"
                class="text-sm font-medium transition-colors {$page.url.pathname === '/admin' ? 'text-primary font-bold' : 'hover:text-primary'}"
              >
                Admin
              </a>
            {/if}
          {/if}
        </nav>
      </div>

      <div class="flex items-center gap-4 ml-auto">
        <button
          onclick={toggleTheme}
          class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-10 w-10"
        >
          {#if currentTheme === "light"}
            <svg
              class="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
              />
            </svg>
          {:else}
            <svg
              class="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
          {/if}
        </button>

        {#if currentUser && !isAuthPage}
          <div class="flex items-center gap-3">
            <img
              src={currentUser.avatar || "/placeholder.svg"}
              alt={currentUser.username || 'User'}
              class="h-8 w-8 rounded-full"
            />
            <span class="text-sm font-medium hidden sm:block"
              >{currentUser.username || 'User'}</span
            >
            <button
              onclick={handleLogout}
              class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-destructive text-destructive-foreground hover:bg-destructive/90 h-9 px-3"
            >
              Logout
            </button>
          </div>
        {:else if !isAuthPage}
          <div class="flex items-center gap-2">
            <a
              href="/login"
              class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3 {$page.url.pathname === '/login' ? 'bg-accent text-accent-foreground' : ''}"
            >
              Login
            </a>
            <a
              href="/signup"
              class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-3 {$page.url.pathname === '/signup' ? 'bg-primary/90' : ''}"
            >
              Sign Up
            </a>
          </div>
        {/if}
      </div>
    </div>
  </header>
  <main class="flex-1">
    {@render children?.()}
  </main>
  <footer class="bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-t border-gray-200 dark:border-gray-700">
    <div class="container mx-auto px-4 py-12 flex flex-col items-center space-y-12">
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 w-full text-center md:text-left">
        <div class="space-y-3 flex flex-col items-center md:items-start">
          <div class="flex items-center gap-2">
            <div class="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span class="text-primary-foreground font-bold text-lg">R</span>
            </div>
            <span class="font-bold text-lg">RecipeShare</span>
          </div>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            Share and discover amazing recipes from around the world.
          </p>
        </div>
        <div class="space-y-3">
          <h4 class="text-sm font-semibold text-gray-900 dark:text-gray-100">Recipes</h4>
          <ul class="space-y-2 text-sm">
            <li><a href="/recipes?tag=breakfast" class="hover:text-primary transition-colors">Breakfast</a></li>
            <li><a href="/recipes?tag=lunch" class="hover:text-primary transition-colors">Lunch</a></li>
            <li><a href="/recipes?tag=dinner" class="hover:text-primary transition-colors">Dinner</a></li>
            <li><a href="/recipes?tag=dessert" class="hover:text-primary transition-colors">Desserts</a></li>
          </ul>
        </div>
        <div class="space-y-3">
          <h4 class="text-sm font-semibold text-gray-900 dark:text-gray-100">Community</h4>
          <ul class="space-y-2 text-sm">
            <li><a href="/about" class="hover:text-primary transition-colors">About</a></li>
            <li><a href="/contact" class="hover:text-primary transition-colors">Contact</a></li>
            <li><a href="/help" class="hover:text-primary transition-colors">Help</a></li>
          </ul>
        </div>
        <div class="space-y-3">
          <h4 class="text-sm font-semibold text-gray-900 dark:text-gray-100">Legal</h4>
          <ul class="space-y-2 text-sm">
            <li><a href="/privacy" class="hover:text-primary transition-colors">Privacy Policy</a></li>
            <li><a href="/terms" class="hover:text-primary transition-colors">Terms of Service</a></li>
          </ul>
        </div>
      </div>
      <div class="border-t border-gray-200 dark:border-gray-700 pt-6 w-full text-center text-sm text-gray-500 dark:text-gray-400">
        <p>&copy; 2025 RecipeShare. All rights reserved.</p>
      </div>
    </div>
  </footer>
</div>