export interface User {
  id: string;
  email: string;
  name?: string;
  organizationId?: string | null;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}