import type {
  CrawlLogItem,
  Game,
  NotificationChannel,
  NotificationItem,
  Patch,
  Subscription,
} from "@/domain/types";

export const SEED_GAMES: Game[] = [
  {
    id: "game-lol",
    slug: "league-of-legends",
    name: "리그 오브 레전드",
    genre: "MOBA",
    iconUrl: "⚔️",
    officialUrl: "https://www.leagueoflegends.com/ko-kr/news/tags/patch-notes/",
    currentVersion: "v26.19",
    subscriberCount: 14820,
    lastPatchedAt: "2026-09-23T02:00:00.000Z",
    patchCycleLabel: "격주 수요일 정기 패치",
    maintenanceEndTimeLabel: "수요일 11:00 KST (점검 종료 직후 크롤링)",
    patchCompletionDayOfWeek: 3,
    patchCompletionHourKst: 11,
    lastCrawledAt: "2026-09-23T02:05:00.000Z",
    description:
      "월드 챔피언십 패치 및 챔피언 밸런스(암베사, 애쉬, 카시오페아, 다이애나, 케넨, 킨드레드, 크산테, 릴리아) 업데이트를 공식 홈페이지에서 자동 수집합니다.",
  },
  {
    id: "game-valorant",
    slug: "valorant",
    name: "발로란트",
    genre: "FPS",
    iconUrl: "🎯",
    officialUrl: "https://playvalorant.com/ko-kr/news/game-updates/",
    currentVersion: "v13.06",
    subscriberCount: 11250,
    lastPatchedAt: "2026-09-22T22:00:00.000Z",
    patchCycleLabel: "격주 수요일 업데이트",
    maintenanceEndTimeLabel: "수요일 10:00 KST (패치 종료 직후 크롤링)",
    patchCompletionDayOfWeek: 3,
    patchCompletionHourKst: 10,
    lastCrawledAt: "2026-09-22T22:05:00.000Z",
    description:
      "액트 6 시작! 요원 업데이트(킬조이 알람봇 수정), 경쟁전 맵 등급(C~S) 시스템, 대기열 UI 개편 소식을 공식 홈페이지에서 자동 크롤링합니다.",
  },
  {
    id: "game-pubg",
    slug: "pubg",
    name: "배틀그라운드",
    genre: "BattleRoyale",
    iconUrl: "🪂",
    officialUrl: "https://pubg.com/ko/news",
    currentVersion: "v43.1",
    subscriberCount: 8640,
    lastPatchedAt: "2026-10-07T07:30:00.000Z",
    patchCycleLabel: "매주 수요일 정기 점검",
    maintenanceEndTimeLabel: "수요일 16:30 KST (정기점검 종료 직후 크롤링)",
    patchCompletionDayOfWeek: 3,
    patchCompletionHourKst: 16,
    lastCrawledAt: "2026-10-07T07:35:00.000Z",
    description:
      "업데이트 43.2 패치 노트 및 맵 서비스 리포트, 총기 밸런스, 주간 정기 서버 점검 완료 내역을 공식 홈페이지에서 실시간 수집합니다.",
  },
  {
    id: "game-overwatch2",
    slug: "overwatch-2",
    name: "오버워치 2",
    genre: "FPS",
    iconUrl: "🛡️",
    officialUrl: "https://overwatch.blizzard.com/ko-kr/news/patch-notes/",
    currentVersion: "2026.10.07",
    subscriberCount: 6930,
    lastPatchedAt: "2026-10-07T19:00:00.000Z",
    patchCycleLabel: "시즌제 & 핫픽스 밸런스 패치",
    maintenanceEndTimeLabel: "수요일 04:00 KST (글로벌 패치 배포 직후 크롤링)",
    patchCompletionDayOfWeek: 3,
    patchCompletionHourKst: 4,
    lastCrawledAt: "2026-10-07T19:05:00.000Z",
    description:
      "독트린, 솜브라, 로드호그, 키리코, D.Mon 등 영웅 밸런스 수치 조정과 핫픽스 내역을 블리자드 공식 패치노트에서 실시간 파싱합니다.",
  },
  {
    id: "game-lostark",
    slug: "lost-ark",
    name: "로스트아크",
    genre: "MMORPG",
    iconUrl: "⚓",
    officialUrl: "https://lostark.game.onstove.com/News/Notice/List",
    currentVersion: "2026.10.09 임시점검",
    subscriberCount: 12910,
    lastPatchedAt: "2026-10-09T01:00:00.000Z",
    patchCycleLabel: "매주 수요일 06:00~10:00 정기점검",
    maintenanceEndTimeLabel: "수요일 10:00 KST (정기점검 종료 직후 크롤링)",
    patchCompletionDayOfWeek: 3,
    patchCompletionHourKst: 10,
    lastCrawledAt: "2026-10-09T01:05:00.000Z",
    description:
      "10월 14일(수) 정기 점검 완료 안내 및 카제로스 레이드 3막 & 종막 익스트림 업데이트 내역을 공식 홈페이지에서 자동 수집합니다.",
  },
  {
    id: "game-maplestory",
    slug: "maplestory",
    name: "메이플스토리",
    genre: "MMORPG",
    iconUrl: "🍁",
    officialUrl: "https://maplestory.nexon.com/News/Update",
    currentVersion: "v1.2.418",
    subscriberCount: 9540,
    lastPatchedAt: "2026-10-08T01:00:00.000Z",
    patchCycleLabel: "목요일 정기점검 & 클라이언트 업데이트",
    maintenanceEndTimeLabel: "목요일 10:00 KST (점검 종료 직후 크롤링)",
    patchCompletionDayOfWeek: 4,
    patchCompletionHourKst: 10,
    lastCrawledAt: "2026-10-08T01:05:00.000Z",
    description:
      "클라이언트 1.2.419(5) 업데이트 안내(스킬 조정, 솔 헤카테, 연무장, 체인지 서큘레이터, 오류 수정)를 공식 홈페이지에서 자동 크롤링합니다.",
  },
];

export const SEED_PATCHES: Patch[] = [
  {
    id: "patch-lol-2619",
    gameId: "game-lol",
    gameSlug: "league-of-legends",
    gameName: "리그 오브 레전드",
    version: "v26.19",
    title:
      "리그 오브 레전드 26.19 패치 노트 — 월드 챔피언십 대비 밸런스 및 아레나 신규 증강",
    category: "balance",
    tldr: [
      "월드 챔피언십이 코앞으로 다가왔습니다. 더 많은 챔피언이 클래식에 합류하고 아레나에 새로운 증강이 추가됩니다.",
      "아리·신드라 등 주요 미드 메이지 챔피언의 중후반 주문력 계수가 상향되었습니다.",
      "과도한 생존력을 보이던 요네와 크산테의 초반 방어/보호막 수치가 하향되었습니다.",
    ],
    changes: [
      {
        type: "buff",
        target: "아리",
        summary: "현혹의 구슬(Q) 왕복 주문력 계수 0.45 → 0.52 상향",
        details: "중반 라인 클리어와 교전 포킹 화력을 보완했습니다.",
      },
      {
        type: "buff",
        target: "신드라",
        summary: "어둠 구체(Q) 기본 피해량 전 구간 +10 증가",
      },
      {
        type: "nerf",
        target: "요네",
        summary: "운명봉인(E) 이동 속도 증가량 10~30% → 10~25% 하향",
      },
      {
        type: "nerf",
        target: "크산테",
        summary: "기본 체력 재생 및 패시브 표식 피해량 하향",
      },
      {
        type: "bugfix",
        target: "내셔 남작",
        summary: "내셔 남작 처치 시 간헐적으로 체력 회복 효과가 누락되던 버그 수정",
      },
    ],
    sourceUrl:
      "https://www.leagueoflegends.com/ko-kr/news/game-updates/league-of-legends-patch-26-19-notes/",
    maintenanceWindow: "수요일 06:00 ~ 11:00 KST (공식 홈페이지 자동 수집)",
    publishedAt: "2026-09-22T18:00:00.000Z",
    isAutoCrawled: true,
    crawledAt: "2026-09-23T02:00:00.000Z",
    patchCompletedAt: "2026-09-23T02:00:00.000Z",
  },
  {
    id: "patch-val-1306",
    gameId: "game-valorant",
    gameSlug: "valorant",
    gameName: "발로란트",
    version: "v13.06",
    title: "발로란트 13.06 패치 노트 — 제트·오퍼레이터 밸런스 조정 및 선셋 맵 업데이트",
    category: "balance",
    tldr: [
      "발로란트 대규모 13.06 업데이트가 공식 홈페이지에서 자동 크롤링되었습니다.",
      "제트 순풍(E) 및 소바 정찰용 볼트 시인성이 개선되고 오퍼레이터 가격/반동이 조정되었습니다.",
      "선셋 B 사이트 진입로 구조물 간격이 재설계되었습니다.",
    ],
    changes: [
      {
        type: "buff",
        target: "소바",
        summary: "정찰용 볼트(E) 스캔 범위 표시 가시성 개선 및 쿨타임 40초 → 35초 감소",
      },
      {
        type: "nerf",
        target: "오퍼레이터",
        summary: "줌 상태 이동 시 탄퍼짐 회복 시간 0.35초 → 0.45초 증가",
      },
      {
        type: "adjusted",
        target: "제트",
        summary: "순풍(E) 활성화 사운드 거리별 감쇠 곡선 조정",
      },
    ],
    sourceUrl:
      "https://playvalorant.com/ko-kr/news/game-updates/valorant-patch-notes-13-06/",
    maintenanceWindow: "수요일 06:00 ~ 10:00 KST (공식 홈페이지 자동 수집)",
    publishedAt: "2026-09-22T13:00:00.000Z",
    isAutoCrawled: true,
    crawledAt: "2026-09-22T22:00:00.000Z",
    patchCompletedAt: "2026-09-22T22:00:00.000Z",
  },
  {
    id: "patch-loa-20261009",
    gameId: "game-lostark",
    gameSlug: "lost-ark",
    gameName: "로스트아크",
    version: "2026.10.09 임시점검",
    title: "10월 9일(금) 로스트아크 임시 점검 완료 안내 — 레이드 관문 안정화 핫픽스",
    category: "hotfix",
    tldr: [
      "10월 9일(금) 임시 점검 완료 직후 공식 홈페이지에서 자동 크롤링된 핫픽스입니다.",
      "카제로스 레이드 진행 중 간헐적으로 발생하던 협동 기믹 판정 지연 현상이 수정되었습니다.",
    ],
    changes: [
      {
        type: "bugfix",
        target: "카제로스 레이드",
        summary: "특정 패턴 파훼 직후 간헐적으로 발생하던 이펙트 잔상 오류 수정",
      },
    ],
    sourceUrl: "https://lostark.game.onstove.com/News/Notice/Views/13569",
    maintenanceWindow: "2026-10-09 06:00 ~ 09:00 KST (임시점검 종료 기준 자동 수집)",
    publishedAt: "2026-10-09T01:00:00.000Z",
    isAutoCrawled: true,
    crawledAt: "2026-10-09T01:05:00.000Z",
    patchCompletedAt: "2026-10-09T01:00:00.000Z",
  },
];

export const SEED_SUBSCRIPTIONS: Subscription[] = [
  {
    id: "sub-demo-lol",
    userId: "user-gamer-1",
    gameSlug: "league-of-legends",
    keywords: ["암베사", "크산테", "아리", "요네"],
    notifyHotfixOnly: false,
    createdAt: "2026-10-10T12:00:00.000Z",
  },
  {
    id: "sub-demo-val",
    userId: "user-gamer-1",
    gameSlug: "valorant",
    keywords: ["킬조이", "제트", "오퍼레이터"],
    notifyHotfixOnly: false,
    createdAt: "2026-10-11T12:00:00.000Z",
  },
];

export const SEED_NOTIFICATION_CHANNELS: NotificationChannel[] = [
  {
    userId: "user-gamer-1",
    discordWebhookUrl:
      "https://discord.com/api/webhooks/1234567890/demo_patchradar_webhook_token",
    emailEnabled: true,
    webPushEnabled: true,
    onlyKeywordMatch: false,
    updatedAt: "2026-10-15T12:00:00.000Z",
  },
];

export const SEED_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "notif-seed-1",
    userId: "user-gamer-1",
    patchId: "patch-lol-2619",
    gameSlug: "league-of-legends",
    gameName: "리그 오브 레전드",
    version: "v26.19",
    title: "[리그 오브 레전드] v26.19 패치노트 알림",
    message:
      "관심 키워드 [아리, 요네] 변경 내역이 포함된 26.19 패치노트가 자동 수집되었습니다.",
    matchedKeywords: ["아리", "요네"],
    isRead: false,
    createdAt: "2026-09-23T02:01:00.000Z",
  },
  {
    id: "notif-seed-2",
    userId: "user-gamer-1",
    patchId: "patch-val-1306",
    gameSlug: "valorant",
    gameName: "발로란트",
    version: "v13.06",
    title: "[발로란트] v13.06 패치노트 알림",
    message:
      "관심 키워드 [제트, 오퍼레이터] 변경 내역이 포함된 13.06 패치노트가 자동 수집되었습니다.",
    matchedKeywords: ["제트", "오퍼레이터"],
    isRead: false,
    createdAt: "2026-09-22T22:01:00.000Z",
  },
];

export const SEED_CRAWL_LOGS: CrawlLogItem[] = [
  {
    id: "crawl-seed-1",
    gameSlug: "league-of-legends",
    gameName: "리그 오브 레전드",
    officialUrl:
      "https://www.leagueoflegends.com/ko-kr/news/game-updates/league-of-legends-patch-26-19-notes/",
    maintenanceEndTimeLabel: "수요일 11:00 KST (점검 종료 직후 크롤링)",
    status: "NEW_PATCH_CRAWLED",
    detectedVersion: "v26.19",
    detectedTitle:
      "리그 오브 레전드 26.19 패치 노트 — 월드 챔피언십 대비 밸런스 및 아레나 신규 증강",
    httpStatus: 200,
    patchId: "patch-lol-2619",
    dispatchedNotifications: 1,
    crawledAt: "2026-09-23T02:05:00.000Z",
  },
  {
    id: "crawl-seed-2",
    gameSlug: "valorant",
    gameName: "발로란트",
    officialUrl:
      "https://playvalorant.com/ko-kr/news/game-updates/valorant-patch-notes-13-06/",
    maintenanceEndTimeLabel: "수요일 10:00 KST (패치 종료 직후 크롤링)",
    status: "NEW_PATCH_CRAWLED",
    detectedVersion: "v13.06",
    detectedTitle:
      "발로란트 13.06 패치 노트 — 제트·오퍼레이터 밸런스 조정 및 선셋 맵 업데이트",
    httpStatus: 200,
    patchId: "patch-val-1306",
    dispatchedNotifications: 1,
    crawledAt: "2026-09-22T22:05:00.000Z",
  },
];
