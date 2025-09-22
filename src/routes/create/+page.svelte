<script lang="ts">
  import { auth } from "$lib/stores/auth";
  import { recipes } from "$lib/stores/recipes";
  import { goto } from "$app/navigation";
  import { derived } from "svelte/store";
  import { onMount, onDestroy } from "svelte";

  let currentUser = $state();
  let unsubscribe: () => void;

  $effect(() => {
    unsubscribe = auth.subscribe((value) => {
      currentUser = value;
      if (!currentUser) {
        goto("/login");
      }
    });

    return () => {
      unsubscribe();
    };
  });

  let title = $state("");
  let description = $state("");
  let ingredients = $state([""]);
  let steps = $state([""]);
  let tags = $state("");
  let prepTime = $state(15);
  let cookTime = $state(30);
  let servings = $state(4);
  let difficulty = $state("easy");
  let imageUrl = $state("");

  let isSubmitting = $state(false);
  let error = $state("");

  function addIngredient() {
    ingredients = [...ingredients, ""];
  }

  function removeIngredient(index: number) {
    ingredients = ingredients.filter((_, i) => i !== index);
  }

  function addStep() {
    steps = [...steps, ""];
  }

  function removeStep(index: number) {
    steps = steps.filter((_, i) => i !== index);
  }

  async function handleSubmit(event: Event) {
    event.preventDefault();

    if (!currentUser) {
      error = "You must be logged in to create a recipe";
      return;
    }

    // Validation
    if (!title.trim() || !description.trim()) {
      error = "Title and description are required";
      return;
    }

    const validIngredients = ingredients.filter((ing) => ing.trim());
    const validSteps = steps.filter((step) => step.trim());

    if (validIngredients.length === 0) {
      error = "At least one ingredient is required";
      return;
    }

    if (validSteps.length === 0) {
      error = "At least one step is required";
      return;
    }

    isSubmitting = true;
    error = "";

    try {
      const tagArray = tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag);

      const newRecipe = recipes.addRecipe({
        title: title.trim(),
        description: description.trim(),
        ingredients: validIngredients,
        steps: validSteps,
        images: imageUrl
          ? [imageUrl]
          : ["/placeholder.svg?height=400&width=600"],
        tags: tagArray,
        prepTime,
        cookTime,
        servings,
        difficulty,
        authorId: currentUser.id,
        authorName: currentUser.name,
        authorAvatar: currentUser.avatar,
      });

      goto(`/recipes/${newRecipe.id}`);
    } catch (err) {
      error = "Failed to create recipe. Please try again.";
    } finally {
      isSubmitting = false;
    }
  }
</script>

<svelte:head>
  <title>Create Recipe - RecipeShare</title>
</svelte:head>

{#if currentUser}
  <div class="container py-8 px-4 max-w-2xl">
    <div class="space-y-6">
      <div>
        <h1 class="text-3xl font-bold">Create New Recipe</h1>
        <p class="text-muted-foreground mt-2">
          Share your favorite recipe with the community
        </p>
      </div>

      <form onsubmit={handleSubmit} class="space-y-6">
        {#if error}
          <div class="rounded-md bg-destructive/15 p-3">
            <p class="text-sm text-destructive">{error}</p>
          </div>
        {/if}

        <!-- Basic Info -->
        <div
          class="rounded-lg border bg-card text-card-foreground shadow-sm p-6 space-y-4"
        >
          <h2 class="text-lg font-semibold">Basic Information</h2>

          <div class="space-y-2">
            <label for="title" class="text-sm font-medium">Recipe Title *</label
            >
            <input
              id="title"
              type="text"
              bind:value={title}
              required
              placeholder="e.g., Classic Chocolate Chip Cookies"
              class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          <div class="space-y-2">
            <label for="description" class="text-sm font-medium"
              >Description *</label
            >
            <textarea
              id="description"
              bind:value={description}
              required
              rows="3"
              placeholder="Describe your recipe..."
              class="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            ></textarea>
          </div>

          <div class="space-y-2">
            <label for="imageUrl" class="text-sm font-medium"
              >Image URL (optional)</label
            >
            <input
              id="imageUrl"
              type="url"
              bind:value={imageUrl}
              placeholder="https://example.com/image.jpg"
              class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          <div class="space-y-2">
            <label for="tags" class="text-sm font-medium"
              >Tags (comma-separated)</label
            >
            <input
              id="tags"
              type="text"
              bind:value={tags}
              placeholder="e.g., dessert, cookies, chocolate, baking"
              class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
        </div>

        <!-- Recipe Details -->
        <div
          class="rounded-lg border bg-card text-card-foreground shadow-sm p-6 space-y-4"
        >
          <h2 class="text-lg font-semibold">Recipe Details</h2>

          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div class="space-y-2">
              <label for="prepTime" class="text-sm font-medium"
                >Prep Time (min)</label
              >
              <input
                id="prepTime"
                type="number"
                bind:value={prepTime}
                min="0"
                class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            <div class="space-y-2">
              <label for="cookTime" class="text-sm font-medium"
                >Cook Time (min)</label
              >
              <input
                id="cookTime"
                type="number"
                bind:value={cookTime}
                min="0"
                class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            <div class="space-y-2">
              <label for="servings" class="text-sm font-medium">Servings</label>
              <input
                id="servings"
                type="number"
                bind:value={servings}
                min="1"
                class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            <div class="space-y-2">
              <label for="difficulty" class="text-sm font-medium"
                >Difficulty</label
              >
              <select
                id="difficulty"
                bind:value={difficulty}
                class="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Ingredients -->
        <div
          class="rounded-lg border bg-card text-card-foreground shadow-sm p-6 space-y-4"
        >
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-semibold">Ingredients *</h2>
            <button
              type="button"
              aria-label="Add Ingredient"
              onclick={addIngredient}
              class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3"
            >
              <svg
                class="h-4 w-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Add Ingredient
            </button>
          </div>

          <div class="space-y-2">
            {#each ingredients as ingredient, index}
              <div class="flex gap-2">
                <input
                  type="text"
                  bind:value={ingredients[index]}
                  placeholder="e.g., 2 cups all-purpose flour"
                  class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
                {#if ingredients.length > 1}
                  <button
                    type="button"
                    aria-label="Remove Ingredient"
                    onclick={() => removeIngredient(index)}
                    class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 w-10"
                  >
                    <svg
                      class="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                {/if}
              </div>
            {/each}
          </div>
        </div>

        <!-- Instructions -->
        <div
          class="rounded-lg border bg-card text-card-foreground shadow-sm p-6 space-y-4"
        >
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-semibold">Instructions *</h2>
            <button
              type="button"
              aria-label="Add Step"
              onclick={addStep}
              class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3"
            >
              <svg
                class="h-4 w-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Add Step
            </button>
          </div>

          <div class="space-y-3">
            {#each steps as step, index}
              <div class="flex gap-3">
                <div
                  class="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium mt-1"
                >
                  {index + 1}
                </div>
                <div class="flex-1 flex gap-2">
                  <textarea
                    bind:value={steps[index]}
                    placeholder="Describe this step..."
                    rows="2"
                    class="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  ></textarea>
                  {#if steps.length > 1}
                    <button
                      type="button"
                      aria-label="Remove Step"
                      onclick={() => removeStep(index)}
                      class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 w-10 mt-1"
                    >
                      <svg
                        class="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  {/if}
                </div>
              </div>
            {/each}
          </div>
        </div>

        <!-- Submit Button -->
        <div class="flex gap-4">
          <button
            type="submit"
            disabled={isSubmitting}
            class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-8"
          >
            {#if isSubmitting}
              <svg
                class="animate-spin -ml-1 mr-3 h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                ></circle>
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Creating Recipe...
            {:else}
              Create Recipe
            {/if}
          </button>

          <a
            href="/recipes"
            aria-label="Cancel"
            class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-8"
          >
            Cancel
          </a>
        </div>
      </form>
    </div>
  </div>
{:else}
  <div class="container py-8 px-4">
    <div class="text-center">
      <h1 class="text-2xl font-bold">Access Denied</h1>
      <p class="text-muted-foreground mt-2">
        You need to be logged in to create a recipe.
      </p>
      <a
        href="/login"
        class="mt-4 inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4"
      >
        Sign In
      </a>
    </div>
  </div>
{/if}
