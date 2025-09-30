export interface User {
  userID: string;
  email: string;
  username: string;
  avatar?: string;
  role: 'user' | 'admin';
  createdAt?: Date;
  exp?: number;
}