# Development Guide

Comprehensive developer onboarding guide for excalidraw-cli.

## Table of Contents

- [Setup](#setup)
- [Project Structure](#project-structure)
- [Technology Stack](#technology-stack)
- [Development Workflow](#development-workflow)
- [Testing Strategy](#testing-strategy)
- [Docker Development](#docker-development)
- [Troubleshooting](#troubleshooting)
- [Code Style](#code-style)

---

## Setup

### Prerequisites

- **Node.js**: 18.0.0 or higher
- **npm** or **yarn**: Package manager
- **TypeScript**: 5.7.x (installed via devDependencies)

### Native Dependencies

The project requires [node-canvas](https://github.com/Automattic/node-canvas) which needs native libraries:

#### macOS
```bash
brew install pkg-config cairo pango libpng jpeg giflib librsvg
```

#### Ubuntu/Debian
```bash
sudo apt-get install build-essential libcairo2-dev libpango1.0-dev \
  libjpeg-dev libgif-dev librsvg2-dev
```

#### Alpine Linux
```bash
apk add --no-cache python3 g++ build-base cairo-dev jpeg-dev pango-dev \
  musl-dev giflib-dev pixman-dev pangomm-dev libjpeg-turbo-dev freetype-dev
```

#### Windows
See [node-canvas Windows installation guide](https://github.com/Automattic/node-canvas#compiling)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/tmheo/excalidraw-cli.git
cd excalidraw-cli
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Build the project:
```bash
npm run prepack
```

4. Verify installation:
```bash
./bin/run --help
```

---

## Project Structure

```
excalidraw-cli/
├── src/                    # TypeScript source code
│   ├── index.ts           # oclif v4 Command entry point
│   ├── compute.js         # Input file/directory processing
│   ├── worker.js          # listr2 task management
│   ├── cli.spec.ts        # CLI integration tests
│   ├── worker.spec.ts     # Worker task tests
│   ├── fonts/             # Embedded fonts (Virgil, Cascadia)
│   └── renderer/          # Canvas rendering logic
│       ├── index.js       # Canvas initialization
│       ├── arrow.js       # Arrow shape rendering
│       ├── line.js        # Line rendering
│       ├── rectangle.js   # Rectangle rendering
│       ├── diamond.js     # Diamond shape rendering
│       ├── ellipse.js     # Ellipse rendering
│       ├── text.js        # Text rendering
│       └── renderer.spec.ts  # Renderer characterization tests
├── lib/                   # Compiled JavaScript (generated)
├── bin/                   # CLI executable
│   └── run               # Entry script
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript configuration
├── Dockerfile            # Docker build configuration
└── .moai/                # MoAI-ADK workflow files
    └── specs/SPEC-UPDATE-001/  # Dependency update specification
```

---

## Technology Stack

### Core Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| **@oclif/core** | ^4.x | Modern CLI framework (v4) |
| **canvas** | ^3.0.0 | Node.js canvas implementation |
| **roughjs** | ^4.6.6 | Hand-drawn style rendering |
| **listr2** | ^10.0.0 | Task progress visualization |
| **chalk** | ^4.0.0 | Terminal color styling |
| **rxjs** | ^7.0.0 | Reactive extensions (listr2 peer) |

### Development Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| **TypeScript** | ^5.7.0 | Type-safe development |
| **Jest** | ^29.0.0 | Testing framework |
| **@types/jest** | ^29.0.0 | Jest type definitions |
| **rimraf** | ^3.0.2 | Cross-platform file cleanup |
| **cpy-cli** | ^6.0.0 | File copying utility |

### Key Technical Decisions

#### roughjs v4.6.6 instead of v5.x

**Reason**: roughjs v5.x has compatibility issues with the internal `rc.generator` API that was used in earlier versions.

**Solution**: Migrated to roughjs public API (`rc.curve`, `rc.line`) in v4.6.6, avoiding internal API dependencies.

**Impact**: Maintains rendering quality while enabling easier future upgrades.

---

## Development Workflow

### Build Process

The build process transpiles TypeScript to CommonJS and copies font files:

```bash
npm run prepack
```

**Output**: Compiled JavaScript in `lib/` directory

### Running Locally

Test the CLI with transpiled code:

```bash
# Direct execution
node ./bin/run <input.excalidraw> <output.png>

# Using npm script
npm run excalidraw-cli <input.excalidraw> <output.png>
```

### Development Cycle

1. **Edit TypeScript source** in `src/`
2. **Rebuild** with `npm run prepack`
3. **Test changes** with `./bin/run`
4. **Run tests** with `npm test`

### Code Generation

TypeScript compiler generates:
- JavaScript files in `lib/`
- Type declaration files (`.d.ts`)
- Source maps for debugging

---

## Testing Strategy

### Test Files

The project includes three comprehensive test suites:

#### 1. CLI Integration Tests (`src/cli.spec.ts`)

**Purpose**: Characterization tests for oclif v4 command behavior

**Tests**:
- Command initialization and setup
- Argument and flag parsing
- CLI interface contracts
- Help and version output

**Run**: `npm test -- cli.spec`

#### 2. Renderer Tests (`src/renderer/renderer.spec.ts`)

**Purpose**: Characterization tests for roughjs rendering behavior

**Tests**:
- Canvas initialization
- Shape rendering (arrow, line, rectangle, diamond, ellipse)
- roughjs public API usage (`rc.curve`, `rc.line`)
- Text rendering with embedded fonts

**Run**: `npm test -- renderer.spec`

#### 3. Worker Task Tests (`src/worker.spec.ts`)

**Purpose**: Characterization tests for listr2 task management

**Tests**:
- Task creation and execution
- Progress reporting
- Error handling in task runners
- Batch file processing

**Run**: `npm test -- worker.spec`

### Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test -- <test-name>.spec

# Run tests in watch mode (requires --watch flag)
npm test -- --watch
```

### Test Coverage Goals

Target: **85%** coverage (TRUST 5 framework)

Current focus:
- Behavior preservation (characterization tests)
- Critical path coverage
- Error handling validation

---

## Docker Development

### Building Docker Image

Build the Docker image with all native dependencies:

```bash
docker build -t excalidraw-cli .
```

**Base Image**: `node:18-alpine`

**Installed Dependencies**:
- Python 3 (for native builds)
- Cairo, Pango, JPEG, GIF libraries
- Build tools (gcc, g++, make)

### Using Docker Image

Add this function to `.bashrc` or `.zshrc`:

```bash
function excalidraw-cli {
  docker run --rm -it -v $PWD:/data excalidraw-cli $@
}
```

Then use as normal CLI:

```bash
excalidraw-cli drawings/my-drawing.excalidraw .
```

### Docker Development Workflow

1. **Build image**: `docker build -t excalidraw-cli .`
2. **Test in container**: `docker run --rm excalidraw-cli --help`
3. **Process files**: Mount volume with `-v $PWD:/data`

### Debugging Docker Build

If Docker build fails:

```bash
# Build with verbose output
docker build --progress=plain -t excalidraw-cli .

# Interactive debug
docker run -it --entrypoint /bin/sh node:18-alpine
```

---

## Troubleshooting

### Common Errors

#### Native Dependency Build Failures

**Error**: `node-pre-gyp install --fallback-to-build`

**Solution**:
1. Install native dependencies (see [Setup](#native-dependencies))
2. Ensure Node.js version >= 18.0.0
3. Check compiler toolchain (gcc, g++, make)

#### TypeScript Compilation Errors

**Error**: `error TS2304: Cannot find name 'X'`

**Solution**:
1. Install missing type definitions: `npm install --save-dev @types/X`
2. Check `tsconfig.json` includes paths
3. Rebuild: `npm run prepack`

#### oclif Command Not Found

**Error**: `Command not found: excalidraw-cli`

**Solution**:
1. Verify `npm install` completed successfully
2. Check `./bin/run` has execute permissions
3. Use direct path: `./bin/run` instead of `excalidraw-cli`

#### Canvas Rendering Issues

**Error**: Canvas output differs from Excalidraw

**Solution**:
- This is expected - excalidraw-cli uses a home-made renderer that mimics Excalidraw
- Renderer tests (`renderer.spec.ts`) validate behavior preservation
- Report significant differences as issues

#### Docker Build Hangs

**Error**: Build stalls during native compilation

**Solution**:
1. Increase Docker memory allocation (Preferences → Resources)
2. Use `--network=host` flag for faster package downloads
3. Check Alpine package repository availability

---

## Code Style

### TypeScript Conventions

- **Type Safety**: Prefer explicit types over `any`
- **Async/Await**: Use modern async patterns
- **Imports**: Use ES6 import syntax
- **Exports**: Prefer named exports for clarity

### oclif v4 Patterns

```typescript
import { Command, Args, Flags } from '@oclif/core'

export default class ExcalidrawCli extends Command {
  static flags = {
    version: Flags.version({ char: 'v' }),
    help: Flags.help({ char: 'h' }),
    quiet: Flags.boolean({ char: 'q' })
  }

  static args = {
    input: Args.string({ default: '{cwd}' }),
    output: Args.string({ default: '{cwd}' })
  }

  async run() {
    const { args, flags } = await this.parse(ExcalidrawCli)
    // Implementation
  }
}
```

### Rendering Code Guidelines

- **Use public API only**: Avoid `rc.generator` and internal APIs
- **Canvas best practices**: Clean up resources with `canvas.dispose()`
- **Font handling**: Use embedded fonts from `src/fonts/`

### Testing Best Practices

- **Characterization tests**: Capture existing behavior before refactoring
- **Descriptive names**: Test names explain what is being tested
- **Isolated tests**: Each test should be independent
- **Mock external dependencies**: Avoid file system side effects where possible

---

## Additional Resources

- [oclif v4 Documentation](https://oclif.io/)
- [node-canvas API](https://github.com/Automattic/node-canvas)
- [roughjs Documentation](https://roughjs.com/)
- [Jest Testing Guide](https://jestjs.io/docs/getting-started)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)

---

## Contributing

See main [README.md](README.md#contributing) for contribution guidelines.

For questions or issues, please open a GitHub issue.

---

**Last Updated**: 2026-01-26
**Maintainer**: @tmheo
