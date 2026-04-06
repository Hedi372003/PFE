import type { UserRole } from "@/types/auth";

export interface UserRecord {
  id: string;
  _id?: string;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: UserRole;
  robotId: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserDraft {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  robotId: string;
}

export interface UserUpdateInput {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  password?: string;
  robotId?: string | null;
}
