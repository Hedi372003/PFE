import axios, { AxiosError } from "axios";

import type {
  AuthResponse,
  AuthUser,
  LoginCredentials,
} from "@/types/auth";
import type { CompanyContent } from "@/types/company";
import type { ActivityLog } from "@/types/log";
import type { NotificationItem } from "@/types/notification";
import type {
  VisitorRequest,
  VisitorRequestDraft,
} from "@/types/request";
import type { RobotDraft, RobotRecord, RobotStatus } from "@/types/robot";
import type {
  UserDraft,
  UserRecord,
  UserUpdateInput,
} from "@/types/user";
import { createId } from "@/lib/utils";

interface ApiErrorResponse {
  message?: string;
}

const SESSION_TOKEN_KEY = "token";
const SESSION_USER_KEY = "user";
const COMPANY_CONTENT_KEY = "telebot.company-content";
const ACTIVITY_LOG_KEY = "telebot.activity-logs";

const defaultCompanyContent: CompanyContent = {
  name: "TeleBot",
  supportEmail: "operations@telebot.local",
  supportPhone: "+216 70 000 000",
  hours: "Monday to Friday, 08:00 to 18:00",
  products: [
    "Remote visitor reception",
    "Hybrid collaboration sessions",
    "Facility robot supervision",
  ],
  welcomeMessage:
    "Operate telepresence robots, communicate in real time, and supervise visits from one secure administration console.",
  lobbyInstructions:
    "Visitors receive approval, a robot assignment, and live communication support before entering the remote experience.",
  updatedAt: new Date().toISOString(),
};

function readStorage<T>(key: string, fallback: T): T {
  try {
    const rawValue = localStorage.getItem(key);
    if (!rawValue) {
      return fallback;
    }
    return JSON.parse(rawValue) as T;
  } catch {
    return fallback;
  }
}

function writeStorage<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

function normalizeUserName(record: Partial<UserRecord>): Pick<UserRecord, "name" | "firstName" | "lastName"> {
  const fallbackName = String(record.name || "").trim();
  const [firstName = "", ...lastParts] = fallbackName.split(" ");
  const lastName = lastParts.join(" ");

  return {
    name: `${record.firstName || firstName} ${record.lastName || lastName}`.trim(),
    firstName: String(record.firstName || firstName || "").trim(),
    lastName: String(record.lastName || lastName || "").trim(),
  };
}

// ✅ baseURL = "/api" — les chemins ne répètent plus /api
export const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(SESSION_TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof AxiosError) {
    const apiMessage = (error.response?.data as ApiErrorResponse | undefined)?.message;
    return apiMessage || fallback;
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallback;
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>("/auth/login", credentials);
    return data;
  },

  async getCurrentUser(): Promise<AuthUser> {
    const { data } = await api.get<AuthUser>("/auth/me");
    return {
      ...data,
      id: data.id || data._id || "",
      firstName: data.firstName || data.name.split(" ")[0] || "",
      lastName: data.lastName || data.name.split(" ").slice(1).join(" ") || "",
    };
  },

  getStoredToken(): string | null {
    return localStorage.getItem(SESSION_TOKEN_KEY);
  },

  getStoredUser(): AuthUser | null {
    const user = readStorage<AuthUser | null>(SESSION_USER_KEY, null);
    if (!user) {
      return null;
    }
    return {
      ...user,
      id: user.id || user._id || "",
      firstName: user.firstName || user.name.split(" ")[0] || "",
      lastName: user.lastName || user.name.split(" ").slice(1).join(" ") || "",
    };
  },

  setSession(token: string, user: AuthUser): void {
    localStorage.setItem(SESSION_TOKEN_KEY, token);
    writeStorage(SESSION_USER_KEY, user);
  },

  setStoredUser(user: AuthUser): void {
    writeStorage(SESSION_USER_KEY, user);
  },

  clearSession(): void {
    localStorage.removeItem(SESSION_TOKEN_KEY);
    localStorage.removeItem(SESSION_USER_KEY);
  },
};

export const userService = {
  async list(): Promise<UserRecord[]> {
    const { data } = await api.get<UserRecord[]>("/users");
    return data.map((user) => {
      const normalized = normalizeUserName(user);
      return {
        ...user,
        ...normalized,
        id: user.id || user._id || "",
        phone: user.phone || "",
        robotId: user.robotId ?? null,
      };
    });
  },

  async getById(id: string): Promise<UserRecord> {
    const { data } = await api.get<UserRecord>(`/users/${id}`);
    const normalized = normalizeUserName(data);
    return {
      ...data,
      ...normalized,
      id: data.id || data._id || "",
      phone: data.phone || "",
      robotId: data.robotId ?? null,
    };
  },

  async create(payload: UserDraft): Promise<UserRecord> {
    const { data } = await api.post<UserRecord>("/users", {
      ...payload,
      robotId: payload.robotId.trim() || null,
    });
    return data;
  },

  async update(id: string, payload: UserUpdateInput): Promise<UserRecord> {
    const { data } = await api.put<UserRecord>(`/users/${id}`, payload);
    return data;
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/users/${id}`);
  },
};

export const requestService = {
  async listPending(): Promise<VisitorRequest[]> {
    const { data } = await api.get<VisitorRequest[]>("/requests");
    return data.map((request) => ({
      ...request,
      message: request.message || "No visit description supplied.",
    }));
  },

  async create(payload: VisitorRequestDraft): Promise<VisitorRequest> {
    const { data } = await api.post<VisitorRequest>("/requests", payload);
    return data;
  },

  async approve(id: string): Promise<VisitorRequest> {
    const { data } = await api.put<{ request: VisitorRequest }>(`/requests/${id}/approve`);
    return data.request;
  },

  async reject(id: string): Promise<VisitorRequest> {
    const { data } = await api.put<VisitorRequest>(`/requests/${id}/reject`);
    return data;
  },
};

export const robotService = {
  async list(): Promise<RobotRecord[]> {
    const { data } = await api.get<RobotRecord[]>("/robots");
    return data.map((robot) => ({
      ...robot,
      id: robot.id || robot._id || "",
      latitude: Number.isFinite(robot.latitude) ? robot.latitude : 0,
      longitude: Number.isFinite(robot.longitude) ? robot.longitude : 0,
    }));
  },

  async create(payload: RobotDraft): Promise<RobotRecord> {
    const { data } = await api.post<RobotRecord>("/robots", payload);
    return data;
  },

  async update(id: string, payload: Partial<RobotDraft>): Promise<RobotRecord> {
    const { data } = await api.put<RobotRecord>(`/robots/${id}`, payload);
    return data;
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/robots/${id}`);
  },
};

export const notificationService = {
  async list(params?: { limit?: number; unreadOnly?: boolean }): Promise<NotificationItem[]> {
    const { data } = await api.get<NotificationItem[]>("/notifications", {
      params: {
        ...(params?.limit ? { limit: params.limit } : {}),
        ...(params?.unreadOnly !== undefined ? { unreadOnly: params.unreadOnly } : {}),
      },
    });
    return data.map((notification) => ({
      ...notification,
      read: Boolean(notification.read),
      readAt: notification.readAt || null,
    }));
  },

  async markAsRead(id: string): Promise<NotificationItem> {
    const { data } = await api.post<NotificationItem>(`/notifications/${id}/read`);
    return {
      ...data,
      read: Boolean(data.read),
      readAt: data.readAt || null,
    };
  },

  async markAllAsRead(): Promise<{ updatedCount: number }> {
    const { data } = await api.post<{ updatedCount: number }>("/notifications/read-all");
    return data;
  },
};

export const companyService = {
  load(): CompanyContent {
    return readStorage<CompanyContent>(COMPANY_CONTENT_KEY, defaultCompanyContent);
  },

  save(payload: CompanyContent): CompanyContent {
    const nextValue = {
      ...payload,
      updatedAt: new Date().toISOString(),
    };
    writeStorage(COMPANY_CONTENT_KEY, nextValue);
    return nextValue;
  },
};

export const logService = {
  list(): ActivityLog[] {
    return readStorage<ActivityLog[]>(ACTIVITY_LOG_KEY, []).sort(
      (left, right) => new Date(right.timestamp).getTime() - new Date(left.timestamp).getTime(),
    );
  },

  record(entry: Omit<ActivityLog, "id" | "timestamp"> & { timestamp?: string }): ActivityLog {
    const logEntry: ActivityLog = {
      id: createId("log"),
      timestamp: entry.timestamp || new Date().toISOString(),
      ...entry,
    };
    const logs = this.list();
    const nextLogs = [logEntry, ...logs].slice(0, 200);
    writeStorage(ACTIVITY_LOG_KEY, nextLogs);
    return logEntry;
  },

  describeRobotStatus(status: RobotStatus): string {
    switch (status) {
      case "online":
        return "Robot is available for active telepresence sessions.";
      case "maintenance":
        return "Robot is being checked before the next session.";
      default:
        return "Robot is currently unavailable for visitors.";
    }
  },
};