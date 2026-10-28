import { describe, expect, it } from "vitest";
import { z } from "zod";
import { isMockDbMode, parseEnv } from "@/lib/env";
import { AppError, Errors } from "@/lib/errors";
import { fail, ok, withErrorHandler } from "@/lib/response";
import { getCurrentUser, requireAdmin, requireAuth } from "@/lib/auth";

describe("Serverless Core Utilities (T-02)", () => {
  describe("env.ts", () => {
    it("parses default environment variables safely", () => {
      const env = parseEnv({});
      expect(env.NEXT_PUBLIC_APP_NAME).toBe("PatchRadar");
      expect(env.USE_MOCK_DB).toBe("true");
      expect(isMockDbMode({})).toBe(true);
    });

    it("throws when USE_MOCK_DB is false without Supabase credentials", () => {
      expect(() =>
        parseEnv({ NODE_ENV: "production", USE_MOCK_DB: "false" })
      ).toThrow(/SUPABASE_URL and SUPABASE_ANON_KEY are required/);
    });
  });

  describe("errors.ts & response.ts", () => {
    it("builds standard success JSON envelope with ok()", async () => {
      const res = ok({ count: 3 }, { page: 1 }, 201);
      expect(res.status).toBe(201);
      const body = await res.json();
      expect(body).toEqual({
        success: true,
        data: { count: 3 },
        meta: { page: 1 },
      });
    });

    it("maps AppError to structured error envelope with fail()", async () => {
      const err = Errors.notFound("패치노트를 찾을 수 없습니다.");
      const res = fail(err);
      expect(res.status).toBe(404);
      const body = await res.json();
      expect(body).toEqual({
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "패치노트를 찾을 수 없습니다.",
        },
      });
    });

    it("maps ZodError to 400 VALIDATION_ERROR envelope", async () => {
      const schema = z.object({ title: z.string().min(2, "제목은 2자 이상이어야 합니다.") });
      const parsed = schema.safeParse({ title: "" });
      expect(parsed.success).toBe(false);
      if (!parsed.success) {
        const res = fail(parsed.error);
        expect(res.status).toBe(400);
        const body = await res.json();
        expect(body.success).toBe(false);
        expect(body.error.code).toBe("VALIDATION_ERROR");
        expect(body.error.message).toBe("제목은 2자 이상이어야 합니다.");
      }
    });

    it("catches unhandled errors via withErrorHandler without leaking stack", async () => {
      const handler = withErrorHandler(async () => {
        throw new Error("DB connection failed");
      });
      const res = await handler();
      expect(res.status).toBe(500);
      const body = await res.json();
      expect(body.success).toBe(false);
      expect(body.error.code).toBe("INTERNAL_ERROR");
    });
  });

  describe("auth.ts", () => {
    it("returns default demo user when no headers are provided", () => {
      const user = getCurrentUser();
      expect(user?.id).toBe("user-gamer-1");
      expect(user?.role).toBe("member");
    });

    it("throws 401 UNAUTHORIZED when x-user-id is anonymous", () => {
      const req = new Request("http://localhost/api/subscriptions", {
        headers: { "x-user-id": "anonymous" },
      });
      expect(() => requireAuth(req)).toThrow(AppError);
      try {
        requireAuth(req);
      } catch (err) {
        expect((err as AppError).statusCode).toBe(401);
      }
    });

    it("enforces admin role in requireAdmin()", () => {
      const memberReq = new Request("http://localhost/api/patches", {
        headers: { "x-user-id": "user-gamer-1" },
      });
      expect(() => requireAdmin(memberReq)).toThrow(AppError);

      const adminReq = new Request("http://localhost/api/patches", {
        headers: { "x-user-id": "user-admin-1" },
      });
      const admin = requireAdmin(adminReq);
      expect(admin.role).toBe("admin");
    });
  });
});
