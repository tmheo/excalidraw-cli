# excalidraw-cli 제품 개요

## 프로젝트 소개

**excalidraw-cli**는 Excalidraw JSON 스키마 파일(`.excalidraw`)을 PNG 이미지(`.png`)로 변환하는 실험적 명령줄 도구입니다. 이 프로젝트는 [excalidraw#1261](https://github.com/excalidraw/excalidraw/issues/1261) 이슈의 후속 작업으로, 웹 기반 드로잉 도구인 Excalidraw의 CLI 인터페이스를 제공하는 것을 목표로 합니다.

| 항목 | 내용 |
|------|------|
| **프로젝트명** | excalidraw-cli |
| **버전** | 0.5.0 |
| **작성자** | Tom Bazarnik (tommywalkie@gmail.com) |
| **라이선스** | MIT |
| **저장소** | https://github.com/tommywalkie/excalidraw-cli |

---

## 타겟 사용자

### 1. 개발자

- Excalidraw로 작성한 다이어그램을 자동으로 이미지로 변환하려는 개발자
- 문서 생성 자동화 워크플로우를 구축하려는 개발자
- Node.js 기반 프로젝트에서 다이어그램 렌더링이 필요한 개발자

### 2. 디자이너

- Excalidraw 파일을 배치 처리하여 이미지로 내보내려는 디자이너
- 디자인 에셋을 프로그래밍 방식으로 관리하려는 디자이너
- 손그림 스타일의 다이어그램을 대량 생성해야 하는 디자이너

### 3. CI/CD 파이프라인

- GitHub Actions, Jenkins 등에서 문서 자동 빌드 시 다이어그램 변환이 필요한 파이프라인
- Docker 컨테이너 환경에서 문서 생성을 자동화하는 파이프라인
- 정적 사이트 생성기와 통합하여 다이어그램을 자동으로 렌더링하는 파이프라인

### 4. 기술 문서 작성자

- 아키텍처 다이어그램, 플로우차트를 문서에 포함해야 하는 테크니컬 라이터
- Markdown 기반 문서 시스템에서 Excalidraw 다이어그램을 활용하려는 작성자

---

## 핵심 기능

### 도형 렌더링 지원

| 도형 타입 | 설명 |
|-----------|------|
| Rectangle | 사각형 도형 렌더링 |
| Ellipse | 타원형 도형 렌더링 |
| Diamond | 마름모 도형 렌더링 |
| Line | 직선 렌더링 |
| Arrow | 화살표 렌더링 |
| Text | 텍스트 요소 렌더링 |
| Draw | 자유 그리기(손그림) 렌더링 |

### 스타일 지원

- **스트로크 스타일**: Solid(실선), Dashed(점선), Dotted(점점선)
- **회전 지원**: 복잡한 기하학적 변환을 통한 회전된 도형 렌더링
- **배경색 지원**: 도형 내부 채우기 색상 지원
- **손그림 스타일**: Rough.js를 활용한 Excalidraw 특유의 손그림 효과

### 폰트 지원

| 폰트 이름 | 용도 |
|-----------|------|
| Virgil (FG_Virgil) | Excalidraw 기본 손글씨 스타일 폰트 |
| Cascadia | 코드/터미널 스타일 폰트 |
| Arial | 시스템 기본 산세리프 폰트 |

### 배치 처리

- 단일 파일 변환: `excalidraw-cli input.excalidraw output.png`
- 디렉토리 전체 변환: `excalidraw-cli ./drawings/ ./output/`
- 재귀 디렉토리 탐색으로 모든 `.excalidraw` 파일 자동 탐지
- Listr를 활용한 병렬 태스크 실행 및 진행 상황 표시

### Docker 지원

- Alpine Linux 기반 경량 컨테이너 이미지
- 모든 네이티브 의존성(cairo, pango 등) 사전 설치
- CI/CD 파이프라인 통합 용이

---

## 장점

### 1. 브라우저 독립성

Excalidraw 웹 앱 없이 Node.js 환경에서 직접 렌더링이 가능합니다. `node-canvas`를 사용하여 브라우저의 `window` 컨텍스트 없이도 캔버스 기반 렌더링을 수행합니다.

### 2. 자동화 친화적

명령줄 인터페이스를 통해 스크립트, CI/CD 파이프라인, 자동화 도구와 쉽게 통합할 수 있습니다.

### 3. 일관된 출력

Rough.js API를 활용하여 Excalidraw의 손그림 스타일을 최대한 유사하게 재현합니다.

### 4. 크로스 플랫폼

Node.js가 지원되는 모든 플랫폼(Windows, macOS, Linux)에서 실행 가능합니다.

---

## 사용 사례

### 사용 사례 1: 문서 자동화

기술 문서에 포함될 아키텍처 다이어그램을 Excalidraw로 작성하고, 빌드 과정에서 자동으로 PNG로 변환합니다.

```bash
# 문서 빌드 스크립트 예시
excalidraw-cli ./docs/diagrams/ ./docs/images/
mkdocs build
```

### 사용 사례 2: CI/CD 통합

GitHub Actions 워크플로우에서 다이어그램 파일이 변경될 때마다 자동으로 이미지를 재생성합니다.

```yaml
- name: Convert Excalidraw to PNG
  run: |
    docker run --rm -v $PWD:/data excalidraw-cli /data/diagrams /data/images
```

### 사용 사례 3: 배치 변환

프로젝트의 모든 Excalidraw 파일을 한 번에 PNG로 변환합니다.

```bash
# 현재 디렉토리의 모든 .excalidraw 파일 변환
excalidraw-cli . ./output/
```

### 사용 사례 4: 정적 사이트 생성

Gatsby, Hugo, Jekyll 등의 정적 사이트 생성기와 함께 사용하여 빌드 시점에 다이어그램을 자동으로 이미지로 변환합니다.

---

## 제한 사항

### 현재 제한 사항

1. **실험적 상태**: 이 프로젝트는 실험적 단계로, 일부 Excalidraw 기능이 완벽하게 지원되지 않을 수 있습니다.
2. **렌더링 차이**: 자체 렌더러를 사용하므로 Excalidraw 웹 앱의 출력과 미세한 차이가 있을 수 있습니다.
3. **네이티브 의존성**: `node-canvas`가 libcairo에 의존하므로 시스템에 네이티브 라이브러리 설치가 필요합니다.

### 향후 계획

Excalidraw가 Node 호환 API를 제공하면 직접 Excalidraw 렌더러 메서드를 사용하여 일관된 결과를 제공할 계획입니다. 관련 이슈: [excalidraw#1780](https://github.com/excalidraw/excalidraw/issues/1780)

---

## 빠른 시작

### 설치

```bash
npm install -g @tommywalkie/excalidraw-cli
```

### 기본 사용법

```bash
# 단일 파일 변환
excalidraw-cli drawing.excalidraw output.png

# 디렉토리 전체 변환
excalidraw-cli ./diagrams/ ./images/

# 도움말 확인
excalidraw-cli --help
```

### Docker 사용

```bash
# Docker 이미지 빌드
docker build -t excalidraw-cli .

# 변환 실행
docker run --rm -v $PWD:/data excalidraw-cli /data/input.excalidraw /data/output.png
```

---

*마지막 업데이트: 2026-01-26*
