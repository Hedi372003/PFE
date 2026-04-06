export type UserRole = "admin" | "operator" | "user";

export interface AuthUser {
  id: string;
  _id?: string;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: UserRole;
  robotId?: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
  message?: string;
}
