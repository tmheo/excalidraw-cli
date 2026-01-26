# Local Development Instructions

Project-specific development instructions for excalidraw-cli.

## Project Background

- **Original**: https://github.com/tommywalkie/excalidraw-cli
- **Fork**: https://github.com/tmheo/excalidraw-cli
- **Fork 목적**: 원본 프로젝트가 오래되어 라이브러리 버전 문제 발생. 최신 버전으로 의존성 업데이트 진행.

## User Preferences

- **Language**: Korean (한국어)
- **Code Comments**: English

## Development Environment

- **Node.js**: Required for TypeScript LSP
- **TypeScript LSP**: typescript-language-server (installed)

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
