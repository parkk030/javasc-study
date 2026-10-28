import { testNotificationSchema } from "@/domain/schemas/patch-radar.schema";
import { requireAuth } from "@/lib/auth";
import { ok, withErrorHandler } from "@/lib/response";
import { notificationService } from "@/services/notification.service";

export const POST = withErrorHandler(async (req: Request) => {
  const user = requireAuth(req);
  const body: unknown = await req.json().catch(() => ({}));
  const validated = testNotificationSchema.parse(body);

  const result = await notificationService.sendTestNotification(
    user.id,
    validated
  );
  return ok(result);
});
