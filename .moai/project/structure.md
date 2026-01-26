# excalidraw-cli 프로젝트 구조

## 디렉토리 트리

```
excalidraw-cli/
├── bin/                        # CLI 실행 진입점
│   └── run                     # Node.js CLI 실행 스크립트
│
├── src/                        # 소스 코드 (TypeScript/ES2017)
│   ├── index.ts               # 메인 CLI 명령 클래스 (oclif)
│   ├── compute.js             # 사용자 입력 처리 및 캔버스 생성
│   ├── compute.spec.ts        # compute.js 유닛 테스트
│   ├── worker.js              # 배치 작업용 태스크 리스트 생성
│   │
│   ├── fonts/                 # 폰트 파일
│   │   ├── FG_Virgil.ttf     # Excalidraw 기본 손글씨 폰트
│   │   └── Cascadia.ttf      # 코드 스타일 폰트
│   │
│   └── renderer/              # 도형별 렌더러 모듈
│       ├── index.js          # 렌더러 메인 (캔버스 생성 및 조율)
│       ├── shapeUtils.js     # 기하학적 계산 유틸리티
│       ├── rectangle.js      # 사각형 렌더러
│       ├── ellipse.js        # 타원형 렌더러
│       ├── diamond.js        # 마름모 렌더러
│       ├── line.js           # 직선 렌더러
│       ├── arrow.js          # 화살표 렌더러
│       ├── text.js           # 텍스트 렌더러
│       └── draw.js           # 자유 그리기 렌더러
│
├── lib/                        # 컴파일된 JavaScript 출력 (빌드 생성)
│
├── test/                       # Jest 테스트
│   └── *.excalidraw           # 테스트용 Excalidraw 샘플 파일
│
├── .github/                    # GitHub 설정
│   ├── workflows/             # CI/CD 워크플로우
│   └── assets/                # README 이미지 등
│
├── Dockerfile                  # Alpine Linux 컨테이너화
├── package.json                # 프로젝트 메타데이터 및 의존성
├── tsconfig.json              # TypeScript 컴파일러 설정
└── README.md                   # 프로젝트 문서
```

---

## 디렉토리별 상세 설명

### `/bin` - CLI 진입점

| 파일 | 설명 |
|------|------|
| `run` | Node.js CLI 실행 스크립트. `#!/usr/bin/env node`로 시작하며 oclif 프레임워크를 초기화합니다. |

`package.json`의 `bin` 필드에서 `excalidraw-cli` 명령을 이 파일에 매핑합니다.

---

### `/src` - 소스 코드

#### 핵심 파일

| 파일 | 역할 | 설명 |
|------|------|------|
| `index.ts` | CLI 명령 정의 | oclif `Command` 클래스를 상속하여 CLI 인터페이스 정의. 플래그(`-v`, `-h`, `-q`)와 인자(`input`, `output`) 설정 |
| `compute.js` | 입력 처리 | 사용자 입력을 분석하고 파일/디렉토리 경로를 확인. 변환 태스크를 생성하고 캔버스를 파일로 저장 |
| `worker.js` | 태스크 관리 | Listr 라이브러리를 사용하여 배치 처리용 태스크 리스트 생성. 병렬 실행 및 진행 상황 표시 담당 |
| `compute.spec.ts` | 유닛 테스트 | compute.js의 기능을 검증하는 Jest 테스트 파일 |

---

### `/src/fonts` - 폰트 리소스

| 파일 | 용도 |
|------|------|
| `FG_Virgil.ttf` | Excalidraw의 기본 손글씨 스타일 폰트. 텍스트 요소의 "Hand-drawn" 느낌을 재현 |
| `Cascadia.ttf` | 코드/터미널 스타일 폰트. 코드 블록이나 모노스페이스 텍스트에 사용 |

폰트는 `node-canvas`의 `registerFont()` API를 통해 런타임에 등록됩니다.

---

### `/src/renderer` - 렌더링 모듈

렌더러는 모듈화된 구조로 각 도형 타입별로 독립적인 렌더링 로직을 구현합니다.

#### 핵심 모듈

| 파일 | 담당 도형 | 설명 |
|------|-----------|------|
| `index.js` | 전체 조율 | 캔버스 생성, 폰트 등록, 배경 설정, 각 요소별 렌더러 호출 |
| `shapeUtils.js` | 기하학 계산 | 회전 변환(`rotate`), 중심점 계산(`getCentroidFromRegularShape`) 등 공통 유틸리티 |

#### 도형 렌더러

| 파일 | 도형 | Excalidraw 타입 |
|------|------|-----------------|
| `rectangle.js` | 사각형 | `type: 'rectangle'` |
| `ellipse.js` | 타원 | `type: 'ellipse'` |
| `diamond.js` | 마름모 | `type: 'diamond'` |
| `line.js` | 직선 | `type: 'line'` |
| `arrow.js` | 화살표 | `type: 'arrow'` |
| `text.js` | 텍스트 | `type: 'text'` |
| `draw.js` | 자유 그리기 | `type: 'draw'` |

#### 렌더링 흐름

```
1. convertExcalidrawToCanvas (index.js)
   ├── 캔버스 크기 계산 (getDimensionsFromExcalidraw)
   ├── 폰트 등록 (Virgil, Cascadia)
   ├── 배경 렌더링
   └── 요소 순회
       ├── 스트로크 스타일 설정 (solid/dashed/dotted)
       └── 타입별 렌더러 호출
           ├── renderRectangle()
           ├── renderEllipse()
           ├── renderDiamond()
           ├── renderLine()
           ├── renderArrow()
           ├── renderText()
           └── renderDraw()
```

---

### `/lib` - 빌드 출력

TypeScript 컴파일러(`tsc`)에 의해 생성되는 CommonJS JavaScript 파일들이 위치합니다.

- `npm run prepack` 명령으로 생성
- `/src` 구조를 그대로 미러링
- `/src/fonts`는 `cpy-cli`를 통해 복사

---

### `/test` - 테스트

| 구성 요소 | 설명 |
|-----------|------|
| `*.excalidraw` | 테스트용 Excalidraw 샘플 파일. 다양한 도형 조합 포함 |
| Jest 설정 | `package.json`의 `jest` 필드에서 `.spec.js` 파일을 테스트로 인식 |

테스트 실행: `npm run test` (prepack 후 Jest 실행)

---

### `/.github` - CI/CD

| 경로 | 설명 |
|------|------|
| `workflows/` | GitHub Actions 워크플로우 정의 파일 |
| `assets/` | README에 사용되는 데모 GIF 등 정적 자산 |

---

### 루트 파일

| 파일 | 역할 |
|------|------|
| `package.json` | npm 패키지 메타데이터, 의존성, 스크립트 정의 |
| `tsconfig.json` | TypeScript 컴파일러 설정 (ES2017 타겟, CommonJS 모듈) |
| `Dockerfile` | Alpine Linux 기반 Docker 이미지 정의 |
| `README.md` | 프로젝트 설명, 설치 및 사용법 문서 |

---

## 모듈 의존성 다이어그램

```
┌─────────────────────────────────────────────────────────────────┐
│                          bin/run                                │
│                      (CLI Entry Point)                          │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       src/index.ts                              │
│              (oclif Command Definition)                         │
│         - flags: version, help, quiet                           │
│         - args: input, output                                   │
└─────────────────────────────┬───────────────────────────────────┘
                              │ computeUserInputs()
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      src/compute.js                             │
│              (Input Processing & Task Dispatch)                 │
│         - Path validation                                       │
│         - File discovery                                        │
│         - Canvas to file saving                                 │
└────────────────────────┬────────────────────┬───────────────────┘
                         │                    │
                         ▼                    ▼
┌────────────────────────────────┐  ┌─────────────────────────────┐
│       src/worker.js            │  │   src/renderer/index.js     │
│    (Task List Creation)        │  │   (Canvas Generation)       │
│  - Listr task management       │  │  - Dimension calculation    │
│  - Progress display            │  │  - Font registration        │
│  - Batch processing            │  │  - Element iteration        │
└────────────────────────────────┘  └──────────────┬──────────────┘
                                                   │
                              ┌────────────────────┼────────────────────┐
                              │                    │                    │
                              ▼                    ▼                    ▼
                    ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
                    │   rectangle.js   │  │   ellipse.js     │  │   diamond.js     │
                    │   line.js        │  │   arrow.js       │  │   text.js        │
                    │   draw.js        │  │   shapeUtils.js  │  │                  │
                    └──────────────────┘  └──────────────────┘  └──────────────────┘
                              │                    │                    │
                              └────────────────────┼────────────────────┘
                                                   │
                                                   ▼
                    ┌─────────────────────────────────────────────────────────────┐
                    │                    External Libraries                       │
                    │  - canvas (node-canvas): 캔버스 생성 및 이미지 출력         │
                    │  - roughjs: 손그림 스타일 렌더링                            │
                    └─────────────────────────────────────────────────────────────┘
```

---

## 핵심 파일 위치 요약

| 기능 | 파일 경로 |
|------|-----------|
| CLI 명령 정의 | `/src/index.ts` |
| 입력 처리 로직 | `/src/compute.js` |
| 배치 태스크 관리 | `/src/worker.js` |
| 캔버스 생성 | `/src/renderer/index.js` |
| 사각형 렌더링 | `/src/renderer/rectangle.js` |
| 타원 렌더링 | `/src/renderer/ellipse.js` |
| 텍스트 렌더링 | `/src/renderer/text.js` |
| 기하학 유틸리티 | `/src/renderer/shapeUtils.js` |
| 폰트 파일 | `/src/fonts/*.ttf` |
| 테스트 | `/src/compute.spec.ts`, `/test/` |
| Docker 설정 | `/Dockerfile` |
| CI/CD | `/.github/workflows/` |

---

*마지막 업데이트: 2026-01-26*
