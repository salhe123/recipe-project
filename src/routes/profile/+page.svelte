<script lang="ts">
  import { auth } from '$lib/stores/auth';
  import { recipes } from '$lib/stores/recipes';
  import { favorites } from '$lib/stores/favorites';
  import { derived } from 'svelte/store';
  import { goto } from '$app/navigation';
  import { onMount, onDestroy } from 'svelte';
  
  let currentUser = $state();
  let unsubscribe;
  
  onMount(() => {
    unsubscribe = auth.subscribe(value => {
      currentUser = value;
      if (!currentUser) {
        goto('/login');
      }
    });
  });
  
  onDestroy(() => {
    unsubscribe();
  });
  
  const allRecipes = derived(recipes, $recipes => $recipes);
  const userFavorites = derived(favorites, $favorites => $favorites);
  
  const userRecipes = derived(allRecipes, $allRecipes => 
    $allRecipes.filter(recipe => recipe.authorId === currentUser?.id)
  );
  
  const favoriteRecipes = derived([allRecipes, userFavorites], ([$allRecipes, $userFavorites]) => 
    $allRecipes.filter(recipe => $userFavorites.includes(recipe.id))
  );
  
  let activeTab = $state('recipes');
  let isEditingProfile = $state(false);
  let editName = $state('');
  let editAvatar = $state('');
  
  function startEditProfile() {
    if (currentUser) {
      editName = currentUser.name;
      editAvatar = currentUser.avatar || '';
      isEditingProfile = true;
    }
  }
  
  function cancelEditProfile() {
    isEditingProfile = false;
    editName = '';
    editAvatar = '';
  }
  
  function saveProfile() {
    if (currentUser && editName.trim()) {
      auth.updateProfile({
        name: editName.trim(),
        avatar: editAvatar.trim() || undefined,
      });
      isEditingProfile = false;
    }
  }
  
  function toggleFavorite(recipeId: string) {
    favorites.toggleFavorite(recipeId);
  }
  
  function formatDate(date: Date) {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  }
</script>

<svelte:head>
  <title>My Profile - RecipeShare</title>
</svelte:head>

{#if currentUser}
  <div class="container py-8 px-4">
    <!-- Profile Header -->
    <div class="rounded-lg border bg-card text-card-foreground shadow-sm p-6 mb-8">
      <div class="flex flex-col md:flex-row items-start md:items-center gap-6">
        <div class="flex items-center gap-4">
          <img 
            src={currentUser.avatar || "/placeholder.svg"} 
            alt={currentUser.name}
            class="h-20 w-20 rounded-full"
          />
          <div class="space-y-1">
            <h1 class="text-2xl font-bold">{currentUser.name}</h1>
            <p class="text-muted-foreground">{currentUser.email}</p>
            <div class="flex items-center gap-2 text-sm text-muted-foreground">
              <span class="capitalize px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                {currentUser.role}
              </span>
              <span>Member since {formatDate(currentUser.createdAt)}</span>
            </div>
          </div>
        </div>
        
        <div class="flex-1"></div>
        
        <button
          onclick={startEditProfile}
          class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4"
        >
          <svg class="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Edit Profile
        </button>
      </div>
      
      <!-- Profile Stats -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t">
        <div class="text-center">
          <div class="text-2xl font-bold text-primary">{$userRecipes.length}</div>
          <div class="text-sm text-muted-foreground">Recipes Created</div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-bold text-primary">{$favoriteRecipes.length}</div>
          <div class="text-sm text-muted-foreground">Favorite Recipes</div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-bold text-primary">
            {$userRecipes.reduce((total, recipe) => total + recipe.likes, 0)}
          </div>
          <div class="text-sm text-muted-foreground">Total Likes Received</div>
        </div>
      </div>
    </div>
    
    <!-- Edit Profile Modal -->
    {#if isEditingProfile}
      <div class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div class="bg-background rounded-lg border shadow-lg w-full max-w-md p-6">
          <h2 class="text-lg font-semibold mb-4">Edit Profile</h2>
          
          <div class="space-y-4">
            <div class="space-y-2">
              <label for="editName" class="text-sm font-medium">Name</label>
              <input
                id="editName"
                type="text"
                bind:value={editName}
                class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            
            <div class="space-y-2">
              <label for="editAvatar" class="text-sm font-medium">Avatar URL</label>
              <input
                id="editAvatar"
                type="url"
                bind:value={editAvatar}
                placeholder="https://example.com/avatar.jpg"
                class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          </div>
          
          <div class="flex gap-2 mt-6">
            <button
              onclick={saveProfile}
              disabled={!editName.trim()}
              class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 flex-1"
            >
              Save Changes
            </button>
            <button
              onclick={cancelEditProfile}
              class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    {/if}
    
    <!-- Tabs -->
    <div class="mb-6">
      <div class="border-b border-border">
        <nav class="-mb-px flex space-x-8">
          <button
            onclick={() => activeTab = 'recipes'}
            class="py-2 px-1 border-b-2 font-medium text-sm {activeTab === 'recipes' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300'}"
          >
            My Recipes ({$userRecipes.length})
          </button>
          <button
            onclick={() => activeTab = 'favorites'}
            class="py-2 px-1 border-b-2 font-medium text-sm {activeTab === 'favorites' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300'}"
          >
            Favorites ({$favoriteRecipes.length})
          </button>
        </nav>
      </div>
    </div>
    
    <!-- Tab Content -->
    {#if activeTab === 'recipes'}
      <div class="space-y-6">
        <div class="flex items-center justify-between">
          <h2 class="text-xl font-semibold">My Recipes</h2>
          <a 
            href="/create"
            class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4"
          >
            <svg class="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            Create New Recipe
          </a>
        </div>
        
        {#if $userRecipes.length > 0}
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {#each $userRecipes as recipe (recipe.id)}
              <div class="group relative overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm hover:shadow-lg transition-all duration-300">
                <div class="aspect-[4/3] overflow-hidden">
                  <img 
                    src={recipe.images[0] || "/placeholder.svg"} 
                    alt={recipe.title}
                    class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                
                <div class="p-4 space-y-3">
                  <div class="space-y-1">
                    <h3 class="font-semibold line-clamp-2">{recipe.title}</h3>
                    <p class="text-sm text-muted-foreground line-clamp-2">{recipe.description}</p>
                  </div>
                  
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
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                        </svg>
                        <span>{recipe.likes}</span>
                      </div>
                    </div>
                    <span class="text-xs">{formatDate(recipe.createdAt)}</span>
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
          <div class="text-center py-12">
            <svg class="mx-auto h-12 w-12 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <h3 class="mt-4 text-lg font-semibold">No recipes yet</h3>
            <p class="mt-2 text-muted-foreground">Start sharing your favorite recipes with the community.</p>
            <a 
              href="/create"
              class="mt-4 inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4"
            >
              Create Your First Recipe
            </a>
          </div>
        {/if}
      </div>
    {:else if activeTab === 'favorites'}
      <div class="space-y-6">
        <h2 class="text-xl font-semibold">Favorite Recipes</h2>
        
        {#if $favoriteRecipes.length > 0}
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {#each $favoriteRecipes as recipe (recipe.id)}
              <div class="group relative overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm hover:shadow-lg transition-all duration-300">
                <div class="aspect-[4/3] overflow-hidden">
                  <img 
                    src={recipe.images[0] || "/placeholder.svg"} 
                    alt={recipe.title}
                    class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <button
                    aria-label="Remove from Favorites"
                    onclick={() => toggleFavorite(recipe.id)}
                    class="absolute top-2 right-2 inline-flex items-center justify-center rounded-full text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-background/80 backdrop-blur-sm hover:bg-background h-8 w-8"
                  >
                    <svg class="h-4 w-4 fill-red-500 text-red-500" fill="currentColor" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </button>
                </div>
                
                <div class="p-4 space-y-3">
                  <div class="space-y-1">
                    <h3 class="font-semibold line-clamp-2">{recipe.title}</h3>
                    <p class="text-sm text-muted-foreground line-clamp-2">{recipe.description}</p>
                  </div>
                  
                  <div class="flex items-center gap-2">
                    <img 
                      src={recipe.authorAvatar || "/placeholder.svg"} 
                      alt={recipe.authorName}
                      class="h-5 w-5 rounded-full"
                    />
                    <span class="text-xs text-muted-foreground">{recipe.authorName}</span>
                  </div>
                  
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
          <div class="text-center py-12">
            <svg class="mx-auto h-12 w-12 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <h3 class="mt-4 text-lg font-semibold">No favorite recipes yet</h3>
            <p class="mt-2 text-muted-foreground">Start exploring recipes and add them to your favorites.</p>
            <a 
              href="/recipes"
              class="mt-4 inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4"
            >
              Browse Recipes
            </a>
          </div>
        {/if}
      </div>
    {/if}
  </div>
{:else}
  <div class="container py-8 px-4">
    <div class="text-center">
      <h1 class="text-2xl font-bold">Access Denied</h1>
      <p class="text-muted-foreground mt-2">You need to be logged in to view your profile.</p>
      <a 
        href="/login"
        class="mt-4 inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4"
      >
        Sign In
      </a>
    </div>
  </div>
{/if}
