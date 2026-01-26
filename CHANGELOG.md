# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed
- **BREAKING:** Minimum Node.js version raised from 8.x to 18.x
- Upgraded TypeScript from 4.1.2 to 5.7.x
- Upgraded Jest from 27.0.4 to 29.x
- Upgraded oclif from v1 to v4 (@oclif/core ^4.x)
- Upgraded canvas from 2.6.1 to 3.0.0
- Upgraded listr2 from 3.2.3 to 10.0.0
- Unified task runner to use only listr2 (removed legacy listr dependency)
- Updated Dockerfile to use Node.js 18-alpine base image

### Added
- Comprehensive test suite:
  - `src/cli.spec.ts`: CLI integration tests with oclif v4 characterization
  - `src/renderer/renderer.spec.ts`: Renderer characterization tests for roughjs
  - `src/worker.spec.ts`: Worker task management tests for listr2

### Fixed
- Security vulnerabilities in outdated dependencies
- Docker build process for Alpine Linux with Node.js 18

### Technical
- Migrated from roughjs internal API (`rc.generator`) to public API (`rc.curve`, `rc.line`)
- Updated all type definitions to latest versions
- Improved TypeScript strict mode compatibility
- Refactored oclif command definition to v4 structure (async parse, object args)

### Note on roughjs Version

This release uses roughjs v4.6.6 instead of the originally planned v5.x due to:
- roughjs v5 compatibility issues with internal API usage
- Successful migration to roughjs public API (rc.curve, rc.line)
- Maintained rendering quality and functionality

The renderer has been refactored to avoid internal API dependencies, making future upgrades easier.

## [0.5.0] - Previous release

(Existing release information)
