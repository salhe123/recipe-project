export function validateEmail(email: string): string | null {
  const pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return pattern.test(email) ? null : 'Invalid email format';
}

export function validatePassword(password: string): string | null {
  if (password.length < 8) return 'Password must be at least 8 characters';
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  return hasUpper && hasLower && hasNumber ? null : 'Password must contain uppercase, lowercase, and number';
}

export function validateRecipeTitle(name: string): string | null {
  return name.length >= 3 && name.length <= 100 ? null : 'Name must be between 3 and 100 characters';
}