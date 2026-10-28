import { NextRequest } from "next/server";
import { triggerCrawlSchema } from "@/domain/schemas/patch-radar.schema";
import { Errors } from "@/lib/errors";
import { fail, ok } from "@/lib/response";
import { patchRadarRepository } from "@/repositories/patch-radar.repository";
import { crawlerService } from "@/services/crawler.service";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const auto = searchParams.get("auto") === "1";

    if (auto) {
      const syncResult = await crawlerService.syncOfficialPatches({
        force: false,
      });
      return ok(syncResult);
    }

    const [schedules, logs] = await Promise.all([
      crawlerService.getSchedules(),
      patchRadarRepository.listCrawlLogs(20),
    ]);

    return ok({
      syncedAt: new Date().toISOString(),
      totalChecked: schedules.length,
      newlyCrawledCount: 0,
      dispatchedNotificationsCount: 0,
      newPatches: [],
      logs,
      schedules,
    });
  } catch (error) {
    return fail(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    let rawBody: unknown = {};
    try {
      rawBody = await request.json();
    } catch {
      rawBody = {};
    }

    const parsed = triggerCrawlSchema.safeParse(rawBody);
    if (!parsed.success) {
      throw Errors.validation(
        parsed.error.issues[0]?.message ?? "유효하지 않은 크롤링 요청입니다.",
        parsed.error.flatten()
      );
    }

    const result = await crawlerService.syncOfficialPatches({
      gameSlug: parsed.data.gameSlug,
      force: parsed.data.force ?? true,
    });

    return ok(result);
  } catch (error) {
    return fail(error);
  }
}
