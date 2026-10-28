import type { Subscription } from "@/domain/types";
import type { UpsertSubscriptionInput } from "@/domain/schemas/patch-radar.schema";
import { Errors } from "@/lib/errors";
import {
  patchRadarRepository,
  type PatchRadarRepository,
} from "@/repositories/patch-radar.repository";

export class SubscriptionService {
  constructor(
    private readonly repo: PatchRadarRepository = patchRadarRepository
  ) {}

  public async listUserSubscriptions(userId: string): Promise<Subscription[]> {
    return this.repo.listSubscriptionsByUser(userId);
  }

  public async subscribeOrUpdate(
    userId: string,
    input: UpsertSubscriptionInput
  ): Promise<Subscription> {
    const game = await this.repo.getGameBySlug(input.gameSlug);
    if (!game) {
      throw Errors.notFound(`'${input.gameSlug}' 게임을 찾을 수 없습니다.`);
    }

    return this.repo.upsertSubscription(userId, input);
  }

  public async unsubscribe(
    userId: string,
    gameSlug: string
  ): Promise<{ unsubscribed: boolean; gameSlug: string }> {
    if (!gameSlug || gameSlug.trim().length === 0) {
      throw Errors.validation("구독 해제할 gameSlug 파라미터가 필요합니다.");
    }

    const removed = await this.repo.deleteSubscription(userId, gameSlug);
    if (!removed) {
      throw Errors.notFound("구독 중인 게임 내역을 찾을 수 없습니다.");
    }

    return { unsubscribed: true, gameSlug };
  }
}

export const subscriptionService = new SubscriptionService();
