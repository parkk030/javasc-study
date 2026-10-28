# PROGRESS.md — 루프 상태(State) 및 에피소드 메모리(Memory)

> **목적 (Purpose)**  
> 이 파일은 루프 엔지니어링의 **비휘발성 상태 저장소(State Store)이자 장기 기억(Long-Term Memory)** 입니다.  
> 새로운 세션이나 루프 이터레이션을 시작하는 에이전트는 이 문서를 통해 **현재 어디까지 진행되었는지**, **어떤 아키텍처 결정이 내려졌는지**, **과거 루프에서 어떤 에러를 겪고 어떻게 해결했는지**를 즉시 복구합니다.

---

## 1. 현재 루프 상태 (Current Loop State)

- **프로젝트 주제 (Domain)**: **게임 패치노트 알림 서비스 (PatchRadar)**
- **현재 단계 (Current Phase)**: `Phase 7 — 패치 종료 시간 기준 공식 홈페이지 자동 크롤링 & 자동 노출 파이프라인 (완료)`
- **다음 수행할 태스크 (Next Target Task)**: `NONE (전체 태스크 T-01 ~ T-18 완료)`
- **진행률 (Completion Status)**: `18 / 18 Tasks Completed (100% — Phase 1 ~ Phase 7 전 과정 완료)`
- **루프 상태 (Loop Health)**: `ALL GREEN (npm run harness:verify — Typecheck, Lint, 36 Tests, Next.js Production Build 100% PASS)`

---

## 2. 아키텍처 의사결정 기록 (Architecture Decision Records - ADR)

| ID | 일자 | 결정 사항 (Decision) | 근거 및 맥락 (Rationale) |
| :--- | :--- | :--- | :--- |
| **ADR-01** | 2026-10-16 | **7대 핵심 MD 기반 하네스 + 루프 엔지니어링 체계 채택** | 에이전트의 컨텍스트 오염 방지, 명확한 검증 게이트(`HARNESS.md`) 강제, 원자적 반복 실행(`LOOP.md`)을 통한 고신뢰성 개발 달성. |
| **ADR-02** | 2026-10-16 | **이중 리포지토리 패턴 (In-Memory Seed Store + Serverless DB)** | 클라우드 DB 연결 없이도 로컬 하네스에서 100ms 이내에 전체 단위/통합 테스트를 결정론적으로 실행하기 위함. |
| **ADR-03** | 2026-10-16 | **Thin Handler, Fat Service 아키텍처** | 서버리스 라우트 핸들러(`src/app/api`)는 입출력 파싱만 담당하고 비즈니스 로직은 `src/services`에 격리하여 테스트 용이성 확보. |
| **ADR-04** | 2026-10-16 | **도메인 확정: 게임 패치노트 알림(PatchRadar) 및 7대 페이지 IA 설계** | 공개 탐색(`/`, `/games`, `/games/[slug]`, `/patches/[id]`), 개인화 구독/알림(`/dashboard`, `/settings/notifications`, `/login`), 운영/발송 테스트(`/admin/patches`) 구조 확정. |
| **ADR-05** | 2026-10-16 | **아임웹(`imweb.me`) Clay Design System 기반 Light-Only UI 리디자인 채택** | `https://imweb.me/` 및 `clay/vars.css` 분석 결과를 바탕으로 `#FFFFFF`/`#F8F9FB` 서피스, `#15181E` 딥 슬레이트 타이포그래피(`80px` 히어로, `16px/14px` 본문), Clay 시맨틱 컬러, `imweb AI` 스타일 프롬프트 검색 독을 `DESIGN.md`로 명세화하고 Phase 6(`T-12`~`T-15`)로 전면 적용 완료. |
| **ADR-06** | 2026-10-16 | **수동 패치 입력 폐기 → 패치 종료 시간 기준 공식 홈페이지 자동 크롤링 아키텍처 전환** | 사용자가 패치노트를 직접 입력하지 않고 각 게임의 정기 점검/패치 종료 기준 시각(`maintenanceEndTimeLabel`, `patchCompletionHourKst`)에 맞춰 공식 홈페이지(`officialUrl`)를 자동 크롤링(`CrawlerService` + `/api/crawler/sync` + `vercel.json`)하여 업데이트 내역과 3줄 요약을 자동 반영하도록 Phase 7(`T-16`~`T-18`) 구현. |

---

## 3. 에러 가드레일 및 학습 메모리 (Error Guardrails & Lessons Learned)

> [!IMPORTANT]
> 루프 수행 중 하네스 검증 실패나 런타임 시행착오를 겪은 경우, 재발 방지를 위해 아래 목록에 **"원인 → 해결 규칙"** 형태로 반드시 누적 기록하십시오.

- **[Guardrail-01] 서버리스 함수 인메모리 상태 주의**:
  - 프로덕션 서버리스 환경에서는 인스턴스가 수시로 재시작되므로, 요청 간 데이터 영속성은 반드시 Repository 계층을 통해 처리할 것. (단, 로컬/테스트 모드의 싱글톤 시드 스토어는 `globalThis.__patchRadarStore`에 바인딩하여 HMR 시 초기화되지 않도록 관리할 것.)
- **[Guardrail-02] Next.js 15+ 동적 라우트 파라미터 비동기 처리**:
  - Next.js 최신 App Router의 동적 라우트 핸들러(`src/app/api/games/[slug]/route.ts`, `src/app/api/patches/[id]/route.ts`)에서 `context.params`는 `Promise<{ ... }>` 형태이므로 반드시 `await context.params`로 언래핑할 것.
- **[Guardrail-03] 외부 Discord Webhook 호출 격리**:
  - `/api/notifications/test` 등에서 외부 Discord 웹훅 호출 시 네트워크 지연으로 서버리스 함수가 멈추지 않도록 반드시 `AbortSignal.timeout(5000)`을 설정하고, 로컬/데모 웹훅 URL인 경우 안전한 Dry-run 시뮬레이션 응답을 반환할 것.
- **[Guardrail-04] Windows PowerShell 로컬 Node.js 런타임 실행 규칙**:
  - 본 워크스페이스는 `.tooling/node-v22.14.0-win-x64`에 포터블 Node.js v22 LTS가 구성되어 있으며, PowerShell ExecutionPolicy 충돌 방지를 위해 `.ps1` 래퍼를 제거하고 `.cmd`(`npm.cmd`, `npx.cmd`)를 사용함. 터미널 명령 실행 시 `$env:Path = "c:\gov\java\java-study\p1\.tooling\node-v22.14.0-win-x64;$env:Path"`를 선행 선언할 것.
- **[Guardrail-05] ESLint v9 `globalThis` 선언 시 불필요한 `eslint-disable` 주석 지양**:
  - `declare global { var __patchRadarStore: ... }` 블록에서는 ESLint v9 기본 설정상 `no-var` 경고가 발생하지 않으므로 `// eslint-disable-next-line no-var`를 추가하면 `Unused eslint-disable directive` 경고로 인해 `--max-warnings=0` 게이트가 실패함 (`Loop 4`에서 자가 치유 완료).
- **[Guardrail-06] Tailwind CSS v4 `@import "tailwindcss"`와 외부 폰트 `@import url(...)` 순서 규칙**:
  - `src/app/globals.css`에서 `@import "tailwindcss";`가 먼저 선언되면 CSS 번들링 시 일반 규칙으로 확장되어 후행 `@import url(...)`에 대해 LightningCSS 경고가 발생할 수 있으므로, 외부 폰트 `@import url(...)`을 항상 파일 최상단(1행)에 배치할 것 (`Loop 15`에서 자가 치유 완료).
- **[Guardrail-07] `next dev` 실행 중 `next build`(`harness:verify`) 충돌로 인한 Dev CSS `404` 방지**:
  - 로컬에서 `next dev`가 떠 있는 상태로 `npm run build`를 실행하면 동일한 `.next` 폴더를 덮어써서 `/_next/static/css/app/layout.css`가 삭제(`404`)되는 문제가 발생함. 이를 영구 방지하기 위해 `next.config.ts`에서 `PHASE_DEVELOPMENT_SERVER`는 `.next`, 로컬 프로덕션 빌드는 `.next-build`를 사용하도록 `distDir`을 분리함.

---

## 4. 블로커 및 에스컬레이션 큐 (Blocked / Escalation Queue)

현재 블로커 없음 (`None`). 모든 태스크(`T-01` ~ `T-18`) 완료.

---

## 5. 루프 실행 히스토리 (Loop Execution Log)

| Loop # | 일시 | 태스크 ID | 작업 요약 | 하네스 검증 결과 |
| :---: | :--- | :---: | :--- | :---: |
| **Init** | 2026-10-16 | `INIT` | 하네스 + 루프 엔지니어링 필수 마크다운 문서 7종 생성 완료 | `DOCS VERIFIED` |
| **Design** | 2026-10-16 | `IA-DESIGN` | '게임 패치노트 알림(PatchRadar)' 전체 7대 페이지 구조, DB 스키마(5종), 서버리스 API(10종), 태스크 백로그(`T-01`~`T-11`) 설계 및 문서 반영 완료 | `IA VERIFIED` |
| **Loop 1** | 2026-10-16 | `T-01` | Next.js 15 + TypeScript(strict) + Tailwind CSS v4 + Vitest + ESLint v9 스캐폴딩 및 `harness:verify` 파이프라인 구축 | `PASS (4/4 Gates)` |
| **Loop 2** | 2026-10-16 | `T-02` | `src/lib/env.ts`, `src/lib/errors.ts`, `src/lib/response.ts`, `src/lib/auth.ts` 및 `GET /api/health` 구현 + 단위/통합 테스트 추가 | `PASS (4/4 Gates, 11 Tests)` |
| **Loop 3** | 2026-10-16 | `T-03` | `src/domain/types/index.ts`, `src/domain/schemas/patch-radar.schema.ts` 및 `tests/unit/schemas.test.ts` 구현 | `PASS (18 Tests)` |
| **Loop 4** | 2026-10-16 | `T-04` | 6대 인기 게임 시드 데이터(`seed-data.ts`) 및 `PatchRadarRepository`(`patch-radar.repository.ts`) + `tests/unit/repository.test.ts` 구현 | `PASS (21 Tests)` |
| **Loop 5** | 2026-10-16 | `T-05` | `GameService`, `PatchService`, `SubscriptionService`, `NotificationService` + `tests/unit/services.test.ts` 구현 | `PASS (26 Tests)` |
| **Loop 6** | 2026-10-16 | `T-06` | `/api/games`, `/api/games/[slug]`, `/api/patches`, `/api/patches/[id]` 서버리스 라우트 및 `tests/integration/patches-api.test.ts` 구현 | `PASS (31 Tests)` |
| **Loop 7** | 2026-10-16 | `T-07` | `/api/subscriptions`, `/api/notifications`, `/api/notifications/channels`, `/api/notifications/test` 및 E2E 통합 테스트(`notifications-api.test.ts`) 구현 | `PASS (32 Tests)` |
| **Loop 8** | 2026-10-16 | `T-08` | 글로벌 `Navbar`, `Footer`, 4대 상태 뷰(`StateViews.tsx`), `PatchCard`, `GameCard` 구현 | `PASS` |
| **Loop 9** | 2026-10-16 | `T-09` | 공개 탐색 페이지 4종(`/`, `/games`, `/games/[slug]`, `/patches/[id]`) 구현 | `PASS` |
| **Loop 10** | 2026-10-16 | `T-10` | 개인화/운영 페이지 4종(`/dashboard`, `/settings/notifications`, `/admin/patches`, `/login`) 구현 | `PASS` |
| **Loop 11** | 2026-10-16 | `T-11` | `supabase/schema.sql`, `.env.example`, `README.md` 작성 및 전체 4단계 하네스 최종 검증 완료 | `PASS (4/4 Gates, 32 Tests)` |
| **UI-Spec** | 2026-10-16 | `DESIGN-SPEC` | `https://imweb.me/` 및 `clay/vars.css` 역공학 분석 → `DESIGN.md` 작성 및 `TASKS.md` Phase 6 (`T-12`~`T-15`) 대기 큐 등록 완료 | `READY / WAITING` |
| **Loop 12** | 2026-10-16 | `T-12` | 아임웹 Clay 디자인 시스템 CSS 변수(`--clay-*`), Pretendard Variable 타이포그래피, 레이어 그림자, 쉬머 유틸리티 적용 (`globals.css`, `layout.tsx`) | `PASS (4/4 Gates)` |
| **Loop 13** | 2026-10-16 | `T-13` | 아임웹 GNB 헤더(`72px`), 파이프 디바이더 에디토리얼 푸터, `StateViews`, `PatchCard`, `GameCard` Clay 라이트 테마 리디자인 | `PASS (4/4 Gates)` |
| **Loop 14** | 2026-10-16 | `T-14` | 공개 탐색 페이지 4종(`/`, `/games`, `/games/[slug]`, `/patches/[id]`) 아임웹 80px Display Hero, `imweb AI` 프롬프트 검색 독, Clay 시맨틱 컬러 그리드 적용 | `PASS (4/4 Gates)` |
| **Loop 15** | 2026-10-16 | `T-15` | 개인화/운영 페이지 4종(`/dashboard`, `/settings/notifications`, `/admin/patches`, `/login`) 4:8 비대칭 그리드 및 아임웹 클린 폼/카드 UI 리디자인 최종 완료 | `PASS (4/4 Gates, 0 Warnings, 32 Tests)` |
| **Loop 16** | 2026-10-16 | `T-16` | 게임별 패치 종료 기준 스케줄 도메인 및 공식 홈페이지 자동 크롤러 서비스(`crawler.service.ts` + `tests/unit/crawler.test.ts`) 구현 | `PASS (34 Tests)` |
| **Loop 17** | 2026-10-16 | `T-17` | 서버리스 자동 크롤링 API(`/api/crawler/sync`), `vercel.json` Cron 스케줄러 및 통합 테스트(`tests/integration/crawler-api.test.ts`) 구현 | `PASS (36 Tests)` |
| **Loop 18** | 2026-10-16 | `T-18` | 수동 패치 입력 폼 제거 → 패치 종료 시간 기준 공식 홈페이지 자동 크롤링 모니터(`/admin/patches`) 및 메인(`/`)·게임 상세(`/games/[slug]`) 자동 크롤링 연동 완료 | `PASS (4/4 Gates, 36 Tests)` |
| **Loop 19** | 2026-10-16 | `UI-COMPACT` | `PatchCard` 컴팩트화(`p-[18px]`, 1줄 헤더/타이틀/푸터, 2줄 TL;DR 요약) 및 패치노트 피드 가로 다단 그리드(`md:grid-cols-2 lg:grid-cols-3`) 배치 적용 (`/`, `/games/[slug]`, `/dashboard`) | `PASS (4/4 Gates, 36 Tests)` |
