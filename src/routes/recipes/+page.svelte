<script lang="ts">
  import { filteredRecipes, searchQuery, selectedTags, difficultyFilter, sortBy } from '$lib/stores/recipes';
  import { auth } from '$lib/stores/auth';
  import { favorites } from '$lib/stores/favorites';
  import { derived } from 'svelte/store';
  
  let filteredRecipesValue = $state();
  let currentUserValue = $state();
  let userFavoritesValue = $state();
  
  const filteredRecipesStore = derived(filteredRecipes, $filteredRecipes => {
    filteredRecipesValue = $filteredRecipes;
  });
  
  const currentUserStore = derived(auth, $auth => {
    currentUserValue = $auth;
  });
  
  const userFavoritesStore = derived(favorites, $favorites => {
    userFavoritesValue = $favorites;
  });
  
  let currentSearchQuery = $state('');
  let currentSelectedTags = $state([]);
  let currentDifficultyFilter = $state('all');
  let currentSortBy = $state('newest');
  
  // Available tags for filtering
  const availableTags = ['breakfast', 'lunch', 'dinner', 'dessert', 'snack', 'vegetarian', 'vegan', 'gluten-free', 'healthy', 'quick', 'baking', 'italian', 'mexican', 'asian', 'american'];
  
  // Update stores when local state changes
  function updateSearchQuery() {
    searchQuery.set(currentSearchQuery);
  }
  
  function updateSelectedTags() {
    selectedTags.set(currentSelectedTags);
  }
  
  function updateDifficultyFilter() {
    difficultyFilter.set(currentDifficultyFilter);
  }
  
  function updateSortBy() {
    sortBy.set(currentSortBy);
  }
  
  function toggleTag(tag: string) {
    if (currentSelectedTags.includes(tag)) {
      currentSelectedTags = currentSelectedTags.filter(t => t !== tag);
    } else {
      currentSelectedTags = [...currentSelectedTags, tag];
    }
    updateSelectedTags();
  }
  
  function clearFilters() {
    currentSearchQuery = '';
    currentSelectedTags = [];
    currentDifficultyFilter = 'all';
    currentSortBy = 'newest';
    updateSearchQuery();
    updateSelectedTags();
    updateDifficultyFilter();
    updateSortBy();
  }
  
  function toggleFavorite(recipeId: string) {
    favorites.toggleFavorite(recipeId);
  }
</script>

<svelte:head>
  <title>Recipes - RecipeShare</title>
  <meta name="description" content="Browse and discover amazing recipes from our community of food lovers." />
</svelte:head>

<div class="container py-8 px-4">
  <!-- Header -->
  <div class="space-y-4 mb-8">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl lg:text-4xl font-bold">All Recipes</h1>
        <p class="text-muted-foreground mt-2">Discover amazing recipes from our community</p>
      </div>
      {#if currentUserValue}
        <a 
          href="/create"
          class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4"
        >
          <svg class="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Create Recipe
        </a>
      {/if}
    </div>
  </div>
  
  <!-- Search and Filters -->
  <div class="space-y-6 mb-8">
    <!-- Search Bar -->
    <div class="relative max-w-md">
      <svg class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <input
        type="text"
        bind:value={currentSearchQuery}
        oninput={updateSearchQuery}
        placeholder="Search recipes..."
        class="flex h-10 w-full rounded-md border border-input bg-background pl-10 pr-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      />
    </div>
    
    <!-- Filter Controls -->
    <div class="flex flex-wrap items-center gap-4">
      <!-- Difficulty Filter -->
      <div class="flex items-center gap-2">
        <label for="difficulty" class="text-sm font-medium">Difficulty:</label>
        <select 
          id="difficulty"
          bind:value={currentDifficultyFilter}
          onchange={updateDifficultyFilter}
          class="flex h-9 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="all">All</option>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
      </div>
      
      <!-- Sort By -->
      <div class="flex items-center gap-2">
        <label for="sortBy" class="text-sm font-medium">Sort by:</label>
        <select 
          id="sortBy"
          bind:value={currentSortBy}
          onchange={updateSortBy}
          class="flex h-9 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="rating">Highest Rated</option>
          <option value="likes">Most Liked</option>
        </select>
      </div>
      
      <!-- Clear Filters -->
      {#if currentSearchQuery || currentSelectedTags.length > 0 || currentDifficultyFilter !== 'all' || currentSortBy !== 'newest'}
        <button
          onclick={clearFilters}
          class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3"
        >
          Clear Filters
        </button>
      {/if}
    </div>
    
    <!-- Tag Filters -->
    <div class="space-y-2">
      <label for="tag-filters" class="text-sm font-medium">Filter by tags:</label>
      <div id="tag-filters" class="flex flex-wrap gap-2">
        {#each availableTags as tag}
          <button
            aria-label={`Toggle ${tag} tag`}
            onclick={() => toggleTag(tag)}
            class="inline-flex items-center justify-center rounded-full text-xs font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-7 px-3 {currentSelectedTags.includes(tag) ? 'bg-primary text-primary-foreground' : 'border border-input bg-background hover:bg-accent hover:text-accent-foreground'}"
          >
            {tag}
          </button>
        {/each}
      </div>
    </div>
  </div>
  
  <!-- Results Count -->
  <div class="mb-6">
    <p class="text-sm text-muted-foreground">
      Showing {filteredRecipesValue?.length || 0} recipe{filteredRecipesValue?.length !== 1 ? 's' : ''}
    </p>
  </div>
  
  <!-- Recipe Grid -->
  {#if filteredRecipesValue && filteredRecipesValue.length > 0}
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {#each filteredRecipesValue as recipe (recipe.id)}
        <div class="group relative overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm hover:shadow-lg transition-all duration-300">
          <div class="aspect-[4/3] overflow-hidden">
            <img 
              src={recipe.images[0] || "/placeholder.svg"} 
              alt={recipe.title}
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            {#if currentUserValue}
              <button
                aria-label="Toggle Favorite"
                onclick={() => toggleFavorite(recipe.id)}
                class="absolute top-2 right-2 inline-flex items-center justify-center rounded-full text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-background/80 backdrop-blur-sm hover:bg-background h-8 w-8"
              >
                <svg 
                  class="h-4 w-4 { userFavoritesValue?.includes(recipe.id) ? 'fill-red-500 text-red-500' : ''}" 
                  fill={ userFavoritesValue?.includes(recipe.id) ? 'currentColor' : 'none'} 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </button>
            {/if}
          </div>
          
          <div class="p-4 space-y-3">
            <div class="space-y-1">
              <h3 class="font-semibold line-clamp-2">{recipe.title}</h3>
              <p class="text-sm text-muted-foreground line-clamp-2">{recipe.description}</p>
            </div>
            
            <!-- Tags -->
            <div class="flex flex-wrap gap-1">
              {#each recipe.tags.slice(0, 3) as tag}
                <span class="inline-flex items-center rounded-full bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground">
                  {tag}
                </span>
              {/each}
              {#if recipe.tags.length > 3}
                <span class="inline-flex items-center rounded-full bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground">
                  +{recipe.tags.length - 3}
                </span>
              {/if}
            </div>
            
            <!-- Recipe Info -->
            <div class="flex items-center justify-between text-xs text-muted-foreground">
              <div class="flex items-center gap-3">
                <div class="flex items-center gap-1">
                  <svg class="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span>{recipe.rating.toFixed(1)}</span>
                </div>
                <div class="flex items-center gap-1">
                  <svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{recipe.prepTime + recipe.cookTime}m</span>
                </div>
              </div>
              <div class="flex items-center gap-1">
                <span class="capitalize text-xs px-1.5 py-0.5 rounded-full bg-muted">
                  {recipe.difficulty}
                </span>
              </div>
            </div>
            
            <!-- Author -->
            <div class="flex items-center gap-2">
              <img 
                src={recipe.authorAvatar || "/placeholder.svg"} 
                alt={recipe.authorName}
                class="h-5 w-5 rounded-full"
              />
              <span class="text-xs text-muted-foreground">{recipe.authorName}</span>
            </div>
            
            <a 
              href="/recipes/{recipe.id}"
              class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-8 w-full"
            >
              View Recipe
            </a>
          </div>
        </div>
      {/each}
    </div>
  {:else}
    <!-- No Results -->
    <div class="text-center py-12">
      <svg class="mx-auto h-12 w-12 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 20.5a7.962 7.962 0 01-5.207-1.209m0 0L9 12m0 0l3-3m-3 3l-3 3m3-3h6m-6 0l3-3m-3 3l-3 3" />
      </svg>
      <h3 class="mt-4 text-lg font-semibold">No recipes found</h3>
      <p class="mt-2 text-muted-foreground">Try adjusting your search or filters to find what you're looking for.</p>
      {#if currentUserValue}
        <a 
          href="/create"
          class="mt-4 inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4"
        >
          Create the first recipe
        </a>
      {/if}
    </div>
  {/if}
</div>
