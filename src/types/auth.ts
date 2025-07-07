export interface User {
  id: string;
  email: string;
  name: string;
  role: 'customer' | 'admin';
  _id?: string; // Optional for compatibility with JWT payload
}

export interface AuthResponse {
  token: string;
  user: User;
}