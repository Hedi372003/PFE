export type RequestStatus = "pending" | "approved" | "rejected";

export interface VisitorRequest {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  message: string;
  password?: string;
  status: RequestStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface VisitorRequestDraft {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  message: string;
}
