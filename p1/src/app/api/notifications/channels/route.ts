import { updateNotificationChannelSchema } from "@/domain/schemas/patch-radar.schema";
import { requireAuth } from "@/lib/auth";
import { ok, withErrorHandler } from "@/lib/response";
import { notificationService } from "@/services/notification.service";

export const GET = withErrorHandler(async (req: Request) => {
  const user = requireAuth(req);
  const channel = await notificationService.getChannel(user.id);
  return ok(channel);
});

export const PUT = withErrorHandler(async (req: Request) => {
  const user = requireAuth(req);
  const body: unknown = await req.json();
  const validated = updateNotificationChannelSchema.parse(body);

  const updated = await notificationService.updateChannel(user.id, validated);
  return ok(updated);
});
