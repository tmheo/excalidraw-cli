# SPEC-UPDATE-001: 구현 계획

## 메타데이터

| 항목 | 값 |
|------|-----|
| **SPEC ID** | SPEC-UPDATE-001 |
| **관련 문서** | [spec.md](./spec.md), [acceptance.md](./acceptance.md) |
| **생성일** | 2026-01-26 |
| **방법론** | DDD (ANALYZE-PRESERVE-IMPROVE) |

---

## 1. 마일스톤 개요

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        SPEC-UPDATE-001 마일스톤                           │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐                  │
│  │  Phase 1    │───▶│  Phase 2    │───▶│  Phase 3    │                  │
│  │ Low-Risk    │    │ Medium-Risk │    │ High-Risk   │                  │
│  │ Foundation  │    │ Rendering   │    │ CLI Core    │                  │
│  └─────────────┘    └─────────────┘    └─────────────┘                  │
│        │                  │                  │                           │
│        ▼                  ▼                  ▼                           │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐                  │
│  │ TypeScript  │    │ canvas v3   │    │ oclif v4    │                  │
│  │ Jest 29     │    │ roughjs v4.6.6  │    │ Migration   │                  │
│  │ Node 18+    │    │ listr2 v10   │    │ Final QA    │                  │
│  └─────────────┘    └─────────────┘    └─────────────┘                  │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Phase 1: Foundation (저위험 업데이트)

### 2.1 목표
- 빌드 및 테스트 인프라 현대화
- 핵심 기능에 영향 없이 기반 업그레이드
- 이후 Phase를 위한 안정적인 기반 마련

### 2.2 우선순위: Primary Goal

### 2.3 작업 목록

#### Task 1.1: Node.js 엔진 요구사항 업데이트
| 항목 | 내용 |
|------|------|
| **파일** | `package.json` |
| **변경** | `"node": ">=8.0.0"` -> `"node": ">=18.0.0"` |
| **위험도** | Low |
| **검증** | `node --version` 체크, CI 환경 확인 |

#### Task 1.2: TypeScript 업그레이드
| 항목 | 내용 |
|------|------|
| **파일** | `package.json`, `tsconfig.json` |
| **변경** | `typescript ^4.1.2` -> `^5.7.x` |
| **위험도** | Low |
| **검증** | `npm run prepack` 성공, 타입 오류 0개 |

**tsconfig.json 업데이트 고려사항:**
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "CommonJS",
    "moduleResolution": "node",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  }
}
```

#### Task 1.3: Jest 업그레이드
| 항목 | 내용 |
|------|------|
| **파일** | `package.json` |
| **변경** | `jest ^27.0.4` -> `^29.x` |
| **추가** | `@types/jest ^29.x` |
| **위험도** | Low |
| **검증** | `npm test` 모든 테스트 통과 |

**Jest 29 설정 마이그레이션:**
```json
{
  "jest": {
    "testRegex": ".spec.(js|ts)$",
    "transform": {
      "^.+\\.tsx?$": "ts-jest"
    }
  }
}
```

#### Task 1.4: 타입 정의 패키지 업데이트
| 항목 | 내용 |
|------|------|
| **파일** | `package.json` |
| **패키지** | `@types/chalk`, `@types/fs-extra`, `@types/jest` |
| **위험도** | Low |
| **검증** | TypeScript 컴파일 성공 |

#### Task 1.5: 유틸리티 라이브러리 업데이트
| 패키지 | 현재 | 목표 | 비고 |
|--------|------|------|------|
| chalk | ^4.0.0 | ^5.x | ESM 전용 - CJS 호환 확인 필요 |
| fs-extra | ^9.0.1 | ^11.x | API 호환 |
| rxjs | ^6.5.5 | ^7.x | listr2와 호환성 확인 |
| rimraf | ^3.0.2 | ^5.x | API 변경 확인 |
| globby | ^11.0.1 | ^14.x | ESM 전용 - 대안 검토 |

**ESM 전환 관련 주의:**
- chalk v5, globby v14는 ESM 전용
- CJS 프로젝트 유지 시: chalk v4 유지 또는 dynamic import 사용
- 또는 전체 ESM 전환 고려 (Phase 3 이후)

### 2.4 완료 기준
- [ ] `npm install` 성공
- [ ] `npm run prepack` 빌드 성공
- [ ] `npm test` 모든 테스트 통과
- [ ] TypeScript 컴파일 오류 0개
- [ ] `npm audit` high/critical 취약점 0개

---

## 3. Phase 2: Rendering Layer (중위험 업데이트)

### 3.1 목표
- 렌더링 핵심 라이브러리 현대화
- 네이티브 의존성 호환성 확보
- 내부 API 의존성 제거

### 3.2 우선순위: Secondary Goal

### 3.3 작업 목록

#### Task 2.1: canvas v3 업그레이드
| 항목 | 내용 |
|------|------|
| **파일** | `package.json`, `/src/renderer/index.js` |
| **변경** | `canvas ^2.6.1` -> `^3.x` |
| **위험도** | Medium-High |
| **검증** | 렌더링 테스트, Docker 빌드 |

**canvas v3 주요 변경사항 확인 필요:**
- API 호환성 (createCanvas, registerFont)
- 네이티브 빌드 요구사항 변경
- Alpine Linux 빌드 지원

**검증 절차:**
1. 로컬 환경에서 canvas v3 설치 테스트
2. 기존 렌더링 코드 호환성 확인
3. Docker Alpine 빌드 테스트

#### Task 2.2: roughjs v4.6.6 마이그레이션
| 항목 | 내용 |
|------|------|
| **파일** | `package.json`, `/src/renderer/arrow.js`, 기타 렌더러 |
| **변경** | `roughjs ^4.3.1` -> `^5.x` |
| **위험도** | High |
| **검증** | 모든 도형 렌더링 테스트 |

**rc.generator 리팩토링 전략:**

현재 문제 코드 (`/src/renderer/arrow.js`):
```javascript
// roughjs 내부 API 사용 - v5에서 동작 불확실
const path = rc.generator.line(x1, y1, x2, y2, options);
rc.draw(path);
```

해결 방안 1 - public API 사용:
```javascript
// roughjs public API만 사용
rc.line(x1, y1, x2, y2, options);
```

해결 방안 2 - 자체 구현:
```javascript
// 필요시 화살표 머리 부분 직접 구현
// roughjs의 line()과 polygon() 조합
```

**사전 조사 필요:**
- roughjs v4.6.6 CHANGELOG 및 마이그레이션 가이드 확인
- `rc.generator` 대체 API 존재 여부 확인
- 필요시 roughjs maintainer에 문의 또는 이슈 검색

#### Task 2.3: listr/listr2 통합
| 항목 | 내용 |
|------|------|
| **파일** | `package.json`, `/src/worker.js` |
| **변경** | `listr ^0.14.3`, `listr2 ^3.2.3` -> `listr2 ^8.x` 단일화 |
| **위험도** | Medium |
| **검증** | 배치 처리 테스트, 진행률 표시 확인 |

**listr2 v10 마이그레이션:**
```javascript
// 기존 (listr v0.14)
const Listr = require('listr');
new Listr(tasks).run();

// 새 버전 (listr2 v10)
import { Listr } from 'listr2';
new Listr(tasks, { concurrent: true }).run();
```

#### Task 2.4: Docker 빌드 업데이트
| 항목 | 내용 |
|------|------|
| **파일** | `/Dockerfile` |
| **변경** | Node.js 이미지 업데이트, 네이티브 의존성 확인 |
| **위험도** | Medium |
| **검증** | Docker 빌드 및 실행 테스트 |

**Dockerfile 업데이트 예시:**
```dockerfile
FROM node:22-alpine

# Python 3 명시 (일부 네이티브 빌드 필요)
RUN apk add --no-cache \
    python3 \
    g++ \
    build-base \
    cairo-dev \
    jpeg-dev \
    pango-dev \
    musl-dev \
    giflib-dev \
    pixman-dev \
    pangomm-dev \
    libjpeg-turbo-dev \
    freetype-dev

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run prepack

WORKDIR /data
ENTRYPOINT ["node", "/app/bin/run"]
```

### 3.4 완료 기준
- [ ] canvas v3 설치 및 빌드 성공
- [ ] roughjs v4.6.6 마이그레이션 완료 (내부 API 제거)
- [ ] listr2 단일화 완료
- [ ] Docker 빌드 성공
- [ ] 모든 렌더링 테스트 통과
- [ ] 시각적 회귀 테스트 통과 (스냅샷 비교)

---

## 4. Phase 3: CLI Core (고위험 업데이트)

### 4.1 목표
- oclif v1 -> v4 완전 마이그레이션
- CLI 인터페이스 하위 호환성 유지
- 최종 품질 검증

### 4.2 우선순위: Final Goal

### 4.3 작업 목록

#### Task 3.1: oclif 패키지 제거 및 교체
| 항목 | 내용 |
|------|------|
| **제거** | `@oclif/command`, `@oclif/config`, `@oclif/dev-cli` |
| **추가** | `@oclif/core ^4.x`, `@oclif/plugin-help ^6.x` |
| **위험도** | Critical |

**package.json 변경:**
```json
{
  "dependencies": {
    "@oclif/core": "^4.0.0",
    "@oclif/plugin-help": "^6.0.0"
  },
  "devDependencies": {
    // @oclif/dev-cli 제거
    // oclif CLI는 npx로 사용
  }
}
```

#### Task 3.2: Command 클래스 마이그레이션
| 항목 | 내용 |
|------|------|
| **파일** | `/src/index.ts` |
| **변경** | Command 클래스 구조, flags/args API 변경 |
| **위험도** | Critical |
| **검증** | 모든 CLI 명령 테스트 |

**상세 마이그레이션 가이드:**

1. Import 변경:
```typescript
// Before
import { Command, flags } from '@oclif/command'

// After
import { Command, Args, Flags } from '@oclif/core'
```

2. Flags 정의 변경:
```typescript
// Before
static flags = {
    version: flags.version({char: 'v'}),
    help: flags.help({char: 'h'}),
    quiet: flags.boolean({ char: 'q' })
}

// After
static flags = {
    version: Flags.version({char: 'v'}),
    help: Flags.help({char: 'h'}),
    quiet: Flags.boolean({ char: 'q', description: 'Suppress output' })
}
```

3. Args 정의 변경:
```typescript
// Before
static args = [
    { name: 'input', default: '{cwd}' },
    { name: 'output', default: '{cwd}' }
]

// After
static args = {
    input: Args.string({
        default: '{cwd}',
        description: 'Input file or directory path'
    }),
    output: Args.string({
        default: '{cwd}',
        description: 'Output file or directory path'
    })
}
```

4. Parse 호출 변경:
```typescript
// Before
async run() {
    const { args, flags } = this.parse(ExcalidrawCli)
}

// After
async run() {
    const { args, flags } = await this.parse(ExcalidrawCli)
}
```

5. Export 변경:
```typescript
// Before
export = ExcalidrawCli

// After
export default ExcalidrawCli
```

#### Task 3.3: oclif 설정 업데이트
| 항목 | 내용 |
|------|------|
| **파일** | `package.json` |
| **변경** | oclif 설정 섹션 업데이트 |
| **위험도** | Medium |

**package.json oclif 설정:**
```json
{
  "oclif": {
    "bin": "excalidraw-cli",
    "dirname": "excalidraw-cli",
    "commands": "./lib",
    "plugins": [
      "@oclif/plugin-help"
    ],
    "topicSeparator": " "
  }
}
```

#### Task 3.4: bin/run 스크립트 업데이트
| 항목 | 내용 |
|------|------|
| **파일** | `/bin/run` |
| **변경** | oclif v4 런타임 초기화 방식 적용 |
| **위험도** | Medium |

**bin/run 업데이트:**
```javascript
#!/usr/bin/env node

async function main() {
  const { execute } = await import('@oclif/core')
  await execute({ dir: import.meta.url })
}

main()
```

또는 CJS 유지 시:
```javascript
#!/usr/bin/env node

const oclif = require('@oclif/core')

oclif.run().then(require('@oclif/core/flush')).catch(require('@oclif/core/handle'))
```

#### Task 3.5: 최종 통합 테스트
| 항목 | 내용 |
|------|------|
| **범위** | CLI 전체 기능, Docker, CI/CD |
| **검증** | 모든 테스트 케이스 통과 |

### 4.4 완료 기준
- [ ] oclif v4 마이그레이션 완료
- [ ] CLI 명령 하위 호환성 유지 확인
- [ ] `--help`, `--version` 정상 동작
- [ ] 단일 파일 변환 테스트 통과
- [ ] 디렉토리 배치 변환 테스트 통과
- [ ] Docker 컨테이너 내 실행 테스트 통과
- [ ] `npm audit` high/critical 취약점 0개

---

## 5. 기술적 접근 방식

### 5.1 DDD (ANALYZE-PRESERVE-IMPROVE) 적용

#### ANALYZE 단계
- 각 Phase 시작 전 영향 받는 코드 분석
- 의존성 그래프 및 호출 관계 파악
- 기존 테스트 커버리지 확인

#### PRESERVE 단계
- 특성화 테스트(Characterization Test) 작성
- 현재 동작의 스냅샷 캡처
- 회귀 방지를 위한 기준선 설정

#### IMPROVE 단계
- 점진적 변경 적용
- 각 변경 후 테스트 실행
- 문제 발생 시 즉시 롤백

### 5.2 브랜치 전략

```
main
 │
 └── feature/SPEC-UPDATE-001
      │
      ├── phase-1-foundation
      │    ├── task-1.1-node-engine
      │    ├── task-1.2-typescript
      │    └── task-1.3-jest
      │
      ├── phase-2-rendering
      │    ├── task-2.1-canvas
      │    ├── task-2.2-roughjs
      │    └── task-2.3-listr
      │
      └── phase-3-cli
           ├── task-3.1-oclif-packages
           └── task-3.2-command-migration
```

### 5.3 롤백 전략

| 상황 | 대응 |
|------|------|
| Phase 1 실패 | 개별 패키지 버전 고정으로 복구 |
| Phase 2 실패 | canvas/roughjs 이전 버전 유지, 대안 검토 |
| Phase 3 실패 | oclif v1 유지, 장기 마이그레이션 계획 수립 |

---

## 6. 아키텍처 설계 방향

### 6.1 현재 아키텍처 유지
- 모듈화된 렌더러 구조 유지
- CLI -> compute -> worker -> renderer 흐름 유지
- 외부 라이브러리 의존성 최소화

### 6.2 개선 포인트
- 내부 API 의존성 제거 (roughjs rc.generator)
- 혼합된 listr/listr2 단일화
- TypeScript strict 모드 적용 고려

### 6.3 향후 확장 고려
- ESM 전환 준비 (선택적)
- 추가 출력 포맷 지원 구조 (SVG)

---

## 7. 위험 대응 계획

### 7.1 roughjs v4.6.6 호환성 문제 발생 시

**Option A: roughjs v4 유지**
- roughjs ^4.3.1 버전 고정
- 보안 취약점 없으면 허용

**Option B: 자체 구현**
- arrow.js의 rc.generator 사용 부분만 자체 구현
- 기본 도형은 roughjs public API 계속 사용

**Option C: Excalidraw 공식 렌더러 대기**
- Excalidraw Node 호환 API 릴리즈 대기 (장기)
- 관련 이슈: excalidraw#1780

### 7.2 canvas v3 Alpine 빌드 실패 시

**Option A: Debian 기반 이미지**
```dockerfile
FROM node:22-slim
# Debian 패키지 매니저 사용
```

**Option B: canvas v2 유지**
- 보안 취약점 확인 후 결정

### 7.3 oclif v4 마이그레이션 복잡도 초과 시

**Option A: 점진적 마이그레이션**
- 최소한의 변경으로 v2/v3 중간 버전 경유

**Option B: CLI 프레임워크 변경**
- commander.js 또는 yargs 검토 (최후 수단)

---

## 8. 에이전트 위임 계획

### 8.1 권장 에이전트

| Phase | 주요 에이전트 | 역할 |
|-------|---------------|------|
| Phase 1 | expert-backend | TypeScript/Jest 업그레이드 |
| Phase 2 | expert-backend | canvas/roughjs 마이그레이션 |
| Phase 2 | expert-devops | Docker 빌드 검증 |
| Phase 3 | expert-backend | oclif 마이그레이션 |
| 전체 | expert-testing | 테스트 작성 및 검증 |
| 전체 | manager-quality | TRUST 5 품질 게이트 |

### 8.2 전문가 상담 추천

| 영역 | 상담 필요 시점 | 상담 내용 |
|------|---------------|-----------|
| expert-backend | Phase 2 시작 전 | roughjs 내부 API 리팩토링 전략 |
| expert-devops | Phase 2 Task 2.4 | Alpine Linux 네이티브 빌드 이슈 |
| expert-testing | 각 Phase 완료 시 | 테스트 커버리지 및 회귀 테스트 |

---

*마지막 업데이트: 2026-01-26*
*SPEC ID: SPEC-UPDATE-001*
