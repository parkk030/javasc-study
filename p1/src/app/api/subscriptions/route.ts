import { upsertSubscriptionSchema } from "@/domain/schemas/patch-radar.schema";
import { requireAuth } from "@/lib/auth";
import { ok, withErrorHandler } from "@/lib/response";
import { subscriptionService } from "@/services/subscription.service";

export const GET = withErrorHandler(async (req: Request) => {
  const user = requireAuth(req);
  const subscriptions = await subscriptionService.listUserSubscriptions(user.id);
  return ok(subscriptions, { total: subscriptions.length });
});

export const POST = withErrorHandler(async (req: Request) => {
  const user = requireAuth(req);
  const body: unknown = await req.json();
  const validated = upsertSubscriptionSchema.parse(body);

  const sub = await subscriptionService.subscribeOrUpdate(user.id, validated);
  return ok(sub, undefined, 201);
});

export const DELETE = withErrorHandler(async (req: Request) => {
  const user = requireAuth(req);
  const { searchParams } = new URL(req.url);
  const gameSlug = searchParams.get("gameSlug") ?? "";

  const result = await subscriptionService.unsubscribe(user.id, gameSlug);
  return ok(result);
});
