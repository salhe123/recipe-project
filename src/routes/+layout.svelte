<script lang="ts">
  import '../app.css';
  import { page } from '$app/stores';
  import { auth } from '$lib/stores/auth';
  import { theme } from '$lib/stores/theme';
  import { onMount } from 'svelte';
  interface Props {
    children?: import('svelte').Snippet;
  }

  let { children }: Props = $props();
  
  let currentUser = $state(null);
  let currentTheme = $state('light');
  
  // Subscribe to stores
  $effect(() => {
    const unsubscribeAuth = auth.subscribe(user => {
      currentUser = user;
    });
    
    const unsubscribeTheme = theme.subscribe(t => {
      currentTheme = t;
      if (typeof document !== 'undefined') {
        document.documentElement.classList.toggle('dark', t === 'dark');
      }
    });
    
    return () => {
      unsubscribeAuth();
      unsubscribeTheme();
    };
  });
  
  onMount(() => {
    // Initialize theme from localStorage
    const savedTheme = localStorage.getItem('theme') || 'light';
    theme.set(savedTheme as 'light' | 'dark');
  });
  
  function toggleTheme() {
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    theme.set(newTheme);
  }
  
  function handleLogout() {
    auth.logout();
  }
</script>

<div class="min-h-screen bg-background text-foreground">
  <!-- Navigation Header -->
  <header class="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
    <div class="container flex h-16 items-center justify-between px-4">
      <div class="flex items-center gap-6">
        <a href="/" class="flex items-center gap-2">
          <div class="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <span class="text-primary-foreground font-bold text-lg">R</span>
          </div>
          <span class="font-bold text-xl">RecipeShare</span>
        </a>
        
        <nav class="hidden md:flex items-center gap-6">
          <a href="/" class="text-sm font-medium hover:text-primary transition-colors">
            Home
          </a>
          <a href="/recipes" class="text-sm font-medium hover:text-primary transition-colors">
            Recipes
          </a>
          {#if currentUser}
            <a href="/create" class="text-sm font-medium hover:text-primary transition-colors">
              Create Recipe
            </a>
            <a href="/profile" class="text-sm font-medium hover:text-primary transition-colors">
              My Profile
            </a>
            {#if currentUser.role === 'admin'}
              <a href="/admin" class="text-sm font-medium hover:text-primary transition-colors">
                Admin
              </a>
            {/if}
          {/if}
        </nav>
      </div>
      
      <div class="flex items-center gap-4">
        <!-- Theme Toggle -->
        <button
          onclick={toggleTheme}
          class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-10 w-10"
        >
          {#if currentTheme === 'light'}
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          {:else}
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          {/if}
        </button>
        
        {#if currentUser}
          <div class="flex items-center gap-3">
            <img 
              src={currentUser.avatar || "/placeholder.svg"} 
              alt={currentUser.name}
              class="h-8 w-8 rounded-full"
            />
            <span class="text-sm font-medium hidden sm:block">{currentUser.name}</span>
            <button
              onclick={handleLogout}
              class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-destructive text-destructive-foreground hover:bg-destructive/90 h-9 px-3"
            >
              Logout
            </button>
          </div>
        {:else}
          <div class="flex items-center gap-2">
            <a 
              href="/login"
              class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3"
            >
              Login
            </a>
            <a 
              href="/signup"
              class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-3"
            >
              Sign Up
            </a>
          </div>
        {/if}
      </div>
    </div>
  </header>
  
  <!-- Main Content -->
  <main class="flex-1">
    {@render children?.()}
  </main>
  
  <!-- Footer -->
  <footer class="border-t bg-muted/50">
    <div class="container py-8 px-4">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div class="space-y-3">
          <div class="flex items-center gap-2">
            <div class="h-6 w-6 rounded bg-primary flex items-center justify-center">
              <span class="text-primary-foreground font-bold text-sm">R</span>
            </div>
            <span class="font-bold">RecipeShare</span>
          </div>
          <p class="text-sm text-muted-foreground">
            Share and discover amazing recipes from around the world.
          </p>
        </div>
        
        <div class="space-y-3">
          <h4 class="text-sm font-semibold">Recipes</h4>
          <ul class="space-y-2 text-sm text-muted-foreground">
            <li><a href="/recipes?tag=breakfast" class="hover:text-foreground">Breakfast</a></li>
            <li><a href="/recipes?tag=lunch" class="hover:text-foreground">Lunch</a></li>
            <li><a href="/recipes?tag=dinner" class="hover:text-foreground">Dinner</a></li>
            <li><a href="/recipes?tag=dessert" class="hover:text-foreground">Desserts</a></li>
          </ul>
        </div>
        
        <div class="space-y-3">
          <h4 class="text-sm font-semibold">Community</h4>
          <ul class="space-y-2 text-sm text-muted-foreground">
            <li><a href="/about" class="hover:text-foreground">About</a></li>
            <li><a href="/contact" class="hover:text-foreground">Contact</a></li>
            <li><a href="/help" class="hover:text-foreground">Help</a></li>
          </ul>
        </div>
        
        <div class="space-y-3">
          <h4 class="text-sm font-semibold">Legal</h4>
          <ul class="space-y-2 text-sm text-muted-foreground">
            <li><a href="/privacy" class="hover:text-foreground">Privacy Policy</a></li>
            <li><a href="/terms" class="hover:text-foreground">Terms of Service</a></li>
          </ul>
        </div>
      </div>
      
      <div class="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
        <p>&copy; 2024 RecipeShare. All rights reserved.</p>
      </div>
    </div>
  </footer>
</div>
