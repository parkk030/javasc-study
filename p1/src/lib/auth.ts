import { Errors } from "./errors";

export type UserRole = "member" | "admin";

export interface AuthUser {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
}

export const DEMO_USERS: Record<string, AuthUser> = {
  "user-gamer-1": {
    id: "user-gamer-1",
    email: "gamer@patchradar.dev",
    displayName: "페이커팬게이머",
    role: "member",
  },
  "user-admin-1": {
    id: "user-admin-1",
    email: "admin@patchradar.dev",
    displayName: "패치레이더운영자",
    role: "admin",
  },
};

export const DEFAULT_DEMO_USER: AuthUser = {
  id: "user-gamer-1",
  email: "gamer@patchradar.dev",
  displayName: "페이커팬게이머",
  role: "member",
};

/**
 * Extracts user identity from incoming Request headers.
 * - Supports explicit `x-user-id` (or `"anonymous"` to simulate logged-out state in tests)
 * - Supports `x-user-role` ("member" | "admin")
 * - Falls back to DEFAULT_DEMO_USER unless `x-auth-required: strict` or `x-user-id: anonymous` is passed.
 */
export function getCurrentUser(req?: Request): AuthUser | null {
  if (!req) {
    return DEFAULT_DEMO_USER;
  }

  const rawUserId = req.headers.get("x-user-id")?.trim();
  if (rawUserId === "anonymous" || rawUserId === "none") {
    return null;
  }

  if (rawUserId) {
    const preset = DEMO_USERS[rawUserId];
    const roleHeader = req.headers.get("x-user-role")?.trim();
    const role: UserRole =
      roleHeader === "admin" || roleHeader === "member"
        ? roleHeader
        : preset?.role ?? "member";

    return {
      id: rawUserId,
      email: req.headers.get("x-user-email")?.trim() ?? preset?.email ?? `${rawUserId}@patchradar.dev`,
      displayName:
        req.headers.get("x-user-name")?.trim() ?? preset?.displayName ?? rawUserId,
      role,
    };
  }

  if (req.headers.get("x-auth-mode") === "strict") {
    return null;
  }

  return DEFAULT_DEMO_USER;
}

export function requireAuth(req?: Request): AuthUser {
  const user = getCurrentUser(req);
  if (!user) {
    throw Errors.unauthorized("인증 정보가 없거나 만료되었습니다.");
  }
  return user;
}

export function requireAdmin(req?: Request): AuthUser {
  const user = requireAuth(req);
  if (user.role !== "admin") {
    throw Errors.forbidden("관리자(Admin) 권한이 필요한 요청입니다.");
  }
  return user;
}
