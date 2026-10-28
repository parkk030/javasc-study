import type { Game, Patch } from "@/domain/types";
import type { GameFilterInput } from "@/domain/schemas/patch-radar.schema";
import { Errors } from "@/lib/errors";
import {
  patchRadarRepository,
  type PatchRadarRepository,
} from "@/repositories/patch-radar.repository";

export interface GameHubDetail {
  game: Game;
  patches: Patch[];
}

export class GameService {
  constructor(
    private readonly repo: PatchRadarRepository = patchRadarRepository
  ) {}

  public async listGames(filter?: GameFilterInput): Promise<Game[]> {
    return this.repo.listGames(filter);
  }

  public async getGameHubDetail(slug: string): Promise<GameHubDetail> {
    const game = await this.repo.getGameBySlug(slug);
    if (!game) {
      throw Errors.notFound(`'${slug}' 게임을 찾을 수 없습니다.`);
    }

    const patchList = await this.repo.listPatches({
      gameSlug: slug,
      page: 1,
      limit: 50,
    });

    return {
      game,
      patches: patchList.items,
    };
  }
}

export const gameService = new GameService();
