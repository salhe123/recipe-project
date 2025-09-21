<script lang="ts">
  import { auth } from '$lib/stores/auth';
  import { goto } from '$app/navigation';
  
  let email = $state('');
  let password = $state('');
  let isLoading = $state(false);
  let error = $state('');
  
  async function handleLogin(event: Event) {
    event.preventDefault();
    
    if (!email || !password) {
      error = 'Please fill in all fields';
      return;
    }
    
    isLoading = true;
    error = '';
    
    try {
      const result = await auth.login(email, password);
      
      if (result.success) {
        goto('/');
      } else {
        error = result.error || 'Login failed';
      }
    } catch (err) {
      error = 'An unexpected error occurred';
    } finally {
      isLoading = false;
    }
  }
</script>

<svelte:head>
  <title>Login - RecipeShare</title>
</svelte:head>

<div class="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4">
  <div class="w-full max-w-md space-y-8">
    <div class="text-center">
      <h1 class="text-3xl font-bold">Welcome back</h1>
      <p class="mt-2 text-muted-foreground">Sign in to your account to continue</p>
    </div>
    
    <div class="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
      <form onsubmit={handleLogin} class="space-y-6">
        {#if error}
          <div class="rounded-md bg-destructive/15 p-3">
            <p class="text-sm text-destructive">{error}</p>
          </div>
        {/if}
        
        <div class="space-y-2">
          <label for="email" class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Email address
          </label>
          <input
            id="email"
            type="email"
            bind:value={email}
            required
            class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="Enter your email"
          />
        </div>
        
        <div class="space-y-2">
          <label for="password" class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Password
          </label>
          <input
            id="password"
            type="password"
            bind:value={password}
            required
            class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="Enter your password"
          />
        </div>
        
        <button
          type="submit"
          disabled={isLoading}
          class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 w-full"
        >
          {#if isLoading}
            <svg class="animate-spin -ml-1 mr-3 h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Signing in...
          {:else}
            Sign in
          {/if}
        </button>
      </form>
      
      <div class="mt-6 text-center">
        <p class="text-sm text-muted-foreground">
          Don't have an account?
          <a href="/signup" class="font-medium text-primary hover:underline">
            Sign up
          </a>
        </p>
      </div>
    </div>
    
    <!-- Demo Credentials -->
    <div class="rounded-lg border bg-muted/50 p-4">
      <h3 class="font-medium text-sm mb-2">Demo Credentials:</h3>
      <div class="space-y-1 text-sm text-muted-foreground">
        <p><strong>User:</strong> john@example.com / password</p>
        <p><strong>Admin:</strong> admin@example.com / password</p>
      </div>
    </div>
  </div>
</div>
