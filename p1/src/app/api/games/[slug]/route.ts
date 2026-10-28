import { ok, withErrorHandler } from "@/lib/response";
import { gameService } from "@/services/game.service";

export interface RouteContext {
  params: Promise<{ slug: string }>;
}

export const GET = withErrorHandler(
  async (_req: Request, context: RouteContext) => {
    const { slug } = await context.params;
    const detail = await gameService.getGameHubDetail(slug);
    return ok(detail);
  }
);
