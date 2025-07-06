export interface User {
  id: string;
  email: string;
  name: string;
  role: 'customer' | 'admin';
}

export interface AuthResponse {
  token: string;
  user: User;
}