# SPEC.md — 게임 패치노트 알림 서비스 (PatchRadar) 요구사항 및 도메인 명세서

> **목적 (Purpose)**  
> 본 문서는 **"게임 패치노트 알림 서비스 (PatchRadar)"** 서버리스 웹 프로젝트의 **전체 페이지 구조(IA)**, **기능적 요구사항(Functional Requirements)**, **데이터 모델(Data Schema)**, **서버리스 API 인터페이스**, **비기능적 요구사항**을 정의하는 단일 진실 공급원(Single Source of Truth)입니다.  
> 에이전트는 기능 구현 전 반드시 본 문서의 명세를 확인하고, 요구사항 변경 시 코드를 수정하기 전에 본 문서를 먼저 업데이트해야 합니다.

---

## 1. 서비스 개요 (Product Overview)

- **프로젝트명**: **PatchRadar (패치레이더) — 게임 패치노트 요약 및 실시간 알림 웹 서비스**
- **핵심 가치**:
  1. 여러 게임 공식 홈페이지에 흩어진 복잡한 패치노트를 **한곳에서 3줄 요약 및 버프(🔺)/너프(🔻)/버그수정(🛠️) 카테고리별**로 빠르게 확인.
  2. 내가 플레이하는 관심 게임이나 특정 키워드(챔피언, 무기, 직업 등)에 대한 패치가 올라오면 **인앱 알림, Discord 웹훅(Webhook), 이메일/웹푸시**로 즉시 알림 수신.
- **초기 지원 시드 게임 (Seed Games)**:
  - `league-of-legends` (리그 오브 레전드 - MOBA)
  - `valorant` (발로란트 - FPS)
  - `pubg` (배틀그라운드 - Battle Royale/FPS)
  - `overwatch-2` (오버워치 2 - FPS)
  - `lost-ark` (로스트아크 - MMORPG)
  - `maplestory` (메이플스토리 - MMORPG)

---

## 2. 전체 페이지 구조 및 라우트 명세 (Page Structure & IA)

| 라우트 경로 | 페이지명 | 접근 권한 | 핵심 구성 요소 및 기능 |
| :--- | :--- | :---: | :--- |
| **`/`** | **홈 (통합 패치 피드)** | 전체(Public) | • 인기 게임 퀵 필터 탭 (`전체`, `LoL`, `발로란트`, `배그`, `오버워치2`, `로스트아크`)<br>• 패치 유형 필터 (`정기점검`, `핫픽스`, `밸런스패치`) 및 키워드 검색바<br>• 최신 패치노트 타임라인 카드 (버전, 3줄 요약, 버프/너프 카운트 배지, 원클릭 구독 버튼) |
| **`/games`** | **지원 게임 디렉터리** | 전체(Public) | • 장르별 필터 탭 (`전체`, `MOBA`, `FPS`, `MMORPG`)<br>• 게임 카드 그리드 (썸네일, 최신 버전, 최근 패치일, 구독자 수)<br>• `[+ 알림 구독 / ✓ 구독 중]` 즉시 토글 버튼 |
| **`/games/[slug]`** | **게임별 패치 허브** | 전체(Public) | • 게임 헤더 (공식 패치노트 원문 링크, 패치 주기, 구독 설정 버튼)<br>• 해당 게임의 버전별 역대 패치노트 타임라인 목록<br>• 내 관심 키워드(예: `"아리"`, `"제트"`) 등록 및 하이라이트 필터 |
| **`/patches/[id]`** | **패치노트 상세 뷰** | 전체(Public) | • 패치 메타 헤더 (게임명, 버전 `v14.20`, 적용 일시, 점검 시간, 공식 원문 링크)<br>• **TL;DR 3줄 핵심 요약 카드**<br>• 본문 내 실시간 키워드 검색 (챔피언/무기 이름 즉시 필터링)<br>• **변경 유형별 구조화 섹션 탭**: 🔺상향(Buff) / 🔻하향(Nerf) / 🔄조정(Adjusted) / 🛠️버그수정(Bugfix) |
| **`/dashboard`** | **내 구독 & 알림 센터** | 회원(Auth) | • 안 읽은 신규 패치 알림 배너 및 읽음 처리(`Mark all as read`)<br>• 내가 구독 중인 게임들의 전용 패치 피드 모아보기<br>• 내 구독 게임 및 맞춤 알림 키워드(`keywords`) 추가/삭제 위젯 |
| **`/settings/notifications`** | **알림 채널 연동 설정** | 회원(Auth) | • **Discord Webhook URL 연동** 및 `[⚡ 테스트 알림 발송]` 기능<br>• 이메일/웹푸시 수신 ON/OFF 토글<br>• 알림 수신 조건 설정 (`모든 패치` / `핫픽스 포함` / `내 키워드 매칭 시에만`) |
| **`/login`, `/signup`** | **인증 페이지** | 전체(Public) | • 이메일/소셜 로그인 및 데모 사용자 원클릭 로그인 지원 |
| **`/admin/patches`** | **관리자 패치/발송 모니터** | 관리자(Admin) | • 신규 패치노트 수동 등록 폼 (등록 시 구독자 알림 자동 디스패치)<br>• 서버리스 크론(Cron) 수집 실행 트리거 및 알림 발송 로그 모니터링 |

---

## 3. 핵심 기능 요구사항 (Functional Requirements)

### FR-01: 패치노트 탐색, 필터링 및 버프/너프 구조화 뷰
- 사용자는 게임별(`gameSlug`), 패치 유형별(`category`: `'regular' | 'hotfix' | 'balance' | 'maintenance'`), 검색어(`q`)로 패치노트를 실시간 필터링할 수 있다.
- 각 패치노트 상세 페이지(`/patches/[id]`)는 변경 항목(`changes`)을 `buff`(상향), `nerf`(하향), `adjusted`(조정), `bugfix`(버그수정), `new`(신규) 타입으로 구분하여 시각적 배지와 함께 렌더링한다.

### FR-02: 게임 구독 및 맞춤 키워드(Keyword) 알림 설정
- 사용자는 특정 게임을 구독(`subscriptions`)할 수 있으며, 선택적으로 관심 키워드 배열(예: `["제트", "오퍼레이터"]`)과 핫픽스 수신 여부를 지정할 수 있다.
- 이미 구독 중인 게임을 다시 요청하면 중복 생성되지 않고 설정이 업데이트(Upsert)되거나 구독 토글 처리된다.

### FR-03: 서버리스 멀티채널 알림 발송 및 Discord 웹훅 테스트
- 새로운 패치노트가 등록되면 서버리스 알림 디스패처가 해당 게임 구독자들을 조회한다.
- 구독자가 키워드를 설정한 경우 패치 제목/요약/변경 대상(`targetName`)에 키워드가 매칭될 때(또는 전체 수신 설정일 때) 인앱 알림(`notifications`)을 생성하고 연동된 외부 채널(Discord Webhook 등)로 알림 페이로드를 전송한다.
- `/settings/notifications`에서 `[테스트 알림 발송]` 요청 시 연동된 채널로 즉시 샘플 패치 알림 메시지를 전송하고 성공/실패 결과를 반환한다.

### FR-04: 4대 UI 상태(Loading / Empty / Error / Success) 완비
- 모든 데이터 패칭 화면은 스켈레톤 로딩(Loading), 검색/구독 결과 없음 안내 및 CTA(Empty), 에러 배너 및 재시도 버튼(Error), 정상 렌더링 및 낙관적 업데이트(Success)를 명시적으로 제공한다.

---

## 4. 데이터 모델 명세 (Data Model & Schema)

### 4.1 `games` (지원 게임 정보)
| 필드명 | 타입 | 제약조건 | 설명 |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PK` | 게임 고유 ID |
| `slug` | `TEXT` | `UNIQUE`, `NOT NULL` | URL 슬러그 (예: `'league-of-legends'`, `'valorant'`) |
| `name` | `TEXT` | `NOT NULL` | 게임 표시명 (예: `'리그 오브 레전드'`) |
| `genre` | `TEXT` | `NOT NULL` | `'MOBA'` \| `'FPS'` \| `'MMORPG'` \| `'BattleRoyale'` |
| `icon_url` | `TEXT` | `NULLABLE` | 아이콘/로고 이미지 경로 |
| `official_url` | `TEXT` | `NOT NULL` | 공식 패치노트 게시판 URL |
| `current_version` | `TEXT` | `NOT NULL` | 최신 패치 버전 (예: `'v14.20'`) |
| `subscriber_count` | `INTEGER` | `DEFAULT 0` | 구독자 수 |
| `last_patched_at` | `TIMESTAMPTZ` | `NOT NULL` | 최근 패치 일시 |

### 4.2 `patches` (패치노트 및 구조화된 변경 내역)
| 필드명 | 타입 | 제약조건 | 설명 |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PK` | 패치노트 고유 ID |
| `game_id` | `UUID` | `FK (games.id)`, `INDEX` | 대상 게임 ID |
| `game_slug` | `TEXT` | `NOT NULL`, `INDEX` | 대상 게임 슬러그 |
| `version` | `TEXT` | `NOT NULL` | 패치 버전 (예: `'v14.20'`, `'9.08'`) |
| `title` | `TEXT` | `NOT NULL` | 패치노트 제목 |
| `category` | `TEXT` | `NOT NULL` | `'regular'` \| `'hotfix'` \| `'balance'` \| `'maintenance'` |
| `tldr` | `TEXT[]` | `NOT NULL` | 3~5줄 핵심 요약 배열 |
| `changes` | `JSONB` | `NOT NULL` | 변경 항목 배열 `Array<{ type: 'buff'\|'nerf'\|'adjusted'\|'bugfix'\|'new', target: string, summary: string, details?: string }>` |
| `source_url` | `TEXT` | `NOT NULL` | 공식 패치노트 원문 URL |
| `published_at` | `TIMESTAMPTZ` | `DEFAULT now()` | 공식 배포 일시 |

### 4.3 `subscriptions` (사용자별 게임 구독 및 키워드 설정)
| 필드명 | 타입 | 제약조건 | 설명 |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PK` | 구독 고유 ID |
| `user_id` | `UUID` | `NOT NULL`, `INDEX` | 사용자 ID (RLS 기준) |
| `game_slug` | `TEXT` | `NOT NULL` | 구독 대상 게임 슬러그 (`UNIQUE(user_id, game_slug)`) |
| `keywords` | `TEXT[]` | `DEFAULT '{}'` | 맞춤 알림 키워드 목록 (예: `['아리', '제트']`) |
| `notify_hotfix_only` | `BOOLEAN` | `DEFAULT false` | 핫픽스만 알림 받을지 여부 |
| `created_at` | `TIMESTAMPTZ` | `DEFAULT now()` | 구독 일시 |

### 4.4 `notification_channels` (알림 수신 채널 설정)
| 필드명 | 타입 | 제약조건 | 설명 |
| :--- | :--- | :--- | :--- |
| `user_id` | `UUID` | `PK` | 사용자 ID (RLS 기준) |
| `discord_webhook_url` | `TEXT` | `NULLABLE` | Discord 웹훅 URL (`https://discord.com/api/webhooks/...`) |
| `email_enabled` | `BOOLEAN` | `DEFAULT true` | 이메일 알림 활성화 여부 |
| `web_push_enabled` | `BOOLEAN` | `DEFAULT true` | 인앱/웹푸시 알림 활성화 여부 |
| `only_keyword_match` | `BOOLEAN` | `DEFAULT false` | 내 키워드 포함 패치만 수신 여부 |
| `updated_at` | `TIMESTAMPTZ` | `DEFAULT now()` | 수정 일시 |

### 4.5 `notifications` (인앱 알림 발송 내역)
| 필드명 | 타입 | 제약조건 | 설명 |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PK` | 알림 고유 ID |
| `user_id` | `UUID` | `NOT NULL`, `INDEX` | 수신 사용자 ID (RLS 기준) |
| `patch_id` | `UUID` | `FK (patches.id)` | 연관 패치노트 ID |
| `game_slug` | `TEXT` | `NOT NULL` | 게임 슬러그 |
| `title` | `TEXT` | `NOT NULL` | 알림 제목 (예: `'[발로란트] 9.08 패치노트 등록'`) |
| `message` | `TEXT` | `NOT NULL` | 요약 메시지 및 매칭된 키워드 안내 |
| `matched_keywords` | `TEXT[]` | `DEFAULT '{}'` | 매칭된 사용자 키워드 |
| `is_read` | `BOOLEAN` | `DEFAULT false` | 읽음 여부 |
| `created_at` | `TIMESTAMPTZ` | `DEFAULT now()` | 발송 일시 |

---

## 5. 서버리스 API 엔드포인트 명세 (Serverless API Specification)

모든 API 응답은 표준 엔벨로프(`{ success: true, data, meta }` 또는 `{ success: false, error: { code, message, details } }`)를 따릅니다.

| 메서드 | 경로 | 인증 | 설명 |
| :--- | :--- | :---: | :--- |
| `GET` | `/api/health` | X | 서버리스 런타임 헬스체크 |
| `GET` | `/api/games` | X | 전체 지원 게임 목록 조회 (`?genre=&q=`) |
| `GET` | `/api/games/[slug]` | X | 특정 게임 상세 정보 및 해당 게임 패치 목록 조회 |
| `GET` | `/api/patches` | X | 통합 패치노트 목록 조회 (`?gameSlug=&category=&changeType=&q=&page=`) |
| `POST` | `/api/patches` | O (Admin) | 신규 패치노트 등록 및 구독자 알림 디스패치 트리거 |
| `GET` | `/api/patches/[id]` | X | 패치노트 상세 내용(TL;DR, 버프/너프 섹션) 조회 |
| `GET` | `/api/subscriptions` | O | 현재 사용자의 구독 게임 및 키워드 목록 조회 |
| `POST` | `/api/subscriptions` | O | 관심 게임 구독 등록 또는 키워드 업데이트 |
| `DELETE` | `/api/subscriptions` | O | 관심 게임 구독 해제 (`?gameSlug=`) |
| `GET` | `/api/notifications` | O | 내 인앱 알림 목록 및 안 읽은 알림 개수 조회 |
| `PATCH` | `/api/notifications` | O | 특정 알림 또는 전체 알림 읽음(`is_read = true`) 처리 |
| `GET` | `/api/notifications/channels` | O | 내 알림 채널(Discord Webhook 등) 설정 조회 |
| `PUT` | `/api/notifications/channels` | O | 내 알림 채널 설정 저장 (Webhook URL 형식 검증 포함) |
| `POST` | `/api/notifications/test` | O | 연동된 채널로 즉시 테스트 패치 알림 발송 |

---

## 6. 비기능적 요구사항 (Serverless Non-Functional Requirements)

1. **Cold Start 최소화 및 캐싱**: 공개 페이지(`/`, `/games`, `/patches/[id]`)는 빠른 초기 응답을 보장하고, 무거운 라이브러리의 전역 임포트를 금지한다.
2. **외부 웹훅 타임아웃 격리**: Discord Webhook 등 외부 호출 시 `AbortSignal.timeout(5000)`을 적용하여 외부 장애가 서버리스 함수 전체 타임아웃으로 전파되지 않게 방어한다.
3. **로컬/테스트 결정론적 모킹**: 클라우드 자격증명이나 실제 Discord 웹훅 없이도 `npm run harness:verify`에서 모든 기능(시드 게임 6종, 패치노트, 구독, 알림 디스패치)이 100% 검증되어야 한다.
