# AGENTS.md — 마스터 하네스(Harness) 및 루프(Loop) 헌법

> **최우선 지침 (Prime Directive)**  
> 이 문서는 본 서버리스 웹 프로젝트를 수행하는 AI 에이전트의 **진입점(Entrypoint)이자 절대 규칙(Constitution)** 입니다.  
> 모든 작업 세션(또는 루프 이터레이션)을 시작할 때 반드시 이 문서를 먼저 읽고, 정의된 **하네스(Harness) 제약**과 **루프(Loop) 프로토콜**을 엄격히 준수하십시오.

---

## 1. 프로젝트 개요 (Project Identity)

- **프로젝트 형태**: 서버리스 웹 애플리케이션 (Serverless Web Application)
- **기본 기술 스택 (Standard Stack)**:
  - **Frontend & Serverless Runtime**: Next.js (App Router) + TypeScript + Tailwind CSS
  - **Serverless Backend / BaaS**: Supabase (PostgreSQL, Auth, Edge Functions, Storage) 또는 호환 Serverless API Routes
  - **Deployment / Edge**: Vercel (Serverless / Edge Functions)
  - **Testing & Harness**: Vitest (Unit/Integration), Playwright (E2E), ESLint + TypeScript (`tsc --noEmit`)
  *(※ 다른 서버리스 스택으로 변경 시 `SPEC.md` 및 `ARCHITECTURE.md`의 스택 섹션을 먼저 갱신할 것)*

---

## 2. 필수 문서 맵 (Context Map)

에이전트는 임의로 추측하여 코드를 작성하지 않으며, 반드시 아래 6개 문서를 기준 진실 공급원(Single Source of Truth)으로 삼습니다.

| 문서 파일 | 역할 및 참조 시점 |
| :--- | :--- |
| **[SPEC.md](./SPEC.md)** | **무엇을 만드는가**: 기능/비기능 요구사항, 도메인 모델, 서버리스 API/DB 스키마 명세. 기능 구현 전 필독. |
| **[DESIGN.md](./DESIGN.md)** | **어떻게 디자인하는가**: 아임웹(`imweb.me` / Clay Design System) 기반 컬러 토큰, 타이포그래피 스케일, 그리드/여백 규격. UI 작업 시 필독. |
| **[ARCHITECTURE.md](./ARCHITECTURE.md)** | **어떻게 구조화하는가**: 폴더 구조, 서버리스 제약(Stateless, Cold Start, Timeout), 데이터 흐름 및 보안 경계. |
| **[HARNESS.md](./HARNESS.md)** | **어떻게 검증하는가**: 완료 조건(DoD), 자동화 검증 파이프라인(Typecheck/Lint/Test/Build), 실패 시 가드레일. |
| **[LOOP.md](./LOOP.md)** | **어떻게 반복 실행하는가**: `Read → Select → Execute → Verify → Heal → Record` 6단계 자율 루프 프로토콜. |
| **[TASKS.md](./TASKS.md)** | **무엇을 해야 하는가**: 원자적(Atomic) 작업 큐 및 각 태스크별 검증 기준(Acceptance Criteria). |
| **[PROGRESS.md](./PROGRESS.md)** | **어디까지 왔으며 무엇을 배웠는가**: 현재 상태(State), 루프 히스토리, 아키텍처 결정(ADR), 실패/시행착오 메모리. |

---

## 3. 핵심 명령어 하네스 (Command Harness)

에이전트가 루프 내에서 실행하는 표준 검증 명령어입니다. (`package.json` 구성 시 아래 스크립트를 반드시 유지해야 합니다.)

```bash
# 1. 정적 타입 검증 (Typecheck)
npm run typecheck        # tsc --noEmit

# 2. 코드 스타일 및 정적 분석 (Lint)
npm run lint             # eslint . --max-warnings=0

# 3. 단위 및 통합 테스트 (Unit/Integration Test)
npm run test             # vitest run

# 4. 프로덕션 빌드 및 서버리스 번들 검증 (Build Gate)
npm run build            # next build

# 5. 통합 하네스 검증 (1~4 일괄 실행 - 루프 완료 필수 조건)
npm run harness:verify   # npm run typecheck && npm run lint && npm run test && npm run build
```

---

## 4. 절대 위반 금지 규칙 (Hard Constraints)

1. **원자적 단일 작업 원칙 (One Atomic Task per Loop)**
   - 한 번의 루프 이터레이션에서는 `TASKS.md`의 **단 하나의 태스크**만 선택하여 완수합니다.
   - 요청받지 않은 기능(Scope Creep)을 임의로 추가하지 마십시오.
2. **검증 없는 완료 선언 금지 (No Unverified Completion)**
   - `HARNESS.md`에 명시된 검증 게이트(타입체크, 린트, 테스트, 빌드)가 통과하기 전에는 절대 `TASKS.md`의 체크박스를 `[x]`로 변경하지 마십시오.
3. **하네스 우회 금지 (Never Bypass the Harness)**
   - 검증을 통과하기 위해 테스트를 삭제하거나, `@ts-ignore`, `eslint-disable`, `any` 타입 남발로 오류를 숨기는 행위를 엄격히 금지합니다.
4. **서버리스 무상태성 준수 (Serverless Statelessness)**
   - 서버리스 함수(Route Handler, Server Action, Edge Function) 내부의 인메모리 전역 변수에 세션이나 영속 상태를 저장하지 마십시오.
   - 모든 시크릿 키(`SERVICE_ROLE_KEY` 등)는 서버 전용 환경변수로 격리하고 클라이언트에 노출(`NEXT_PUBLIC_` 오용)하지 마십시오.
5. **상태 및 학습 기록 의무화 (State & Memory Persistence)**
   - 매 루프 종료 시(성공 또는 보류) 반드시 `PROGRESS.md`에 변경 사항과 시행착오(Error Guardrails)를 기록하여 다음 루프가 동일한 실수를 반복하지 않게 하십시오.

---

## 5. 세션 시작 체크리스트 (Quick Start for Agent)

새로운 세션을 시작하거나 루프를 재개할 때 다음 순서를 즉시 실행하십시오:

1. `PROGRESS.md`를 열어 **현재 진행 중인 Phase/Task ID**와 **최근 실패 가드레일(Known Pitfalls)**을 확인합니다.
2. `TASKS.md`에서 다음 수행할 `[ ]` 상태의 첫 번째 원자적 태스크를 식별합니다.
3. `LOOP.md`의 6단계 프로토콜에 따라 작업을 수행합니다.
