<script lang="ts">
  import { auth } from "$lib/stores/auth";
  import { recipes, comments } from "$lib/stores/recipes";
  import { goto } from "$app/navigation";

  let currentUser = $state(null);
  let activeTab = $state("overview");
  

  $effect(() => {
    const unsubscribe = auth.subscribe((value) => {
      currentUser = value;
      if (!currentUser || currentUser.role !== "admin") {
        goto("/");
      }
    });

    return () => unsubscribe();
  });

  let allRecipes = $derived(recipes);
  let allComments = $derived(comments);

  const mockUsers = $state([
    {
      id: "1",
      name: "John Doe",
      email: "john@example.com",
      role: "user",
      status: "active",
      joinDate: new Date("2024-01-15"),
      recipesCount: 2,
      commentsCount: 1,
    },
    {
      id: "2",
      name: "Admin User",
      email: "admin@example.com",
      role: "admin",
      status: "active",
      joinDate: new Date("2024-01-01"),
      recipesCount: 1,
      commentsCount: 1,
    },
    {
      id: "3",
      name: "Jane Smith",
      email: "jane@example.com",
      role: "user",
      status: "suspended",
      joinDate: new Date("2024-01-20"),
      recipesCount: 0,
      commentsCount: 0,
    },
  ]);

  function deleteRecipe(recipeId: string) {
    if (
      confirm(
        "Are you sure you want to delete this recipe? This action cannot be undone."
      )
    ) {
      recipes.deleteRecipe(recipeId);
    }
  }

  function formatDate(date: Date) {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
  }

  function getStatusColor(status: string) {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "suspended":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  }

  function getRoleColor(role: string) {
    switch (role) {
      case "admin":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      case "user":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  }
</script>

<svelte:head>
  <title>Admin Dashboard - RecipeShare</title>
</svelte:head>

{#if currentUser && currentUser.role === "admin"}
  <div class="min-h-screen flex items-center justify-center py-8 px-4">
    <div class="w-full max-w-7xl mx-auto">
      <!-- Header -->
      <div class="mb-8 text-center">
        <h1 class="text-3xl font-bold">Admin Dashboard</h1>
        <p class="text-muted-foreground mt-2">
          Manage users, recipes, and content moderation
        </p>
      </div>

      <!-- Stats Overview -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div
          class="rounded-lg border bg-card text-card-foreground shadow-sm p-6"
        >
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-muted-foreground">
                Total Users
              </p>
              <p class="text-2xl font-bold">{mockUsers.length}</p>
            </div>
            <div
              class="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center"
            >
              <svg
                class="h-4 w-4 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                />
              </svg>
            </div>
          </div>
          <p class="text-xs text-muted-foreground mt-2">
            {mockUsers.filter((u) => u.status === "active").length} active users
          </p>
        </div>

        <div
          class="rounded-lg border bg-card text-card-foreground shadow-sm p-6"
        >
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-muted-foreground">
                Total Recipes
              </p>
              <p class="text-2xl font-bold">{allRecipes.length}</p>
            </div>
            <div
              class="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center"
            >
              <svg
                class="h-4 w-4 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </div>
          </div>
          <p class="text-xs text-muted-foreground mt-2">
            {allRecipes.filter(
              (r) =>
                r.createdAt > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
            ).length} this week
          </p>
        </div>

        <div
          class="rounded-lg border bg-card text-card-foreground shadow-sm p-6"
        >
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-muted-foreground">
                Total Comments
              </p>
              <p class="text-2xl font-bold">{allComments.length}</p>
            </div>
            <div
              class="h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center"
            >
              <svg
                class="h-4 w-4 text-yellow-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>
          </div>
          <p class="text-xs text-muted-foreground mt-2">
            {allComments.filter(
              (c) =>
                c.createdAt > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
            ).length} this week
          </p>
        </div>

        <div
          class="rounded-lg border bg-card text-card-foreground shadow-sm p-6"
        >
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-muted-foreground">
                Avg Rating
              </p>
              <p class="text-2xl font-bold">
                {(
                  allRecipes.reduce((sum, r) => sum + r.rating, 0) /
                    allRecipes.length || 0
                ).toFixed(1)}
              </p>
            </div>
            <div
              class="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center"
            >
              <svg
                class="h-4 w-4 text-orange-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                />
              </svg>
            </div>
          </div>
          <p class="text-xs text-muted-foreground mt-2">Across all recipes</p>
        </div>
      </div>

      <!-- Tabs -->
      <div class="mb-6">
        <div class="border-b border-border">
          <nav class="-mb-px flex space-x-8">
            <button
              on:click={() => (activeTab = "overview")}
              class="py-2 px-1 hover:cursor-pointer border-b-2 font-medium text-sm {activeTab ===
              'overview'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300'}"
            >
              Overview
            </button>
            <button
              on:click={() => (activeTab = "users")}
              class="py-2 px-1 border-b-2 hover:cursor-pointer font-medium text-sm {activeTab ===
              'users'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300'}"
            >
              Users ({mockUsers.length})
            </button>
            <button
              on:click={() => (activeTab = "recipes")}
              class="py-2 px-1 border-b-2 hover:cursor-pointer font-medium text-sm {activeTab ===
              'recipes'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300'}"
            >
              Recipes ({allRecipes.length})
            </button>
            <button
              on:click={() => (activeTab = "comments")}
              class="py-2 px-1 border-b-2 hover:cursor-pointer font-medium text-sm {activeTab ===
              'comments'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300'}"
            >
              Comments ({allComments.length})
            </button>
          </nav>
        </div>
      </div>

      <!-- Tab Content -->
      {#if activeTab === "overview"}
        <div class="space-y-6">
          <h2 class="text-xl font-semibold">Recent Activity</h2>

          <!-- Recent Recipes -->
          <div class="rounded-lg border bg-card text-card-foreground shadow-sm">
            <div class="p-6 pb-4">
              <h3 class="font-semibold">Recent Recipes</h3>
            </div>
            <div class="px-6 pb-6">
              <div class="space-y-3">
                {#each allRecipes.slice(0, 5) as recipe}
                  <div class="flex items-center justify-between py-2">
                    <div class="flex items-center gap-3">
                      <img
                        src={recipe.images[0] || "/placeholder.svg"}
                        alt={recipe.title}
                        class="h-10 w-10 rounded object-cover"
                      />
                      <div>
                        <p class="font-medium text-sm">{recipe.title}</p>
                        <p class="text-xs text-muted-foreground">
                          by {recipe.authorName}
                        </p>
                      </div>
                    </div>
                    <div class="text-right">
                      <p class="text-sm font-medium">
                        {recipe.rating.toFixed(1)} ⭐
                      </p>
                      <p class="text-xs text-muted-foreground">
                        {formatDate(recipe.createdAt)}
                      </p>
                    </div>
                  </div>
                {/each}
              </div>
            </div>
          </div>

          <!-- Recent Comments -->
          <div class="rounded-lg border bg-card text-card-foreground shadow-sm">
            <div class="p-6 pb-4">
              <h3 class="font-semibold">Recent Comments</h3>
            </div>
            <div class="px-6 pb-6">
              <div class="space-y-3">
                {#each allComments.slice(0, 5) as comment}
                  <div class="py-2">
                    <div class="flex items-start gap-3">
                      <img
                        src={comment.userAvatar || "/placeholder.svg"}
                        alt={comment.userName}
                        class="h-8 w-8 rounded-full"
                      />
                      <div class="flex-1">
                        <div class="flex items-center gap-2">
                          <p class="font-medium text-sm">{comment.userName}</p>
                          <div class="flex">
                            {#each Array(comment.rating) as _}
                              <span class="text-yellow-500 text-xs">★</span>
                            {/each}
                          </div>
                          <p class="text-xs text-muted-foreground">
                            {formatDate(comment.createdAt)}
                          </p>
                        </div>
                        <p
                          class="text-sm text-muted-foreground mt-1 line-clamp-2"
                        >
                          {comment.content}
                        </p>
                      </div>
                    </div>
                  </div>
                {/each}
              </div>
            </div>
          </div>
        </div>
      {:else if activeTab === "users"}
        <div class="space-y-6">
          <div class="flex items-center justify-between">
            <h2 class="text-xl font-semibold">User Management</h2>
          </div>

          <div class="rounded-lg border bg-card text-card-foreground shadow-sm">
            <div class="overflow-x-auto">
              <table class="w-full">
                <thead>
                  <tr class="border-b">
                    <th class="text-left p-4 font-medium">User</th>
                    <th class="text-left p-4 font-medium">Role</th>
                    <th class="text-left p-4 font-medium">Status</th>
                    <th class="text-left p-4 font-medium">Joined</th>
                    <th class="text-left p-4 font-medium">Recipes</th>
                    <th class="text-left p-4 font-medium">Comments</th>
                    <th class="text-left p-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {#each mockUsers as user}
                    <tr class="border-b last:border-b-0">
                      <td class="p-4">
                        <div class="flex items-center gap-3">
                          <img
                            src="/placeholder.svg"
                            alt={user.name}
                            class="h-8 w-8 rounded-full"
                          />
                          <div>
                            <p class="font-medium text-sm">{user.name}</p>
                            <p class="text-xs text-muted-foreground">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td class="p-4">
                        <span
                          class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium {getRoleColor(
                            user.role
                          )}"
                        >
                          {user.role}
                        </span>
                      </td>
                      <td class="p-4">
                        <span
                          class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium {getStatusColor(
                            user.status
                          )}"
                        >
                          {user.status}
                        </span>
                      </td>
                      <td class="p-4 text-sm text-muted-foreground">
                        {formatDate(user.joinDate)}
                      </td>
                      <td class="p-4 text-sm">
                        {user.recipesCount}
                      </td>
                      <td class="p-4 text-sm">
                        {user.commentsCount}
                      </td>
                      <td class="p-4">
                        <div class="flex items-center gap-2">
                          {#if user.status === "active"}
                            <button
                              class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 px-3 text-xs"
                            >
                              Suspend
                            </button>
                          {:else}
                            <button
                              class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 px-3 text-xs"
                            >
                              Activate
                            </button>
                          {/if}
                        </div>
                      </td>
                    </tr>
                  {/each}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      {:else if activeTab === "recipes"}
        <div class="space-y-6">
          <div class="flex items-center justify-between">
            <h2 class="text-xl font-semibold">Recipe Management</h2>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {#each allRecipes as recipe}
              <div
                class="rounded-lg border bg-card text-card-foreground shadow-sm"
              >
                <div class="aspect-[4/3] overflow-hidden rounded-t-lg">
                  <img
                    src={recipe.images[0] || "/placeholder.svg"}
                    alt={recipe.title}
                    class="w-full h-full object-cover"
                  />
                </div>

                <div class="p-4 space-y-3">
                  <div class="space-y-1">
                    <h3 class="font-semibold line-clamp-2">{recipe.title}</h3>
                    <p class="text-sm text-muted-foreground">
                      by {recipe.authorName}
                    </p>
                  </div>

                  <div
                    class="flex items-center justify-between text-xs text-muted-foreground"
                  >
                    <div class="flex items-center gap-3">
                      <div class="flex items-center gap-1">
                        <svg
                          class="h-3 w-3"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                          />
                        </svg>
                        <span>{recipe.rating.toFixed(1)}</span>
                      </div>
                      <div class="flex items-center gap-1">
                        <svg
                          class="h-3 w-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                          />
                        </svg>
                        <span>{recipe.likes}</span>
                      </div>
                    </div>
                    <span>{formatDate(recipe.createdAt)}</span>
                  </div>

                  <div class="flex gap-2">
                    <a
                      href="/recipes/{recipe.id}"
                      class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 px-3 flex-1"
                    >
                      View
                    </a>
                    <button
                      on:click={() => deleteRecipe(recipe.id)}
                      class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-destructive text-destructive-foreground hover:bg-destructive/90 h-8 px-3"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            {/each}
          </div>
        </div>
      {:else if activeTab === "comments"}
        <div class="space-y-6">
          <div class="flex items-center justify-between">
            <h2 class="text-xl font-semibold">Comment Moderation</h2>
          </div>

          <div class="space-y-4">
            {#each allComments as comment}
              <div
                class="rounded-lg border bg-card text-card-foreground shadow-sm p-6"
              >
                <div class="flex items-start justify-between">
                  <div class="flex items-start gap-4 flex-1">
                    <img
                      src={comment.userAvatar || "/placeholder.svg"}
                      alt={comment.userName}
                      class="h-10 w-10 rounded-full"
                    />
                    <div class="flex-1">
                      <div class="flex items-center gap-2 mb-2">
                        <p class="font-medium">{comment.userName}</p>
                        <div class="flex">
                          {#each Array(comment.rating) as _}
                            <span class="text-yellow-500 text-sm">★</span>
                          {/each}
                        </div>
                        <p class="text-sm text-muted-foreground">
                          {formatDate(comment.createdAt)}
                        </p>
                      </div>
                      <p class="text-sm leading-relaxed mb-2">
                        {comment.content}
                      </p>
                      <p class="text-xs text-muted-foreground">
                        Recipe: {allRecipes.find(
                          (r) => r.id === comment.recipeId
                        )?.title || "Unknown"}
                      </p>
                    </div>
                  </div>

                  <div class="flex items-center gap-2">
                    <button
                      class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 px-3"
                    >
                      Hide
                    </button>
                    <button
                      class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-destructive text-destructive-foreground hover:bg-destructive/90 h-8 px-3"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            {/each}
          </div>
        </div>
      {/if}
    </div>
  </div>
{:else}
  <div class="min-h-screen flex items-center justify-center py-8 px-4">
    <div class="text-center max-w-md mx-auto">
      <h1 class="text-2xl font-bold">Access Denied</h1>
      <p class="text-muted-foreground mt-2">
        You need admin privileges to access this page.
      </p>
      <a
        href="/"
        class="mt-4 inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4"
      >
        Go Home
      </a>
    </div>
  </div>
{/if}
