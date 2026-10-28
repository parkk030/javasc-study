import { ok, withErrorHandler } from "@/lib/response";
import { patchService } from "@/services/patch.service";

export interface PatchRouteContext {
  params: Promise<{ id: string }>;
}

export const GET = withErrorHandler(
  async (_req: Request, context: PatchRouteContext) => {
    const { id } = await context.params;
    const detail = await patchService.getPatchDetail(id);
    return ok(detail);
  }
);
