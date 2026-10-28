# TASKS.md — 게임 패치노트 알림 서비스 (PatchRadar) 원자적 작업 큐

> **운용 규칙 (Task Queue Rules)**  
> 1. 에이전트는 한 번의 루프 이터레이션(`LOOP.md`)에서 **위에서부터 순서대로 단 하나의 `[ ]` 태스크**만 선택하여 수행합니다.  
> 2. 각 태스크의 **검증 기준(Acceptance Criteria)**과 `HARNESS.md`의 4대 검증 게이트(`npm run harness:verify`)를 모두 통과하기 전에는 `[x]`로 표시할 수 없습니다.  
> 3. 모든 구현은 `SPEC.md`와 `ARCHITECTURE.md`에 정의된 **7대 페이지 구조 및 API 명세**를 정확히 따릅니다.

---

## Phase 1: 프로젝트 부트스트랩 및 하네스 파이프라인 구축 (Foundation & Harness)

- [x] **T-01: Next.js 서버리스 웹 프로젝트 스캐폴딩 및 4대 하네스 스크립트 구성**
  - **목표**: Next.js (App Router) + TypeScript + Tailwind CSS + Vitest + Zod 기반 프로젝트 초기화 및 하네스 명령어 구성.
  - **검증 기준 (Acceptance Criteria)**:
    - `package.json`에 `typecheck`, `lint`, `test`, `build`, `harness:verify` 스크립트가 모두 정의되어 있을 것.
    - `tsconfig.json`에 `strict: true`가 활성화되어 있을 것.
    - `npm run harness:verify` 실행 시 Exit Code `0`으로 통과할 것.

- [x] **T-02: 환경변수 검증기(`env.ts`), 인증 헬퍼(`auth.ts`), 표준 에러/응답 유틸리티 구현**
  - **목표**: 서버리스 런타임 환경변수 검증, 요청 사용자 컨텍스트 추출(`x-user-id` 또는 기본 데모 유저 지원), 커스텀 에러(`AppError`), 표준 JSON 응답 빌더(`ok`, `fail`, `withErrorHandler`) 구현.
  - **검증 기준 (Acceptance Criteria)**:
    - `src/lib/env.ts`, `src/lib/auth.ts`, `src/lib/errors.ts`, `src/lib/response.ts` 및 `src/app/api/health/route.ts` 구현.
    - `tests/unit/lib.test.ts` 및 `tests/integration/health.test.ts` 통과.

---

## Phase 2: 패치노트·구독·알림 도메인 모델 및 데이터 계층 (Domain & Repository)

- [x] **T-03: 게임·패치노트·구독·알림 도메인 타입 및 Zod 검증 스키마(`src/domain`) 구현**
  - **목표**: `SPEC.md` 4절에 정의된 `Game`, `Patch`(버프/너프 `changes` 포함), `Subscription`, `NotificationChannel`, `Notification` 타입과 입력 검증용 Zod 스키마 구현.
  - **검증 기준 (Acceptance Criteria)**:
    - `src/domain/types/index.ts` 및 `src/domain/schemas/patch-radar.schema.ts` 구현 (Discord Webhook URL 정규식 검증, 패치 변경 타입 `buff | nerf | adjusted | bugfix | new` 검증 포함).
    - `tests/unit/schemas.test.ts`에서 유효/무효 입력 검증 테스트 100% 통과.

- [x] **T-04: 6대 시드 게임·패치노트 데이터 및 서버리스 Repository(`src/repositories`) 구현**
  - **목표**: LoL, 발로란트, 배그, 오버워치2, 로스트아크, 메이플스토리 시드 데이터(`seed-data.ts`)와 CRUD/필터링/구독/알림 저장을 수행하는 `PatchRadarRepository` 구현.
  - **검증 기준 (Acceptance Criteria)**:
    - `src/repositories/seed-data.ts`, `src/repositories/patch-radar.repository.ts` 구현.
    - `tests/unit/repository.test.ts`에서 게임 장르 필터, 패치 카테고리/버프·너프/검색어 필터, 구독 Upsert/해제 테스트 통과.

- [x] **T-05: 패치노트·구독·키워드 매칭 알림 디스패치 서비스(`src/services`) 구현**
  - **목표**: 신규 패치 등록 시 구독자의 관심 키워드(`keywords`)와 패치 내역(`title`, `tldr`, `changes`)을 매칭하여 인앱 알림 생성 및 Discord Webhook 발송(테스트 발송 포함)을 수행하는 비즈니스 서비스 계층 구현.
  - **검증 기준 (Acceptance Criteria)**:
    - `src/services/game.service.ts`, `src/services/patch.service.ts`, `src/services/subscription.service.ts`, `src/services/notification.service.ts` 구현.
    - `tests/unit/services.test.ts`에서 키워드 매칭 알림 생성, 핫픽스 전용 필터, 웹훅 테스트 발송 시나리오 단위 테스트 통과.

---

## Phase 3: 서버리스 API 라우트 핸들러 구현 (Serverless API Layer)

- [x] **T-06: 게임 및 패치노트 서버리스 API (`/api/games`, `/api/games/[slug]`, `/api/patches`, `/api/patches/[id]`) 구현**
  - **목표**: 공개 탐색 및 관리자 패치 등록을 위한 서버리스 API 엔드포인트 4종 구현.
  - **검증 기준 (Acceptance Criteria)**:
    - `src/app/api/games/route.ts`, `src/app/api/games/[slug]/route.ts`, `src/app/api/patches/route.ts`, `src/app/api/patches/[id]/route.ts` 구현.
    - `tests/integration/patches-api.test.ts`에서 목록 필터링, 상세 조회(`404` 포함), 신규 패치 등록(`201`) 통합 테스트 통과.

- [x] **T-07: 구독 및 알림 채널 서버리스 API (`/api/subscriptions`, `/api/notifications`, `/api/notifications/channels`, `/api/notifications/test`) 구현**
  - **목표**: 게임 구독 추가/삭제, 인앱 알림 조회/읽음 처리, Discord 웹훅 채널 설정 및 즉시 테스트 알림 발송 API 구현.
  - **검증 기준 (Acceptance Criteria)**:
    - `src/app/api/subscriptions/route.ts`, `src/app/api/notifications/route.ts`, `src/app/api/notifications/channels/route.ts`, `src/app/api/notifications/test/route.ts` 구현.
    - `tests/integration/notifications-api.test.ts`에서 구독 토글 → 신규 패치 등록 → 인앱 알림 생성 및 읽음 처리 E2E API 흐름 통과.

---

## Phase 4: 전체 페이지 UI 및 인터랙션 구현 (7-Page Frontend Implementation)

- [x] **T-08: 글로벌 레이아웃(Navbar/Footer) 및 공통 UI·패치 카드 컴포넌트 구현**
  - **목표**: 7개 페이지를 연결하는 상단 네비게이션 바(안 읽은 알림 카운트 배지 포함), 4대 상태 뷰(Loading/Empty/Error/Success), 버프(🔺)/너프(🔻) 시각화 배지 및 `PatchCard`, `GameCard` 컴포넌트 구현.
  - **검증 기준 (Acceptance Criteria)**:
    - `src/components/layout/Navbar.tsx`, `src/components/ui/*`, `src/components/features/*` 구현.
    - `npm run harness:verify` 통과.

- [x] **T-09: 공개 탐색 페이지 4종 (`/`, `/games`, `/games/[slug]`, `/patches/[id]`) 구현**
  - **목표**:
    1. `/` — 실시간 통합 패치 피드(게임 탭, 패치 유형 필터, 키워드 검색, 원클릭 구독)
    2. `/games` — 장르별 지원 게임 디렉터리 및 구독 토글
    3. `/games/[slug]` — 게임별 패치 히스토리 허브 및 맞춤 키워드 설정
    4. `/patches/[id]` — 패치노트 상세(3줄 TL;DR 요약, 본문 내 캐릭터/무기 실시간 검색, 🔺버프/🔻너프/🛠️버그수정 탭 분류)
  - **검증 기준 (Acceptance Criteria)**:
    - 4개 라우트 페이지 파일 구현 및 동적 라우트 빌드/타입 검증 통과.

- [x] **T-10: 개인화 및 운영 페이지 3종 (`/dashboard`, `/settings/notifications`, `/admin/patches`, `/login`) 구현**
  - **목표**:
    1. `/dashboard` — 내 구독 게임 전용 패치 피드, 관심 키워드 태그 편집, 인앱 알림함(읽음 처리)
    2. `/settings/notifications` — Discord Webhook URL 설정 및 `[⚡ 테스트 알림 발송]` 인터랙션, 수신 조건 토글
    3. `/admin/patches` & `/login` — 신규 패치노트 실시간 등록(구독자 알림 즉시 발송 확인용) 및 계정/데모 전환 페이지
  - **검증 기준 (Acceptance Criteria)**:
    - 모든 페이지 라우트 구현 완료 및 `npm run harness:verify` 통과.

---

## Phase 5: DB 마이그레이션 SQL 및 프로덕션 배포 준비 (Production Readiness)

- [x] **T-11: Supabase/PostgreSQL 스키마 SQL(`supabase/schema.sql`) 및 `.env.example` 작성**
  - **목표**: `SPEC.md` 4절의 5개 핵심 테이블(`games`, `patches`, `subscriptions`, `notification_channels`, `notifications`)과 인덱스, RLS 정책이 담긴 SQL 스크립트 및 환경변수 템플릿 작성.
  - **검증 기준 (Acceptance Criteria)**:
    - `supabase/schema.sql`, `.env.example`, `README.md` 작성 완료 및 전체 하네스 검증 최종 통과.

---

## Phase 6: 아임웹(`imweb.me`) Clay 디자인 시스템 기반 UI 전면 리디자인 (Completed)

- [x] **T-12: 아임웹 Clay 디자인 시스템 CSS 변수(`globals.css`) 및 Pretendard 타이포그래피/토큰 적용**
  - **목표**: `DESIGN.md` 2~3절에 정의된 아임웹 `light-only` 컬러 토큰(`#FFFFFF`, `#F8F9FB`, `#15181E`, `#717680`, `#E2E5E9`, `#00B9FF`, `#00B505`, `#ED1515`, `#FF52C4`), Pretendard 폰트 스택, 레이어 그림자(`shadow-clay-layer`), 쉬머 애니메이션을 `src/app/globals.css` 및 `src/app/layout.tsx`에 반영.
  - **검증 기준 (Acceptance Criteria)**:
    - `DESIGN.md`의 모든 `--clay-*` CSS 변수 및 유틸리티 클래스가 `globals.css`에 정의될 것.
    - `npm run harness:verify` 통과.

- [x] **T-13: 아임웹 GNB 헤더(`72px`), 에디토리얼 푸터, 공통 배지·카드 컴포넌트(`PatchCard`, `GameCard`, `StateViews`) 리디자인**
  - **목표**: `DESIGN.md` 4~5절 규격에 맞춰 아임웹 스타일 GNB(`h-[72px]`, `max-w-[2400px]`, `px-[32px]`, 호버 드롭다운/마이크로 배지 `#FF52C4`, 우측 Outlined/Solid 버튼), 세로 파이프(`w-px h-[10px] bg-[#E2E5E9]`) 푸터, 화이트 서피스 기반 `PatchCard`·`GameCard`·`StateViews` 전면 개편.
  - **검증 기준 (Acceptance Criteria)**:
    - `Navbar.tsx`, `Footer.tsx`, `StateViews.tsx`, `PatchCard.tsx`, `GameCard.tsx`가 아임웹 라이트 테마 디자인 토큰으로 전환될 것.
    - `npm run harness:verify` 통과.

- [x] **T-14: 공개 탐색 페이지 4종(`/`, `/games`, `/games/[slug]`, `/patches/[id]`) 아임웹 레이아웃 및 그리드 리디자인**
  - **목표**:
    1. `/` — 아임웹 히어로 대형 타이포그래피(`36px → 64px → 80px`) + `imweb AI` 프롬프트 박스 스타일의 통합 패치 검색/필터 독(`rounded-[16px]`, `shadow-clay-layer`) + 벤토 그리드 피드 적용
    2. `/games`, `/games/[slug]`, `/patches/[id]` — 화이트/라이트 슬레이트(`#F8F9FB`) 서피스 계층, `1px solid #E2E5E9` 보더 그리드, Clay 시맨틱 컬러(NeonGreen 버프 / CoralRed 너프 / Blue 버그수정) 탭 뷰 적용
  - **검증 기준 (Acceptance Criteria)**:
    - 4개 공개 페이지 리디자인 완료 및 `npm run harness:verify` 통과.

- [x] **T-15: 개인화/운영 페이지 4종(`/dashboard`, `/settings/notifications`, `/admin/patches`, `/login`) 아임웹 스타일 리디자인**
  - **목표**: 12컬럼 비대칭 대시보드(`4:8` 그리드), 클린 폼 컨트롤(`rounded-[8px]`, `border-[#DBDEE3]`, 포커스 `#15181E`), 아임웹 스타일 알림함/웹훅 테스트 카드 UI 적용.
  - **검증 기준 (Acceptance Criteria)**:
    - 4개 페이지 리디자인 완료 및 최종 `npm run harness:verify` 4대 게이트 100% 통과.

---

## Phase 7: 패치 종료 시간 기준 공식 홈페이지 자동 크롤링 & 자동 노출 파이프라인 (Auto-Crawler)

- [x] **T-16: 게임별 패치 종료(점검 완료) 스케줄 모델 및 공식 홈페이지 자동 크롤러 서비스(`crawler.service.ts`) 구현**
  - **목표**:
    1. `Game` 도메인에 패치 종료 기준 시각(`maintenanceEndTimeLabel`, `patchCompletionHourKst`, `lastCrawledAt`)과 `Patch` 도메인에 자동 크롤링 메타데이터(`isAutoCrawled`, `crawledAt`) 및 크롤링 로그(`CrawlLogItem`) 추가
    2. `src/services/crawler.service.ts`에 각 게임의 공식 홈페이지(`officialUrl`)를 HTTP 크롤링(`fetch` + HTML/메타데이터 파싱 및 게임별 구조화 파서)하여 패치 종료 시각 기준으로 최신 업데이트 내용을 자동 수집·중복 제거·구독자 알림 자동 디스패치하는 `CrawlerService` 구현
  - **검증 기준 (Acceptance Criteria)**:
    - `tests/unit/crawler.test.ts` 단위 테스트 작성 및 통과.
    - `npm run harness:verify` 통과.

- [x] **T-17: 서버리스 자동 크롤링 API 라우트(`/api/crawler/sync`) 및 Vercel Cron 스케줄러(`vercel.json`) 구현**
  - **목표**:
    1. `GET /api/crawler/sync` (`?auto=1` 지원): 패치 종료 시각이 도래한 게임을 자동 판별하여 공식 홈페이지 업데이트를 크롤링하고 스케줄/로그 현황 반환
    2. `POST /api/crawler/sync`: 특정 게임 또는 전체 게임의 공식 홈페이지 업데이트 즉시 크롤링 동기화 트리거
    3. `vercel.json`: 서버리스 Cron 스케줄 정의
  - **검증 기준 (Acceptance Criteria)**:
    - `tests/integration/crawler-api.test.ts` 통합 테스트 작성 및 통과.
    - `npm run harness:verify` 통과.

- [x] **T-18: 수동 패치 입력 폼 제거 및 패치 종료 시간 기준 자동 크롤링 UI(`/admin/patches`, `/`, `/games/[slug]`, `PatchCard`) 개편**
  - **목표**:
    1. `/admin/patches`의 수동 입력 폼을 제거하고 **패치 종료 시간 기준 공식 홈페이지 자동 크롤링 관제 센터**로 전면 교체
    2. 메인 피드(`/`) 및 게임 상세(`/games/[slug]`) 진입 시 패치 종료 시각 기준 자동 크롤링 동기화 연동 및 `PatchCard`에 자동 크롤링 배지/패치 완료 기준 시각 표시
  - **검증 기준 (Acceptance Criteria)**:
    - 수동 입력 없이 공식 홈페이지 크롤링 데이터만으로 신규 패치노트가 자동 수집·노출될 것.
    - 최종 `npm run harness:verify` 4대 게이트 100% 통과.
