import {
  createPatchSchema,
  patchFilterSchema,
} from "@/domain/schemas/patch-radar.schema";
import { requireAuth } from "@/lib/auth";
import { ok, withErrorHandler } from "@/lib/response";
import { computePatchChangeCounts, patchService } from "@/services/patch.service";

export const GET = withErrorHandler(async (req: Request) => {
  const { searchParams } = new URL(req.url);
  const filter = patchFilterSchema.parse({
    gameSlug: searchParams.get("gameSlug") ?? undefined,
    category: searchParams.get("category") ?? undefined,
    changeType: searchParams.get("changeType") ?? undefined,
    q: searchParams.get("q") ?? undefined,
    page: searchParams.get("page") ?? undefined,
    limit: searchParams.get("limit") ?? undefined,
  });

  const result = await patchService.listPatches(filter);
  const itemsWithCounts = result.items.map((patch) => ({
    ...patch,
    changeCounts: computePatchChangeCounts(patch),
  }));

  return ok(itemsWithCounts, {
    page: result.page,
    limit: result.limit,
    total: result.total,
  });
});

export const POST = withErrorHandler(async (req: Request) => {
  requireAuth(req);
  const body: unknown = await req.json();
  const validated = createPatchSchema.parse(body);

  const created = await patchService.createPatchAndDispatch(validated);
  return ok(created, undefined, 201);
});
