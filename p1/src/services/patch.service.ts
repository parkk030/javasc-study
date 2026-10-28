import type { Patch, PatchChangeCounts } from "@/domain/types";
import type {
  CreatePatchInput,
  PatchFilterInput,
} from "@/domain/schemas/patch-radar.schema";
import { Errors } from "@/lib/errors";
import {
  patchRadarRepository,
  type PatchListResult,
  type PatchRadarRepository,
} from "@/repositories/patch-radar.repository";
import {
  notificationService,
  type DispatchSummary,
  type NotificationService,
} from "./notification.service";

export function computePatchChangeCounts(patch: Patch): PatchChangeCounts {
  const counts: PatchChangeCounts = {
    buff: 0,
    nerf: 0,
    adjusted: 0,
    bugfix: 0,
    new: 0,
  };

  for (const change of patch.changes) {
    counts[change.type] += 1;
  }

  return counts;
}

export class PatchService {
  constructor(
    private readonly repo: PatchRadarRepository = patchRadarRepository,
    private readonly notifier: NotificationService = notificationService
  ) {}

  public async listPatches(filter?: PatchFilterInput): Promise<PatchListResult> {
    return this.repo.listPatches(filter);
  }

  public async getPatchDetail(id: string): Promise<{
    patch: Patch;
    changeCounts: PatchChangeCounts;
  }> {
    const patch = await this.repo.getPatchById(id);
    if (!patch) {
      throw Errors.notFound(`패치노트('${id}')를 찾을 수 없습니다.`);
    }

    return {
      patch,
      changeCounts: computePatchChangeCounts(patch),
    };
  }

  public async createPatchAndDispatch(input: CreatePatchInput): Promise<{
    patch: Patch;
    dispatch: DispatchSummary;
  }> {
    const game = await this.repo.getGameBySlug(input.gameSlug);
    if (!game) {
      throw Errors.validation(
        `지원하지 않는 게임 슬러그('${input.gameSlug}')입니다.`
      );
    }

    const patch = await this.repo.createPatch(input);
    const dispatch = await this.notifier.dispatchPatchNotifications(patch);

    return { patch, dispatch };
  }
}

export const patchService = new PatchService();
