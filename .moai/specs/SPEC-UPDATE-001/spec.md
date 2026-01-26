# SPEC-UPDATE-001: excalidraw-cli 의존성 현대화

## 메타데이터

| 항목 | 값 |
|------|-----|
| **SPEC ID** | SPEC-UPDATE-001 |
| **제목** | excalidraw-cli 라이브러리 버전 업그레이드 |
| **생성일** | 2026-01-26 |
| **상태** | Completed |
| **우선순위** | High |
| **담당** | manager-ddd |
| **예상 복잡도** | High |

---

## 1. Environment (환경)

### 1.1 현재 기술 스택

| 카테고리 | 현재 버전 | 목표 버전 | 변경 영향도 |
|----------|-----------|-----------|-------------|
| **Node.js** | >=8.0.0 | >=22.0.0 | Low |
| **TypeScript** | ^4.1.2 | ^5.7.x | Medium |
| **oclif** | v1 (@oclif/command ^1) | v4 (@oclif/core ^4.x) | Critical |
| **canvas** | ^2.6.1 | ^3.x | High |
| **roughjs** | ^4.3.1 | ^4.6.6 | High |
| **Jest** | ^27.0.4 | ^29.x | Medium |
| **listr/listr2** | ^0.14.3/^3.2.3 | listr2 ^10.0.0 | Medium |

### 1.2 네이티브 의존성 환경

- **libcairo**: canvas 라이브러리의 핵심 네이티브 의존성
- **libpango**: 텍스트 렌더링용 폰트 처리
- **freetype**: 폰트 래스터화
- **Alpine Linux**: Docker 컨테이너 빌드 환경

### 1.3 프로젝트 구조

```text
src/
├── index.ts          # oclif Command 정의 (Critical - oclif 마이그레이션 대상)
├── compute.js        # 입력 처리 로직
├── worker.js         # Listr 태스크 관리 (listr2 마이그레이션 대상)
├── compute.spec.ts   # Jest 테스트
└── renderer/
    ├── index.js      # canvas 초기화 (canvas 업데이트 대상)
    ├── arrow.js      # roughjs rc.generator 사용 (roughjs 마이그레이션 대상)
    └── ...           # 기타 렌더러 모듈
```

---

## 2. Assumptions (가정)

### 2.1 기술적 가정

| ID | 가정 | 신뢰도 | 근거 | 실패 시 위험 | 검증 방법 |
|----|------|--------|------|-------------|-----------|
| A1 | canvas v3는 Alpine Linux에서 네이티브 빌드가 가능하다 | Medium | npm 문서 및 이슈 트래커 | Docker 빌드 실패 | Docker 빌드 테스트 |
| A2 | roughjs v5는 이전 버전과 호환되는 public API를 제공한다 | Low | 내부 API(rc.generator) 사용 중 | 렌더링 기능 손실 | API 조사 및 리팩토링 |
| A3 | oclif v4 마이그레이션 가이드가 존재한다 | High | oclif 공식 문서 | 수동 마이그레이션 필요 | 문서 확인 |
| A4 | TypeScript 5.x는 기존 코드와 호환된다 | High | TypeScript 하위 호환성 정책 | 타입 오류 수정 필요 | 컴파일 테스트 |

### 2.2 비즈니스 가정

| ID | 가정 | 신뢰도 | 근거 |
|----|------|--------|------|
| B1 | CLI 인터페이스 동작은 변경되지 않아야 한다 | High | 하위 호환성 요구사항 |
| B2 | .excalidraw 파일 포맷 지원은 유지되어야 한다 | High | 핵심 기능 |
| B3 | Docker 이미지 빌드 및 사용은 계속 가능해야 한다 | High | CI/CD 파이프라인 의존성 |

---

## 3. Requirements (요구사항) - EARS 형식

### 3.1 Ubiquitous Requirements (항상 적용)

#### REQ-U-001: 하위 호환성 유지
> 시스템은 **항상** 기존 CLI 명령 인터페이스(`excalidraw-cli <input> <output>`)를 동일하게 지원해야 한다.

**근거**: 기존 사용자 스크립트 및 CI/CD 파이프라인과의 호환성 유지
**검증**: 기존 테스트 케이스 모두 통과

#### REQ-U-002: 렌더링 품질 유지
> 시스템은 **항상** 기존과 동일한 품질의 PNG 이미지를 생성해야 한다.

**근거**: Excalidraw의 손그림 스타일 재현은 핵심 가치
**검증**: 시각적 회귀 테스트 및 스냅샷 비교

#### REQ-U-003: Node.js LTS 지원
> 시스템은 **항상** Node.js 18.x 이상의 LTS 버전에서 실행되어야 한다.

**근거**: Node.js 8.x는 EOL 상태이며 보안 취약점 존재
**검증**: CI/CD에서 Node 18, 20, 22 환경 테스트

---

### 3.2 Event-Driven Requirements (이벤트 기반)

#### REQ-E-001: oclif 명령 처리
> **WHEN** 사용자가 `excalidraw-cli` 명령을 실행하면 **THEN** oclif v4 기반의 Command 클래스가 인자를 파싱하고 처리해야 한다.

**영향 파일**: `/src/index.ts`
**변경 범위**:
- `@oclif/command` -> `@oclif/core` 마이그레이션
- flags API 변경 대응
- args 정의 방식 변경

#### REQ-E-002: 배치 작업 실행
> **WHEN** 디렉토리 경로가 입력으로 주어지면 **THEN** listr2 v8 기반의 태스크 리스트가 병렬로 파일을 처리해야 한다.

**영향 파일**: `/src/worker.js`
**변경 범위**: listr -> listr2 통합 마이그레이션

#### REQ-E-003: 캔버스 생성
> **WHEN** Excalidraw JSON 파일이 로드되면 **THEN** canvas v3 API를 사용하여 캔버스를 생성하고 폰트를 등록해야 한다.

**영향 파일**: `/src/renderer/index.js`
**변경 범위**: canvas API 호환성 확인 및 필요시 수정

#### REQ-E-004: 도형 렌더링
> **WHEN** 요소 타입이 arrow일 때 **THEN** roughjs v5의 public API를 사용하여 화살표를 렌더링해야 한다.

**영향 파일**: `/src/renderer/arrow.js`
**변경 범위**: `rc.generator` 내부 API를 public API로 리팩토링

---

### 3.3 State-Driven Requirements (상태 기반)

#### REQ-S-001: Docker 환경 빌드
> **IF** Alpine Linux 환경에서 실행 중이면 **THEN** 모든 네이티브 의존성이 정상적으로 컴파일되어야 한다.

**영향 파일**: `/Dockerfile`
**검증**: Docker 빌드 성공 및 컨테이너 내 CLI 실행 테스트

#### REQ-S-002: 테스트 환경
> **IF** `npm test` 명령이 실행되면 **THEN** Jest 29 기반의 테스트가 모두 통과해야 한다.

**영향 파일**: `/src/compute.spec.ts`, `package.json`
**변경 범위**: Jest 설정 업데이트, 테스트 코드 호환성 확인

---

### 3.4 Unwanted Requirements (금지 사항)

#### REQ-N-001: Breaking Changes 금지
> 시스템은 CLI 인터페이스에 **breaking changes를 도입하지 않아야 한다**.

**근거**: 기존 사용자 스크립트 호환성
**예외**: `--help` 출력 포맷 변경은 허용

#### REQ-N-002: 내부 API 의존 금지
> 시스템은 외부 라이브러리의 **내부(undocumented) API에 의존하지 않아야 한다**.

**근거**: roughjs `rc.generator` 사용이 버전 업그레이드 장애물
**조치**: public API로 리팩토링

#### REQ-N-003: 보안 취약점 금지
> 시스템은 **알려진 보안 취약점이 있는 의존성을 사용하지 않아야 한다**.

**검증**: `npm audit` 결과 high/critical 취약점 0개

---

### 3.5 Optional Requirements (선택적)

#### REQ-O-001: ESM 지원
> **가능하면** ES Modules 형식의 import/export를 지원한다.

**우선순위**: Low
**근거**: 향후 생태계 방향성

#### REQ-O-002: SVG 출력 지원
> **가능하면** PNG 외에 SVG 포맷 출력을 지원한다.

**우선순위**: Low
**근거**: 사용자 요청 (향후 기능 확장)

---

## 4. Specifications (상세 명세)

### 4.1 의존성 업데이트 매트릭스

#### Phase 1: Low-Risk Updates (저위험)

| 패키지 | 현재 | 목표 | 위험도 | 작업 내용 |
|--------|------|------|--------|-----------|
| Node.js engine | >=8.0.0 | >=18.0.0 | Low | package.json engines 필드 변경 |
| TypeScript | ^4.1.2 | ^5.7.x | Low | tsconfig.json 업데이트, 타입 오류 수정 |
| Jest | ^27.0.4 | ^29.x | Low | Jest 설정 마이그레이션 |
| @types/* | 현재 | 최신 | Low | 타입 정의 패키지 업데이트 |
| chalk | ^4.0.0 | ^5.x | Low | ESM 전환 (선택적) |
| fs-extra | ^9.0.1 | ^11.x | Low | API 호환 |
| rxjs | ^6.5.5 | ^7.x | Low | Listr 연동 확인 |

#### Phase 2: Medium-Risk Updates (중위험)

| 패키지 | 현재 | 목표 | 위험도 | 작업 내용 |
|--------|------|------|--------|-----------|
| canvas | ^2.6.1 | ^3.x | Medium | 네이티브 빌드 검증, API 호환성 테스트 |
| roughjs | ^4.3.1 | ^5.x | Medium | 내부 API(rc.generator) 제거, 리팩토링 |
| listr/listr2 | 혼합 | listr2 ^8.x | Medium | 단일 라이브러리로 통합 |

#### Phase 3: High-Risk Updates (고위험)

| 패키지 | 현재 | 목표 | 위험도 | 작업 내용 |
|--------|------|------|--------|-----------|
| @oclif/command | ^1 | N/A (제거) | Critical | @oclif/core ^4.x 마이그레이션 |
| @oclif/config | ^1 | N/A (제거) | Critical | @oclif/core 통합 |
| @oclif/plugin-help | ^3.2.0 | ^6.x | High | 새 버전 호환 |
| @oclif/dev-cli | ^1 | @oclif/dev-cli 제거 | High | oclif CLI 도구로 대체 |

### 4.2 oclif v4 마이그레이션 상세

#### 변경 전 (현재 코드)
```typescript
// src/index.ts
import { Command, flags } from '@oclif/command'

class ExcalidrawCli extends Command {
    static flags = {
        version: flags.version({char: 'v'}),
        help: flags.help({char: 'h'}),
        quiet: flags.boolean({ char: 'q' })
    }
    static args = [
        { name: 'input', default: '{cwd}' },
        { name: 'output', default: '{cwd}' }
    ]
    async run() {
        const { args, flags } = this.parse(ExcalidrawCli)
    }
}
```

#### 변경 후 (목표 코드)
```typescript
// src/index.ts
import { Command, Args, Flags } from '@oclif/core'

export default class ExcalidrawCli extends Command {
    static flags = {
        version: Flags.version({char: 'v'}),
        help: Flags.help({char: 'h'}),
        quiet: Flags.boolean({ char: 'q' })
    }
    static args = {
        input: Args.string({ default: '{cwd}', description: 'Input file or directory' }),
        output: Args.string({ default: '{cwd}', description: 'Output file or directory' })
    }
    async run() {
        const { args, flags } = await this.parse(ExcalidrawCli)
    }
}
```

### 4.3 roughjs 리팩토링 상세

#### 문제점
현재 `/src/renderer/arrow.js`에서 `rc.generator`라는 내부 API를 사용 중:
- roughjs v5에서 이 API가 제거되거나 변경될 수 있음
- 공식 문서에 없는 undocumented API

#### 해결 방안
1. roughjs public API(`rc.path()`, `rc.line()` 등)만 사용하도록 리팩토링
2. 또는 화살표 렌더링 로직을 자체 구현

### 4.4 Docker 빌드 명세

#### 현재 Dockerfile 구조
```dockerfile
FROM node:alpine
RUN apk add --no-cache python g++ build-base cairo-dev jpeg-dev pango-dev \
    musl-dev giflib-dev pixman-dev pangomm-dev libjpeg-turbo-dev freetype-dev
RUN npm install -g @tommywalkie/excalidraw-cli
```

#### 업데이트 고려사항
- Node 18+ Alpine 이미지 사용
- canvas v3 네이티브 빌드 의존성 확인
- Python 3 명시 (일부 네이티브 빌드에 필요)

---

## 5. Traceability (추적성)

### 5.1 요구사항-파일 매핑

| 요구사항 ID | 영향 파일 | 테스트 파일 |
|-------------|-----------|-------------|
| REQ-E-001 | `/src/index.ts` | `compute.spec.ts`, CLI 통합 테스트 |
| REQ-E-002 | `/src/worker.js` | 배치 처리 테스트 |
| REQ-E-003 | `/src/renderer/index.js` | 렌더링 테스트 |
| REQ-E-004 | `/src/renderer/arrow.js` | 화살표 렌더링 테스트 |
| REQ-S-001 | `/Dockerfile` | Docker 빌드 테스트 |
| REQ-S-002 | `package.json`, `*.spec.ts` | Jest 테스트 스위트 |

### 5.2 Phase-요구사항 매핑

| Phase | 관련 요구사항 |
|-------|---------------|
| Phase 1 | REQ-U-003, REQ-S-002 |
| Phase 2 | REQ-E-003, REQ-E-004, REQ-N-002, REQ-S-001 |
| Phase 3 | REQ-E-001, REQ-E-002, REQ-U-001, REQ-N-001 |

---

## 6. Risk Analysis (위험 분석)

### 6.1 기술적 위험

| ID | 위험 | 확률 | 영향 | 완화 전략 |
|----|------|------|------|-----------|
| R1 | roughjs v5가 기존 기능을 지원하지 않음 | Medium | High | v4 고정 또는 자체 구현 검토 |
| R2 | canvas v3 Alpine 빌드 실패 | Low | High | 빌드 환경 사전 테스트, 대안 이미지 준비 |
| R3 | oclif v4 마이그레이션 복잡도 예상 초과 | Medium | Medium | 마이그레이션 가이드 사전 숙지 |
| R4 | 시각적 렌더링 차이 발생 | Medium | Medium | 스냅샷 테스트로 회귀 감지 |

### 6.2 일정 위험

| ID | 위험 | 확률 | 영향 | 완화 전략 |
|----|------|------|------|-----------|
| R5 | Phase 3가 예상보다 오래 걸림 | Medium | Medium | Phase별 독립 브랜치로 진행 |

---

## 7. Dependencies (의존성)

### 7.1 외부 의존성
- npm registry 접근
- Docker Hub (node:alpine 이미지)
- oclif 공식 마이그레이션 가이드

### 7.2 내부 의존성
- Phase 2는 Phase 1 완료 후 시작
- Phase 3는 Phase 1, 2 완료 후 시작 (단, 병렬 진행 가능)

---

*마지막 업데이트: 2026-01-26*
*SPEC 버전: 1.0.0*
