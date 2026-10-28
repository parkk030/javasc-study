import { gameFilterSchema } from "@/domain/schemas/patch-radar.schema";
import { ok, withErrorHandler } from "@/lib/response";
import { gameService } from "@/services/game.service";

export const GET = withErrorHandler(async (req: Request) => {
  const { searchParams } = new URL(req.url);
  const filter = gameFilterSchema.parse({
    genre: searchParams.get("genre") ?? undefined,
    q: searchParams.get("q") ?? undefined,
  });

  const games = await gameService.listGames(filter);
  return ok(games, { total: games.length });
});
