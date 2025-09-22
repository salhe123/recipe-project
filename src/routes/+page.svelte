<script lang="ts">
  import { recipes, type Recipe } from '$lib/stores/recipes';
  import { auth } from '$lib/stores/auth';
  import { favorites } from '$lib/stores/favorites';
  import { derived } from 'svelte/store';
  
  const allRecipes = derived(recipes, $recipes => $recipes);
  const currentUser = derived(auth, $auth => $auth);
  const userFavorites = derived(favorites, $favorites => $favorites);
  
  const featuredRecipes = derived(allRecipes, $allRecipes => 
    $allRecipes.sort((a, b) => b.rating - a.rating).slice(0, 3)
  );
  
  const recentRecipes = derived(allRecipes, $allRecipes => 
    $allRecipes.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, 6)
  );
  
  function toggleFavorite(recipeId: string) {
    favorites.toggleFavorite(recipeId);
  }
  
  function likeRecipe(recipeId: string) {
    recipes.likeRecipe(recipeId);
  }
</script>

<svelte:head>
  <title>RecipeShare - Discover Amazing Recipes</title>
  <meta name="description" content="Share and discover amazing recipes from around the world. Join our community of food lovers!" />
</svelte:head>

<!-- Hero Section -->
<section class="relative min-h-screen flex items-center justify-center py-20 lg:py-32 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
  <div class="container px-4">
    <div class="max-w-4xl mx-auto text-center space-y-8">
      <h1 class="text-4xl lg:text-6xl font-bold text-balance">
        Discover & Share
        <span class="text-primary">Amazing Recipes</span>
      </h1>
      <p class="text-xl text-muted-foreground text-pretty max-w-2xl mx-auto">
        Join our community of food lovers. Share your favorite recipes, discover new flavors, and connect with fellow cooking enthusiasts.
      </p>
      <div class="flex flex-col sm:flex-row gap-4 justify-center">
        <a 
          href="/recipes"
          class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-11 px-8"
        >
          Browse Recipes
        </a>
        {#if $currentUser}
          <a 
            href="/create"
            class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-11 px-8"
          >
            Share Your Recipe
          </a>
        {:else}
          <a 
            href="/signup"
            class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-11 px-8"
          >
            Join Community
          </a>
        {/if}
      </div>
    </div>
  </div>
</section>


<!-- Featured Recipes -->
<section class="min-h-screen flex items-center justify-center py-16 lg:py-24">
  <div class="container px-4">
    <div class="text-center space-y-4 mb-12">
      <h2 class="text-3xl lg:text-4xl font-bold">Featured Recipes</h2>
      <p class="text-muted-foreground text-lg">Top-rated recipes from our community</p>
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
      {#each $featuredRecipes as recipe (recipe.id)}
        <div class="group relative overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm hover:shadow-lg transition-all duration-300">
          <div class="aspect-[4/3] overflow-hidden">
            <img 
              src={recipe.images[0] || "/placeholder.svg"} 
              alt={recipe.title}
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
          
          <div class="p-6 space-y-4">
            <div class="space-y-2">
              <h3 class="text-xl font-semibold line-clamp-2">{recipe.title}</h3>
              <p class="text-muted-foreground text-sm line-clamp-2">{recipe.description}</p>
            </div>
            
            <div class="flex items-center gap-4 text-sm text-muted-foreground">
              <div class="flex items-center gap-1">
                <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span>{recipe.rating.toFixed(1)}</span>
              </div>
              <div class="flex items-center gap-1">
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{recipe.prepTime + recipe.cookTime} min</span>
              </div>
              <div class="flex items-center gap-1">
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span>{recipe.servings} servings</span>
              </div>
            </div>
            
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <img 
                  src={recipe.authorAvatar || "/placeholder.svg"} 
                  alt={recipe.authorName}
                  class="h-6 w-6 rounded-full"
                />
                <span class="text-sm text-muted-foreground">{recipe.authorName}</span>
              </div>
              
              <div class="flex items-center gap-2">
                {#if $currentUser}
                  <button
                    aria-label="Toggle Favorite"
                    onclick={() => toggleFavorite(recipe.id)}
                    class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-8 w-8"
                  >
                    <svg 
                      class="h-4 w-4 { $userFavorites.includes(recipe.id) ? 'fill-red-500 text-red-500' : ''}" 
                      fill={ $userFavorites.includes(recipe.id) ? 'currentColor' : 'none'} 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </button>
                  <button
                    aria-label="Like Recipe"
                    onclick={() => likeRecipe(recipe.id)}
                    class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-8 px-3 gap-1"
                  >
                    <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                    </svg>
                    <span class="text-xs">{recipe.likes}</span>
                  </button>
                {/if}
                <a 
                  href="/recipes/{recipe.id}"
                  class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-8 px-3"
                >
                  View Recipe
                </a>
              </div>
            </div>
          </div>
        </div>
      {/each}
    </div>
  </div>
</section>


<!-- Recent Recipes -->
<section class="min-h-screen flex items-center justify-center py-16 lg:py-24 bg-muted/50">
  <div class="container px-4">
    <!-- Heading -->
    <div class="text-center space-y-4 mb-12">
      <h2 class="text-3xl lg:text-4xl font-bold">Recent Recipes</h2>
      <p class="text-muted-foreground text-lg">Fresh recipes from our community</p>
      <a 
        href="/recipes"
        class="inline-flex items-center justify-center rounded-md text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors h-10 px-6 mt-4"
      >
        View All Recipes
      </a>
    </div>
    
    <!-- Recipes Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      {#each $recentRecipes as recipe (recipe.id)}
        <div class="group relative overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm hover:shadow-md transition-all duration-200">
          <div class="aspect-[16/10] overflow-hidden">
            <img 
              src={recipe.images[0] || "/placeholder.svg"} 
              alt={recipe.title}
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            />
          </div>
          
          <!-- Content -->
          <div class="p-6 space-y-4">
            <div class="space-y-1">
              <h3 class="font-semibold text-lg line-clamp-1">{recipe.title}</h3>
              <p class="text-sm text-muted-foreground line-clamp-2">{recipe.description}</p>
            </div>
            
            <!-- Meta -->
            <div class="flex items-center justify-between text-xs text-muted-foreground">
              <div class="flex items-center gap-2">
                <img 
                  src={recipe.authorAvatar || "/placeholder.svg"} 
                  alt={recipe.authorName}
                  class="h-6 w-6 rounded-full"
                />
                <span>{recipe.authorName}</span>
              </div>
              <div class="flex items-center gap-3">
                <div class="flex items-center gap-1">
                  <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span>{recipe.rating.toFixed(1)}</span>
                </div>
                <span>{recipe.prepTime + recipe.cookTime}m</span>
              </div>
            </div>
            
            <!-- Button -->
            <a 
              href="/recipes/{recipe.id}"
              class="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors h-9 w-full"
            >
              View Recipe
            </a>
          </div>
        </div>
      {/each}
    </div>
  </div>
</section>


<!-- Call to Action -->
{#if !$currentUser}
  <section class="min-h-screen flex items-center justify-center mt-0.5 bg-gray-50 dark:bg-gray-900">
  <div class="container px-4">
    <div class="max-w-2xl mx-auto text-center space-y-6">
      <h2 class="text-3xl lg:text-4xl font-bold tracking-tight">
        Join Our Community
      </h2>
      <p class="text-lg text-muted-foreground">
        Start sharing your favorite recipes and discover new ones from fellow food enthusiasts around the world.
      </p>
      <div class="flex flex-col sm:flex-row gap-4 justify-center">
        <a 
          href="/signup"
          class="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground hover:bg-primary/90 h-11 px-8 text-sm font-medium transition-colors"
        >
          Sign Up Free
        </a>
        <a 
          href="/login"
          class="inline-flex items-center justify-center rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground h-11 px-8 text-sm font-medium transition-colors"
        >
          Already have an account?
        </a>
      </div>
    </div>
  </div>
</section>

{/if}
