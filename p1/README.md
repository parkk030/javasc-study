# 📡 PatchRadar — 게임 패치노트 요약 및 실시간 알림 서비스

**하네스 엔지니어링(Harness Engineering)**과 **루프 엔지니어링(Loop Engineering)** 프로토콜을 기반으로 구축된 서버리스 웹 애플리케이션입니다.

---

## 1. 주요 기능 및 전체 페이지 구조 (7대 라우트)

| 라우트 | 설명 |
| :--- | :--- |
| `/` | **홈 (통합 패치노트 피드)**: 6대 인기 게임 필터, 패치 유형(`정기`, `밸런스`, `핫픽스`), 변경 유형(`🔺버프`, `🔻너프`, `🛠️버그수정`) 필터 및 키워드 검색 |
| `/games` | **지원 게임 디렉터리**: 장르별(`MOBA`, `FPS`, `BattleRoyale`, `MMORPG`) 탐색 및 원클릭 알림 구독 토글 |
| `/games/[slug]` | **게임별 패치 허브**: 특정 게임의 역대 버전별 패치 타임라인 및 내 관심 키워드(예: `아리`, `제트`) 설정 |
| `/patches/[id]` | **패치노트 상세 뷰**: 3줄 핵심 요약(TL;DR), 상향/하향 카운트 요약, 본문 내 실시간 캐릭터/무기 검색 |
| `/dashboard` | **내 구독 & 인앱 알림함**: 내가 구독한 게임 전용 패치 피드, 키워드 태그 관리, 안 읽은 알림 읽음 처리 |
| `/settings/notifications` | **알림 채널 설정**: Discord Webhook URL 연동, 수신 조건 토글, **[⚡ 실시간 테스트 패치 알림 발송]** |
| `/admin/patches` & `/login` | **패치 등록/발송 모니터 & 계정 전환**: 신규 패치노트 발행 시 구독자 키워드 매칭 및 알림 즉시 디스패치 |

---

## 2. 하네스 & 루프 엔지니어링 문서 체계

- [AGENTS.md](./AGENTS.md) — 마스터 하네스 헌법 및 세션 진입점
- [SPEC.md](./SPEC.md) — 기능 요구사항, 5대 데이터 모델, 10대 서버리스 API 명세
- [ARCHITECTURE.md](./ARCHITECTURE.md) — 서버리스 4계층 아키텍처 및 폴더 구조
- [HARNESS.md](./HARNESS.md) — 4대 품질 검증 게이트(`Typecheck → Lint → Test → Build`) 및 회로 차단기 규칙
- [LOOP.md](./LOOP.md) — 6단계 자율 루프 실행 프로토콜
- [TASKS.md](./TASKS.md) — 원자적 작업 큐 (`T-01` ~ `T-11`)
- [PROGRESS.md](./PROGRESS.md) — 루프 상태 저장소, ADR, 에러 가드레일 메모리

---

## 3. 실행 및 하네스 검증 명령어

```bash
# 로컬 개발 서버 실행 (http://localhost:3000)
npm run dev

# 4단계 통합 하네스 검증 (Typecheck + Lint + Vitest + Next Build)
npm run harness:verify
```
