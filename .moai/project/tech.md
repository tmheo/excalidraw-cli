# excalidraw-cli 기술 명세

## 기술 스택 개요

| 카테고리 | 기술 | 버전 |
|----------|------|------|
| **언어** | TypeScript / JavaScript | 4.1.2 / ES2017 |
| **런타임** | Node.js | >= 8.0.0 |
| **CLI 프레임워크** | oclif | v1 |
| **캔버스 렌더링** | node-canvas | ^2.6.1 |
| **손그림 스타일** | Rough.js | ^4.3.1 |
| **태스크 관리** | Listr / Listr2 | ^0.14.3 / ^3.2.3 |
| **테스트** | Jest | ^27.0.4 |
| **빌드** | TypeScript Compiler (tsc) | - |
| **컨테이너** | Docker (Alpine Linux) | - |

---

## 핵심 의존성 상세

### 1. oclif (CLI 프레임워크)

**선택 이유:**
- Heroku에서 개발한 성숙한 Node.js CLI 프레임워크
- 플러그인 아키텍처 지원
- 자동 도움말 생성
- TypeScript 네이티브 지원
- 테스트 유틸리티 내장

**사용 패키지:**
| 패키지 | 용도 |
|--------|------|
| `@oclif/command` | 명령 클래스 기반 CLI 정의 |
| `@oclif/config` | CLI 설정 관리 |
| `@oclif/plugin-help` | `--help` 자동 생성 |
| `@oclif/dev-cli` | 개발 도구 (manifest 생성 등) |

**적용 방식:**
```typescript
// src/index.ts
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
}
```

---

### 2. node-canvas (캔버스 렌더링)

**선택 이유:**
- 브라우저 환경 없이 Node.js에서 Canvas API 사용 가능
- libcairo 기반의 고품질 2D 렌더링
- PNG/JPEG 등 다양한 이미지 포맷 출력 지원
- 커스텀 폰트 등록 지원

**핵심 기능:**
| 기능 | API |
|------|-----|
| 캔버스 생성 | `createCanvas(width, height)` |
| 폰트 등록 | `registerFont(path, { family })` |
| 이미지 출력 | `canvas.toBuffer('image/png')` |
| 2D 컨텍스트 | `canvas.getContext('2d')` |

**네이티브 의존성:**
- libcairo
- libjpeg
- libpango
- libgif
- libpixman

---

### 3. Rough.js (손그림 스타일)

**선택 이유:**
- Excalidraw의 시그니처인 "hand-drawn" 스타일 구현
- Canvas 및 SVG 렌더링 모두 지원
- 다양한 도형 및 채우기 패턴 제공
- 랜덤 시드 기반 일관된 스케치 효과

**핵심 기능:**
| 메서드 | 용도 |
|--------|------|
| `rough.canvas(canvas)` | Rough.js 캔버스 인스턴스 생성 |
| `rc.rectangle()` | 손그림 스타일 사각형 |
| `rc.ellipse()` | 손그림 스타일 타원 |
| `rc.line()` | 손그림 스타일 직선 |
| `rc.path()` | SVG 경로 기반 손그림 |

**스타일 옵션:**
| 옵션 | 설명 |
|------|------|
| `roughness` | 스케치 정도 (0: 매끄러움, 높을수록 거침) |
| `fill` | 채우기 색상 |
| `fillStyle` | 채우기 패턴 (solid, hachure, cross-hatch 등) |
| `stroke` | 테두리 색상 |
| `strokeWidth` | 테두리 두께 |

---

### 4. Listr / Listr2 (태스크 관리)

**선택 이유:**
- 터미널에서 시각적 태스크 진행 상황 표시
- 병렬 및 순차 태스크 실행 지원
- Observable (RxJS) 기반 비동기 처리
- 에러 핸들링 및 롤백 지원

**적용 방식:**
- 디렉토리 내 다수의 `.excalidraw` 파일 배치 변환
- 각 파일 변환을 개별 태스크로 관리
- 진행률 및 성공/실패 상태 실시간 표시

---

### 5. 유틸리티 라이브러리

| 라이브러리 | 버전 | 용도 |
|------------|------|------|
| `chalk` | ^4.0.0 | 터미널 컬러 출력 |
| `fs-extra` | ^9.0.1 | 확장된 파일 시스템 유틸리티 |
| `fs-readdir-recursive` | ^1.1.0 | 재귀 디렉토리 탐색 |
| `rxjs` | ^6.5.5 | 리액티브 프로그래밍 (Listr와 연동) |

---

## 개발 환경 요구사항

### 필수 요구사항

| 요구사항 | 최소 버전 | 설명 |
|----------|-----------|------|
| Node.js | >= 8.0.0 | JavaScript 런타임 |
| npm 또는 yarn | - | 패키지 관리자 |

### 네이티브 의존성 (node-canvas)

`node-canvas`는 libcairo 기반으로 동작하므로 시스템에 네이티브 라이브러리 설치가 필요합니다.

#### macOS

```bash
brew install pkg-config cairo pango libpng jpeg giflib librsvg
```

#### Ubuntu/Debian

```bash
sudo apt-get install build-essential libcairo2-dev libpango1.0-dev \
    libjpeg-dev libgif-dev librsvg2-dev
```

#### Alpine Linux (Docker)

```dockerfile
RUN apk add --no-cache python g++ build-base cairo-dev jpeg-dev pango-dev \
    musl-dev giflib-dev pixman-dev pangomm-dev libjpeg-turbo-dev freetype-dev
```

#### Windows

Windows에서는 빌드 도구가 필요합니다:

```bash
npm install --global windows-build-tools
```

---

## 빌드 구성

### TypeScript 설정 (`tsconfig.json`)

| 설정 | 값 | 설명 |
|------|-----|------|
| `target` | ES2017 | 출력 JavaScript 버전 |
| `module` | CommonJS | 모듈 시스템 |
| `outDir` | ./lib | 컴파일 출력 디렉토리 |
| `declaration` | true | .d.ts 타입 정의 파일 생성 |

### 빌드 스크립트 (`package.json`)

| 스크립트 | 명령 | 설명 |
|----------|------|------|
| `prepack` | `rimraf lib && tsc -b && cpy ./src/fonts ./lib/fonts` | 빌드 전 준비 |
| `postpack` | `rimraf oclif.manifest.json` | 빌드 후 정리 |
| `test` | `npm run prepack && jest` | 빌드 후 테스트 실행 |

### 빌드 프로세스

```
1. rimraf lib          # 기존 빌드 출력 삭제
       │
       ▼
2. tsc -b              # TypeScript 컴파일
       │               # src/*.ts → lib/*.js
       │               # src/*.js → lib/*.js (복사)
       ▼
3. cpy ./src/fonts     # 폰트 파일 복사
   ./lib/fonts         # lib/fonts/ 디렉토리로
       │
       ▼
4. [결과]              # lib/ 디렉토리에 실행 가능한 CommonJS 코드
```

---

## 테스트 구성

### Jest 설정

```json
// package.json
{
  "jest": {
    "testRegex": ".spec.js$"
  }
}
```

| 설정 | 값 | 설명 |
|------|-----|------|
| `testRegex` | `.spec.js$` | `.spec.js`로 끝나는 파일을 테스트로 인식 |

### 테스트 파일 구조

| 파일 | 위치 | 설명 |
|------|------|------|
| `compute.spec.ts` | `/src/` | compute.js 유닛 테스트 |
| `*.excalidraw` | `/test/` | 테스트용 샘플 Excalidraw 파일 |

### 테스트 실행

```bash
# 전체 테스트 (빌드 포함)
npm run test

# Jest 직접 실행 (빌드 후)
npx jest
```

---

## 배포 구성

### npm 패키지

| 설정 | 값 | 설명 |
|------|-----|------|
| `name` | @tommywalkie/excalidraw-cli | npm 패키지 이름 (스코프) |
| `main` | ./lib/index.js | CommonJS 진입점 |
| `types` | lib/index.d.ts | TypeScript 타입 정의 |
| `bin` | excalidraw-cli → ./bin/run | CLI 명령 매핑 |

### 포함 파일 (`files`)

```json
[
  "/bin",
  "/lib",
  "/npm-shrinkwrap.json",
  "/oclif.manifest.json"
]
```

### Docker 이미지

```dockerfile
FROM node:alpine

# 네이티브 의존성 설치
RUN apk update
RUN apk add --no-cache python g++ build-base cairo-dev jpeg-dev pango-dev \
    musl-dev giflib-dev pixman-dev pangomm-dev libjpeg-turbo-dev freetype-dev

# 애플리케이션 설치
RUN npm install -g @tommywalkie/excalidraw-cli

# 작업 디렉토리 설정
WORKDIR /data
ENTRYPOINT ["excalidraw-cli"]
```

---

## 아키텍처 패턴

### CLI 애플리케이션 패턴

```
┌─────────────────────────────────────────────────────────────────┐
│                    User Interface Layer                         │
│                       (oclif CLI)                               │
│  - Command parsing                                              │
│  - Flag/argument validation                                     │
│  - Help generation                                              │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Application Layer                             │
│              (compute.js, worker.js)                            │
│  - Input validation                                             │
│  - File discovery                                               │
│  - Task orchestration                                           │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Domain Layer                                 │
│                 (renderer modules)                              │
│  - Excalidraw JSON parsing                                      │
│  - Canvas creation                                              │
│  - Shape rendering                                              │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                Infrastructure Layer                             │
│           (node-canvas, roughjs, fs)                            │
│  - Native canvas operations                                     │
│  - File system I/O                                              │
│  - Image encoding                                               │
└─────────────────────────────────────────────────────────────────┘
```

### 모듈화된 렌더러 아키텍처

각 도형 타입은 독립적인 렌더러 모듈로 분리되어 있습니다:

- **단일 책임 원칙**: 각 렌더러는 하나의 도형 타입만 담당
- **쉬운 확장성**: 새로운 도형 추가 시 새 렌더러 모듈만 생성
- **테스트 용이성**: 각 렌더러를 독립적으로 테스트 가능

---

## 성능 고려사항

### 메모리 관리

- 대용량 Excalidraw 파일 처리 시 캔버스 크기에 따른 메모리 사용량 증가
- 배치 처리 시 순차적 파일 처리로 메모리 피크 방지

### 렌더링 최적화

- 도형별 렌더러 호출로 불필요한 조건문 최소화
- Rough.js 캐싱을 통한 반복 렌더링 최적화

### 배치 처리

- Listr를 통한 병렬 태스크 실행
- 진행 상황 표시로 사용자 경험 향상

---

## 버전 호환성

| 구성 요소 | 지원 버전 |
|-----------|-----------|
| Node.js | >= 8.0.0 |
| npm | >= 5.0.0 |
| Excalidraw JSON 스키마 | v1 (초기 버전) |

---

*마지막 업데이트: 2026-01-26*
