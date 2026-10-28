import { markNotificationsReadSchema } from "@/domain/schemas/patch-radar.schema";
import { requireAuth } from "@/lib/auth";
import { ok, withErrorHandler } from "@/lib/response";
import { notificationService } from "@/services/notification.service";

export const GET = withErrorHandler(async (req: Request) => {
  const user = requireAuth(req);
  const result = await notificationService.listUserNotifications(user.id);
  return ok(result.items, { unreadCount: result.unreadCount, total: result.items.length });
});

export const PATCH = withErrorHandler(async (req: Request) => {
  const user = requireAuth(req);
  const body: unknown = await req.json();
  const validated = markNotificationsReadSchema.parse(body);

  const result = await notificationService.markNotificationsRead(
    user.id,
    validated
  );
  return ok(result);
});
