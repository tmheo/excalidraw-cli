# Local Development Instructions

Project-specific development instructions for excalidraw-cli.

## Project Background

- **Original**: [tommywalkie/excalidraw-cli](https://github.com/tommywalkie/excalidraw-cli)
- **Fork**: [tmheo/excalidraw-cli](https://github.com/tmheo/excalidraw-cli)
- **Fork 목적**: 원본 프로젝트가 오래되어 라이브러리 버전 문제 발생. 최신 버전으로 의존성 업데이트 진행.

## User Preferences

- **Language**: Korean (한국어)
- **Code Comments**: English

## Development Environment

- **Node.js**: v24.12.0 (managed by fnm)
- **npm**: v11.6.2
- **TypeScript LSP**: typescript-language-server (installed)
- **Package Manager**: fnm (Fast Node Manager)

### fnm Configuration

**IMPORTANT**: All npm/node commands must be run with fnm environment activated:

```bash
# Activate fnm environment before any npm/node command
eval "$(fnm env)"

# Then run npm commands
npm test
npm run prepack
```

**For Claude Code**: Always prefix npm/node commands with fnm activation:
```bash
eval "$(fnm env)" && npm test
eval "$(fnm env)" && npm run prepack
```

## Implementation Status

### SPEC-UPDATE-001 Completed
- ✅ Phase 1: Foundation (TypeScript 5.7.x, Jest 29, Node 18+)
- ✅ Phase 2: Rendering (canvas v3.0.0, roughjs v4.6.6, listr2 v10.0.0)
- ✅ Phase 3: CLI Core (oclif v4)

### Version Decisions
- **roughjs**: Using v4.6.6 instead of v5.x
  - Reason: v5.x compatibility issues with rc.generator internal API
  - Strategy: Migrated to public API (rc.curve, rc.line) instead
  - Status: Public API migration completed

### Test Coverage
- New test files: cli.spec.ts, renderer.spec.ts, worker.spec.ts
- Coverage target: 85% (TRUST 5 framework)

## Quick Commands

```bash
# Build project
npm run prepack

# Run tests
npm test

# Run CLI locally
./bin/run <input.excalidraw> <output.png>
```

## MoAI Workflow

```bash
# Step 1: Create SPEC
/moai:1-plan "feature description"

# Step 2: Implement with DDD
/moai:2-run SPEC-XXX

# Step 3: Sync and PR
/moai:3-sync SPEC-XXX
```

## Notes

- Canvas native dependencies required (cairo, pango)
- Docker available for containerized builds

## PR 코드 리뷰 자동화

PR에 대해 CodeRabbit 리뷰를 확인하거나 처리해달라는 요청이 오면, 반드시 `review-coderabbit` 스킬을 사용해야 합니다.

### 트리거 키워드

다음 키워드가 포함된 요청 시 자동으로 `Skill("review-coderabbit")` 호출:

- "CodeRabbit 리뷰 확인"
- "코드래빗 리뷰"
- "PR 리뷰 코멘트 처리"
- "코드래빗 피드백"
- "리뷰 코멘트 수정"
- "coderabbit review"

### 사용 예시

```
사용자: PR 11에 대해 코드래빗이 리뷰해줬으니 확인해줘
Claude: Skill("review-coderabbit") 호출 → PR 11 리뷰 처리
```

### 주의사항

- `review-coderabbit` 스킬은 사용자 레벨 스킬 (`~/.claude/skills/review-coderabbit/SKILL.md`)
- 프로젝트 스킬 목록에 없더라도 반드시 Skill 도구로 호출 가능
- gh CLI 인증이 필요함

