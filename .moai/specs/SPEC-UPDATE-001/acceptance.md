# SPEC-UPDATE-001: 수용 기준

## 메타데이터

| 항목 | 값 |
|------|-----|
| **SPEC ID** | SPEC-UPDATE-001 |
| **관련 문서** | [spec.md](./spec.md), [plan.md](./plan.md) |
| **생성일** | 2026-01-26 |
| **테스트 형식** | Gherkin (Given-When-Then) |

---

## 1. 품질 게이트 기준

### 1.1 TRUST 5 Framework 적용

| Pillar | 기준 | 검증 방법 |
|--------|------|-----------|
| **Tested** | 테스트 커버리지 80% 이상 | `npm test -- --coverage` |
| **Readable** | ESLint 경고 0개 | `npm run lint` (추가 필요시) |
| **Unified** | 일관된 코드 스타일 | Prettier/EditorConfig 적용 |
| **Secured** | npm audit high/critical 0개 | `npm audit` |
| **Trackable** | 의미 있는 커밋 메시지 | Git history 검토 |

### 1.2 Definition of Done

- [ ] 모든 테스트 케이스 통과
- [ ] 빌드 성공 (`npm run prepack`)
- [ ] Docker 빌드 성공
- [ ] 보안 취약점 0개 (high/critical)
- [ ] 문서 업데이트 완료 (README, CHANGELOG)
- [ ] 코드 리뷰 완료

---

## 2. Phase 1 수용 기준

### AC-1.1: Node.js 엔진 요구사항

```gherkin
Feature: Node.js 18+ 환경 지원

  Scenario: Node.js 18에서 정상 실행
    Given Node.js 18.x가 설치된 환경
    And excalidraw-cli가 설치됨
    When excalidraw-cli --version을 실행하면
    Then 버전 정보가 정상적으로 출력됨
    And 종료 코드가 0임

  Scenario: Node.js 20에서 정상 실행
    Given Node.js 20.x가 설치된 환경
    And excalidraw-cli가 설치됨
    When excalidraw-cli --help를 실행하면
    Then 도움말이 정상적으로 출력됨
    And 종료 코드가 0임

  Scenario: Node.js 8에서 설치 차단
    Given Node.js 8.x가 설치된 환경
    When npm install을 실행하면
    Then 엔진 요구사항 불충족 오류가 발생함
```

### AC-1.2: TypeScript 5.x 컴파일

```gherkin
Feature: TypeScript 5.x 컴파일 성공

  Scenario: TypeScript 컴파일 성공
    Given TypeScript 5.7.x가 설치됨
    And 프로젝트 소스 코드가 준비됨
    When npm run prepack을 실행하면
    Then lib/ 디렉토리에 컴파일된 JavaScript 파일이 생성됨
    And 컴파일 오류가 0개임
    And lib/fonts/ 디렉토리에 폰트 파일이 복사됨

  Scenario: 타입 정의 파일 생성
    Given TypeScript 컴파일이 완료됨
    When lib/index.d.ts 파일을 확인하면
    Then 타입 정의 파일이 존재함
    And 올바른 타입이 export됨
```

### AC-1.3: Jest 29 테스트

```gherkin
Feature: Jest 29 테스트 실행

  Scenario: 기존 테스트 모두 통과
    Given Jest 29.x가 설치됨
    And 기존 테스트 파일이 존재함
    When npm test를 실행하면
    Then 모든 테스트가 통과함
    And 테스트 커버리지가 출력됨

  Scenario: compute.spec.ts 테스트 통과
    Given Jest 29.x가 설치됨
    When compute.spec.ts 테스트를 실행하면
    Then 모든 assertion이 통과함
    And 테스트 실행 시간이 30초 이내임
```

### AC-1.4: 보안 취약점 검사

```gherkin
Feature: 보안 취약점 제거

  Scenario: npm audit 통과
    Given Phase 1 의존성 업데이트가 완료됨
    When npm audit을 실행하면
    Then high 취약점이 0개임
    And critical 취약점이 0개임
```

---

## 3. Phase 2 수용 기준

### AC-2.1: canvas v3 렌더링

```gherkin
Feature: canvas v3 렌더링 기능

  Scenario: 캔버스 생성
    Given canvas v3가 설치됨
    And 유효한 Excalidraw JSON 파일이 준비됨
    When 캔버스를 생성하면
    Then 지정된 크기의 캔버스가 생성됨
    And 2D 컨텍스트를 정상적으로 획득함

  Scenario: 폰트 등록
    Given canvas v3가 설치됨
    And FG_Virgil.ttf, Cascadia.ttf 폰트 파일이 존재함
    When 폰트를 등록하면
    Then 폰트가 정상적으로 등록됨
    And 텍스트 렌더링에 사용 가능함

  Scenario: PNG 이미지 출력
    Given 렌더링이 완료된 캔버스가 있음
    When PNG 버퍼를 생성하면
    Then 유효한 PNG 이미지 데이터가 반환됨
    And 파일로 저장 가능함
```

### AC-2.2: roughjs v5 도형 렌더링

```gherkin
Feature: roughjs v5 도형 렌더링

  Scenario: 사각형 렌더링
    Given roughjs v5가 설치됨
    And type이 'rectangle'인 요소가 있음
    When 사각형을 렌더링하면
    Then 손그림 스타일의 사각형이 캔버스에 그려짐
    And 스트로크 색상이 올바르게 적용됨

  Scenario: 타원 렌더링
    Given roughjs v5가 설치됨
    And type이 'ellipse'인 요소가 있음
    When 타원을 렌더링하면
    Then 손그림 스타일의 타원이 캔버스에 그려짐

  Scenario: 화살표 렌더링 (리팩토링된 코드)
    Given roughjs v5가 설치됨
    And type이 'arrow'인 요소가 있음
    And rc.generator 내부 API가 제거됨
    When 화살표를 렌더링하면
    Then 손그림 스타일의 화살표가 캔버스에 그려짐
    And 화살표 머리가 올바른 방향을 가리킴

  Scenario: 마름모 렌더링
    Given roughjs v5가 설치됨
    And type이 'diamond'인 요소가 있음
    When 마름모를 렌더링하면
    Then 손그림 스타일의 마름모가 캔버스에 그려짐

  Scenario: 직선 렌더링
    Given roughjs v5가 설치됨
    And type이 'line'인 요소가 있음
    When 직선을 렌더링하면
    Then 손그림 스타일의 직선이 캔버스에 그려짐

  Scenario: 텍스트 렌더링
    Given roughjs v5가 설치됨
    And type이 'text'인 요소가 있음
    When 텍스트를 렌더링하면
    Then Virgil 폰트로 텍스트가 캔버스에 그려짐

  Scenario: 자유 그리기 렌더링
    Given roughjs v5가 설치됨
    And type이 'draw'인 요소가 있음
    When 자유 그리기를 렌더링하면
    Then 손그림 스타일의 경로가 캔버스에 그려짐
```

### AC-2.3: 시각적 회귀 테스트

```gherkin
Feature: 시각적 회귀 방지

  Scenario: 기준 이미지와 비교
    Given 업그레이드 전 생성된 기준 PNG 이미지가 있음
    And 업그레이드 후 동일한 입력으로 생성된 PNG 이미지가 있음
    When 두 이미지를 픽셀 단위로 비교하면
    Then 차이가 허용 범위(5%) 이내임
    Or 차이가 의도된 개선인 경우 문서화됨

  Scenario: 복합 도형 렌더링 일관성
    Given 여러 도형이 포함된 test/sample.excalidraw 파일이 있음
    When 렌더링을 실행하면
    Then 모든 도형이 올바른 위치에 렌더링됨
    And 회전된 도형이 올바른 각도로 렌더링됨
    And 채우기 색상이 올바르게 적용됨
```

### AC-2.4: listr2 배치 처리

```gherkin
Feature: listr2 배치 처리

  Scenario: 디렉토리 배치 변환
    Given listr2 v8이 설치됨
    And 여러 .excalidraw 파일이 있는 디렉토리가 있음
    When excalidraw-cli ./input/ ./output/을 실행하면
    Then 모든 파일이 PNG로 변환됨
    And 진행률이 터미널에 표시됨
    And 모든 태스크가 성공적으로 완료됨

  Scenario: 병렬 처리 성능
    Given 10개의 .excalidraw 파일이 있음
    When 배치 변환을 실행하면
    Then 병렬 처리가 적용됨
    And 총 처리 시간이 순차 처리보다 빠름
```

### AC-2.5: Docker 빌드

```gherkin
Feature: Docker Alpine 빌드

  Scenario: Docker 이미지 빌드 성공
    Given 업데이트된 Dockerfile이 준비됨
    When docker build -t excalidraw-cli .을 실행하면
    Then 빌드가 성공적으로 완료됨
    And 이미지 크기가 500MB 이하임

  Scenario: Docker 컨테이너 내 실행
    Given excalidraw-cli Docker 이미지가 빌드됨
    And 호스트에 test.excalidraw 파일이 있음
    When docker run --rm -v $PWD:/data excalidraw-cli /data/test.excalidraw /data/output.png을 실행하면
    Then output.png 파일이 생성됨
    And 유효한 PNG 이미지임

  Scenario: Alpine 네이티브 의존성
    Given Docker Alpine 컨테이너 내부에서
    When canvas 네이티브 모듈을 로드하면
    Then 네이티브 바인딩이 정상적으로 로드됨
    And libcairo, libpango 등이 정상 동작함
```

---

## 4. Phase 3 수용 기준

### AC-3.1: oclif v4 CLI 인터페이스

```gherkin
Feature: oclif v4 CLI 인터페이스

  Scenario: 버전 플래그
    Given oclif v4 마이그레이션이 완료됨
    When excalidraw-cli --version을 실행하면
    Then 패키지 버전이 출력됨
    And 종료 코드가 0임

  Scenario: 도움말 플래그
    Given oclif v4 마이그레이션이 완료됨
    When excalidraw-cli --help를 실행하면
    Then 사용법이 출력됨
    And input, output 인자 설명이 포함됨
    And -v, -h, -q 플래그 설명이 포함됨

  Scenario: 단일 파일 변환 (하위 호환성)
    Given oclif v4 마이그레이션이 완료됨
    And test.excalidraw 파일이 존재함
    When excalidraw-cli test.excalidraw output.png을 실행하면
    Then output.png 파일이 생성됨
    And 종료 코드가 0임

  Scenario: 디렉토리 변환 (하위 호환성)
    Given oclif v4 마이그레이션이 완료됨
    And ./input/ 디렉토리에 .excalidraw 파일들이 있음
    When excalidraw-cli ./input/ ./output/을 실행하면
    Then ./output/ 디렉토리에 PNG 파일들이 생성됨
    And 종료 코드가 0임

  Scenario: quiet 모드
    Given oclif v4 마이그레이션이 완료됨
    When excalidraw-cli -q test.excalidraw output.png을 실행하면
    Then 표준 출력이 최소화됨
    And 파일이 정상적으로 생성됨
```

### AC-3.2: 기본값 동작

```gherkin
Feature: 기본값 처리

  Scenario: 입력 기본값 (현재 디렉토리)
    Given 현재 디렉토리에 .excalidraw 파일이 있음
    When excalidraw-cli을 인자 없이 실행하면
    Then 현재 디렉토리의 파일이 처리됨

  Scenario: 출력 기본값 (현재 디렉토리)
    Given test.excalidraw 파일이 있음
    When excalidraw-cli test.excalidraw을 실행하면
    Then 현재 디렉토리에 출력 파일이 생성됨
```

### AC-3.3: 오류 처리

```gherkin
Feature: 오류 처리

  Scenario: 존재하지 않는 입력 파일
    Given nonexistent.excalidraw 파일이 없음
    When excalidraw-cli nonexistent.excalidraw output.png을 실행하면
    Then 파일을 찾을 수 없다는 오류 메시지가 출력됨
    And 종료 코드가 0이 아님

  Scenario: 잘못된 형식의 입력 파일
    Given invalid.excalidraw 파일에 잘못된 JSON이 있음
    When excalidraw-cli invalid.excalidraw output.png을 실행하면
    Then JSON 파싱 오류 메시지가 출력됨
    And 종료 코드가 0이 아님

  Scenario: 쓰기 권한 없는 출력 경로
    Given /readonly/ 디렉토리에 쓰기 권한이 없음
    When excalidraw-cli test.excalidraw /readonly/output.png을 실행하면
    Then 권한 오류 메시지가 출력됨
    And 종료 코드가 0이 아님
```

---

## 5. 통합 테스트 시나리오

### AC-INT-001: End-to-End 워크플로우

```gherkin
Feature: 완전한 변환 워크플로우

  Scenario: 단일 파일 완전 변환
    Given 모든 업그레이드가 완료됨
    And 복잡한 요소가 포함된 complex.excalidraw 파일이 있음
        | 요소 타입 | 개수 |
        | rectangle | 3    |
        | ellipse   | 2    |
        | arrow     | 4    |
        | text      | 5    |
        | diamond   | 1    |
        | line      | 3    |
        | draw      | 2    |
    When excalidraw-cli complex.excalidraw output.png을 실행하면
    Then output.png 파일이 생성됨
    And 모든 요소가 올바르게 렌더링됨
    And 손그림 스타일이 유지됨
    And 파일 크기가 합리적임 (10MB 이하)

  Scenario: CI/CD 파이프라인 시뮬레이션
    Given Docker 이미지가 빌드됨
    And CI 환경이 시뮬레이션됨
    When 다음 명령을 순차적으로 실행하면
        | 명령                                                    |
        | docker build -t excalidraw-cli .                       |
        | docker run --rm excalidraw-cli --version               |
        | docker run --rm -v $PWD:/data excalidraw-cli /data/test.excalidraw /data/out.png |
    Then 모든 명령이 성공적으로 완료됨
    And out.png 파일이 생성됨
```

### AC-INT-002: 성능 기준

```gherkin
Feature: 성능 요구사항

  Scenario: 단일 파일 변환 성능
    Given 중간 복잡도의 .excalidraw 파일 (요소 20개)이 있음
    When 변환을 실행하면
    Then 5초 이내에 완료됨

  Scenario: 배치 변환 성능
    Given 10개의 .excalidraw 파일이 있음
    When 배치 변환을 실행하면
    Then 30초 이내에 완료됨

  Scenario: 메모리 사용량
    Given 대용량 .excalidraw 파일 (요소 100개)이 있음
    When 변환을 실행하면
    Then 메모리 사용량이 512MB를 초과하지 않음
```

---

## 6. 테스트 자동화 계획

### 6.1 유닛 테스트

| 테스트 대상 | 파일 | 테스트 내용 |
|-------------|------|-------------|
| compute.js | compute.spec.ts | 입력 처리, 경로 검증 |
| renderer/index.js | renderer.spec.ts | 캔버스 생성, 폰트 등록 |
| renderer/arrow.js | arrow.spec.ts | 화살표 렌더링 (리팩토링 후) |
| worker.js | worker.spec.ts | 태스크 리스트 생성 |

### 6.2 통합 테스트

| 테스트 시나리오 | 검증 내용 |
|-----------------|-----------|
| CLI E2E | 명령행 인터페이스 전체 흐름 |
| Docker | 컨테이너 빌드 및 실행 |
| 시각적 회귀 | 이미지 픽셀 비교 |

### 6.3 테스트 실행 명령

```bash
# 유닛 테스트
npm test

# 커버리지 포함
npm test -- --coverage

# 특정 테스트 파일
npm test -- compute.spec

# E2E 테스트 (별도 구성 필요)
npm run test:e2e

# Docker 테스트
npm run test:docker
```

### 6.4 CI 파이프라인 구성

```yaml
# .github/workflows/test.yml (예시)
name: Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [18.x, 20.x, 22.x]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}

      # Native dependencies for canvas
      - name: Install native dependencies
        run: |
          sudo apt-get update
          sudo apt-get install -y libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev

      - run: npm ci
      - run: npm run prepack
      - run: npm test
      - run: npm audit --audit-level=high

  docker:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Build Docker image
        run: docker build -t excalidraw-cli .
      - name: Test Docker image
        run: |
          docker run --rm excalidraw-cli --version
          docker run --rm -v $PWD/test:/data excalidraw-cli /data/sample.excalidraw /data/output.png
          test -f test/output.png
```

---

## 7. 검증 체크리스트

### Phase 1 완료 체크리스트

- [ ] Node.js 18, 20, 22에서 설치 및 실행 확인
- [ ] TypeScript 5.x 컴파일 성공
- [ ] Jest 29 테스트 전체 통과
- [ ] npm audit high/critical 0개
- [ ] 기존 CLI 동작 동일

### Phase 2 완료 체크리스트

- [ ] canvas v3 설치 및 빌드 성공
- [ ] 모든 도형 타입 렌더링 성공
- [ ] roughjs 내부 API 제거 완료
- [ ] listr2 배치 처리 동작 확인
- [ ] Docker Alpine 빌드 성공
- [ ] 시각적 회귀 테스트 통과

### Phase 3 완료 체크리스트

- [ ] oclif v4 마이그레이션 완료
- [ ] --version, --help 정상 동작
- [ ] 단일 파일 변환 동작
- [ ] 디렉토리 배치 변환 동작
- [ ] quiet 모드 동작
- [ ] 오류 처리 정상 동작
- [ ] Docker 컨테이너 내 실행 성공

### 최종 릴리즈 체크리스트

- [ ] 모든 Phase 체크리스트 완료
- [ ] README.md 업데이트
- [ ] CHANGELOG.md 작성
- [ ] 버전 번호 업데이트 (0.6.0 또는 1.0.0)
- [ ] npm publish 테스트 (dry-run)
- [ ] Docker Hub 이미지 업데이트 (해당시)

---

*마지막 업데이트: 2026-01-26*
*SPEC ID: SPEC-UPDATE-001*
