<script lang="ts">
  import { page } from '$app/stores';
  import { recipes, comments, type Recipe, type Comment } from '$lib/stores/recipes';
  import { auth } from '$lib/stores/auth';
  import { favorites } from '$lib/stores/favorites';
  import { derived } from 'svelte/store';
  import { goto } from '$app/navigation';
  
  
  const recipeId = page.params.id;
  
  const allRecipes = derived(recipes, $recipes => $recipes);
  const allComments = derived(comments, $comments => $comments);
  const currentUser = derived(auth, $auth => $auth);
  const userFavorites = derived(favorites, $favorites => $favorites);
  
  const recipe = derived(allRecipes, $allRecipes => 
    $allRecipes.find(r => r.id === recipeId)
  );
  
  const recipeComments = derived(allComments, $allComments => 
    $allComments.filter(c => c.recipeId === recipeId).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  );
  
  let newComment = '';
  let newRating = 5;
  let isSubmittingComment = false;
  
  // Redirect if recipe not found
  $effect(() => {
    if ($recipe === undefined) {
      goto('/recipes');
    }
  });
  
  function toggleFavorite() {
    if ($recipe) {
      favorites.toggleFavorite($recipe.id);
    }
  }
  
  function likeRecipe() {
    if ($recipe) {
      recipes.likeRecipe($recipe.id);
    }
  }
  
  async function submitComment(event: Event) {
    event.preventDefault();
    
    if (!$currentUser || !$recipe || !newComment.trim()) return;
    
    isSubmittingComment = true;
    
    try {
      await comments.addComment({
        recipeId: $recipe.id,
        userId: $currentUser.id,
        userName: $currentUser.name,
        userAvatar: $currentUser.avatar,
        content: newComment.trim(),
        rating: newRating,
      });
      
      newComment = '';
      newRating = 5;
    } catch (error) {
      console.error('Failed to submit comment:', error);
    } finally {
      isSubmittingComment = false;
    }
  }
  
  function formatDate(date: Date) {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  }
  
  function getDifficultyColor(difficulty: string) {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'hard': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  }
</script>

<svelte:head>
  <title>Recipe not found - RecipeShare</title>
  <meta name="description" content="The recipe you're looking for doesn't exist." />
</svelte:head>

{#if $recipe}
  <div class="container py-8 px-4 max-w-4xl">
    <!-- Back Button -->
    <div class="mb-6">
      <a 
        href="/recipes"
        class="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <svg class="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
        Back to recipes
      </a>
    </div>
    
    <!-- Recipe Header -->
    <div class="space-y-6 mb-8">
      <div class="aspect-[16/9] overflow-hidden rounded-xl">
        <img 
          src={$recipe.images[0] || "/placeholder.svg"} 
          alt={$recipe.title}
          class="w-full h-full object-cover"
        />
      </div>
      
      <div class="space-y-4">
        <div class="flex items-start justify-between">
          <div class="space-y-2">
            <h1 class="text-3xl lg:text-4xl font-bold text-balance">{$recipe.title}</h1>
            <p class="text-lg text-muted-foreground text-pretty">{$recipe.description}</p>
          </div>
          
          {#if $currentUser}
            <div class="flex items-center gap-2">
              <button
                aria-label="Toggle Favorite"
                onclick={toggleFavorite}
                class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-10 w-10"
              >
                <svg 
                  class="h-5 w-5 { userFavorites.includes($recipe.id) ? 'fill-red-500 text-red-500' : ''}" 
                  fill={ userFavorites.includes($recipe.id) ? 'currentColor' : 'none'} 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </button>
              <button
                aria-label="Like Recipe"
                onclick={likeRecipe}
                class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-10 px-4 gap-2"
              >
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                </svg>
                <span>{$recipe.likes}</span>
              </button>
            </div>
          {/if}
        </div>
        
        <!-- Recipe Meta -->
        <div class="flex flex-wrap items-center gap-6 text-sm">
          <div class="flex items-center gap-3">
            <img 
              src={$recipe.authorAvatar || "/placeholder.svg"} 
              alt={$recipe.authorName}
              class="h-8 w-8 rounded-full"
            />
            <div>
              <p class="font-medium">{$recipe.authorName}</p>
              <p class="text-muted-foreground text-xs">{formatDate($recipe.createdAt)}</p>
            </div>
          </div>
          
          <div class="flex items-center gap-1">
            <svg class="h-4 w-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span class="font-medium">{$recipe.rating.toFixed(1)}</span>
            <span class="text-muted-foreground">({$recipe.totalRatings} reviews)</span>
          </div>
          
          <div class="flex items-center gap-4">
            <div class="flex items-center gap-1">
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Prep: {$recipe.prepTime}m</span>
            </div>
            <div class="flex items-center gap-1">
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
              </svg>
              <span>Cook: {$recipe.cookTime}m</span>
            </div>
            <div class="flex items-center gap-1">
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span>{$recipe.servings} servings</span>
            </div>
            <span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium {getDifficultyColor($recipe.difficulty)}">
              {$recipe.difficulty}
            </span>
          </div>
        </div>
        
        <!-- Tags -->
        <div class="flex flex-wrap gap-2">
          {#each $recipe.tags as tag}
            <span class="inline-flex items-center rounded-full bg-secondary px-3 py-1 text-sm font-medium text-secondary-foreground">
              {tag}
            </span>
          {/each}
        </div>
      </div>
    </div>
    
    <!-- Recipe Content -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
      <!-- Ingredients -->
      <div class="lg:col-span-1">
        <div class="rounded-lg border bg-card text-card-foreground shadow-sm p-6 sticky top-8">
          <h2 class="text-xl font-semibold mb-4">Ingredients</h2>
          <ul class="space-y-2">
            {#each $recipe.ingredients as ingredient}
              <li class="flex items-start gap-2">
                <svg class="h-4 w-4 mt-0.5 text-primary flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
                <span class="text-sm">{ingredient}</span>
              </li>
            {/each}
          </ul>
        </div>
      </div>
      
      <!-- Instructions -->
      <div class="lg:col-span-2">
        <h2 class="text-xl font-semibold mb-4">Instructions</h2>
        <ol class="space-y-4">
          {#each $recipe.steps as step, index}
            <li class="flex gap-4">
              <div class="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                {index + 1}
              </div>
              <p class="text-sm leading-relaxed pt-1">{step}</p>
            </li>
          {/each}
        </ol>
      </div>
    </div>
    
    <!-- Comments Section -->
    <div class="space-y-6">
      <h2 class="text-2xl font-semibold">Reviews & Comments</h2>
      
      <!-- Add Comment Form -->
      {#if $currentUser}
        <div class="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <h3 class="text-lg font-medium mb-4">Leave a review</h3>
          <!-- Fixed form submission to use proper onsubmit handler -->
          <form onsubmit={submitComment} class="space-y-4">
            <div class="space-y-2">
              <label class="text-sm font-medium">Rating</label>
              <div class="flex items-center gap-1">
                {#each Array(5) as _, i}
                  <button
                    type="button"
                    onclick={() => newRating = i + 1}
                    class="text-2xl transition-colors {i < newRating ? 'text-yellow-500' : 'text-gray-300'}"
                  >
                    ★
                  </button>
                {/each}
                <span class="ml-2 text-sm text-muted-foreground">{newRating} star{newRating !== 1 ? 's' : ''}</span>
              </div>
            </div>
            
            <div class="space-y-2">
              <label for="comment" class="text-sm font-medium">Comment</label>
              <textarea
                id="comment"
                bind:value={newComment}
                rows="4"
                placeholder="Share your thoughts about this recipe..."
                class="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              ></textarea>
            </div>
            
            <button
              type="submit"
              disabled={isSubmittingComment || !newComment.trim()}
              class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4"
            >
              {#if isSubmittingComment}
                <svg class="animate-spin -ml-1 mr-3 h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Submitting...
              {:else}
                Submit Review
              {/if}
            </button>
          </form>
        </div>
      {:else}
        <div class="rounded-lg border bg-muted/50 p-6 text-center">
          <p class="text-muted-foreground mb-4">Sign in to leave a review</p>
          <a 
            href="/login"
            class="mt-4 inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4"
          >
            Sign In
          </a>
        </div>
      {/if}
      
      <!-- Comments List -->
      <div class="space-y-4">
        {#each $recipeComments as comment (comment.id)}
          <div class="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
            <div class="flex items-start justify-between mb-3">
              <div class="flex items-center gap-3">
                <img 
                  src={comment.userAvatar || "/placeholder.svg"} 
                  alt={comment.userName}
                  class="h-8 w-8 rounded-full"
                />
                <div>
                  <p class="font-medium text-sm">{comment.userName}</p>
                  <div class="flex items-center gap-2">
                    <div class="flex items-center">
                      {#each Array(5) as _, i}
                        <span class="text-sm {i < comment.rating ? 'text-yellow-500' : 'text-gray-300'}">★</span>
                      {/each}
                    </div>
                    <span class="text-xs text-muted-foreground">{formatDate(comment.createdAt)}</span>
                  </div>
                </div>
              </div>
            </div>
            <p class="text-sm leading-relaxed">{comment.content}</p>
          </div>
        {:else}
          <div class="text-center py-8">
            <p class="text-muted-foreground">No reviews yet. Be the first to review this recipe!</p>
          </div>
        {/each}
      </div>
    </div>
  </div>
{:else}
  <div class="container py-8 px-4">
    <div class="text-center">
      <h1 class="text-2xl font-bold">Recipe not found</h1>
      <p class="text-muted-foreground mt-2">The recipe you're looking for doesn't exist.</p>
      <a 
        href="/recipes"
        class="mt-4 inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4"
      >
        Browse Recipes
      </a>
    </div>
  </div>
{/if}
