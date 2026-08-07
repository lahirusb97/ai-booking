const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export interface AuthResult {
  accessToken: string;
  organization: {
    id: string;
    name: string;
    email: string;
  };
}

export interface RegisterPayload {
  orgName: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function postAuth(path: string, payload: unknown): Promise<AuthResult> {
  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new ApiError(data.message ?? "Request failed", res.status);
  }

  return data as AuthResult;
}

export function registerOrganization(payload: RegisterPayload): Promise<AuthResult> {
  return postAuth("/auth/register", payload);
}

export function loginOrganization(payload: LoginPayload): Promise<AuthResult> {
  return postAuth("/auth/login", payload);
}

const TOKEN_KEY = "accessToken";
const ORG_KEY = "organization";

export function storeSession(result: AuthResult): void {
  localStorage.setItem(TOKEN_KEY, result.accessToken);
  localStorage.setItem(ORG_KEY, JSON.stringify(result.organization));
}

export function clearSession(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(ORG_KEY);
}

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredOrganization(): AuthResult["organization"] | null {
  const raw = localStorage.getItem(ORG_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthResult["organization"];
  } catch {
    return null;
  }
}
