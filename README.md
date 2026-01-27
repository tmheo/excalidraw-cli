# excalidraw-cli

[![npm version](https://img.shields.io/npm/v/@tommywalkie/excalidraw-cli)](https://www.npmjs.com/package/@tommywalkie/excalidraw-cli) ![build](https://github.com/tmheo/excalidraw-cli/workflows/build/badge.svg?branch=master)

Experimental Excalidraw CLI tool.

Parses Excalidraw JSON schemas (`*.excalidraw`) into PNGs (`*.png`).

This project is a follow-up to [excalidraw#1261](https://github.com/excalidraw/excalidraw/issues/1261) and strives to provide a CLI for **[excalidraw](https://github.com/excalidraw/excalidraw)**.

![demo](https://raw.githubusercontent.com/tommywalkie/excalidraw-cli/master/.github/assets/demo.gif)

_Demo_ ⤴️

## About This Fork

This is a fork of [tommywalkie/excalidraw-cli](https://github.com/tommywalkie/excalidraw-cli).

### Why Fork?

The original project has not been actively maintained, causing compatibility issues with newer Node.js versions and outdated dependencies. This fork addresses these issues by:

- **Updated Dependencies**: Migrated to latest versions of core libraries
- **Node.js 22+ Support**: Updated engine requirements for modern Node.js
- **TypeScript 5.x**: Upgraded to TypeScript 5.7 for better type safety
- **Modern Tooling**: Updated Jest 29, ESLint 9, and oclif v4

### Key Changes from Original

| Package | Original | This Fork |
|---------|----------|-----------|
| Node.js | 12+ | 22+ |
| TypeScript | 4.x | 5.7.x |
| canvas | 2.x | 3.0.0 |
| roughjs | 4.3.x | 4.6.6 |
| listr2 | 2.x | 10.0.0 |
| oclif | 1.x | 4.x |
| Jest | 26.x | 29.x |

### Repository Links

- **Original**: [tommywalkie/excalidraw-cli](https://github.com/tommywalkie/excalidraw-cli)
- **This Fork**: [tmheo/excalidraw-cli](https://github.com/tmheo/excalidraw-cli)

## Requirements

- Node.js 22.0.0 or higher
- npm or yarn

### Native Dependencies

This project uses [node-canvas](https://github.com/Automattic/node-canvas) which requires native dependencies:

- **macOS:** `brew install pkg-config cairo pango libpng jpeg giflib librsvg`
- **Ubuntu/Debian:** `sudo apt-get install build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev`
- **Windows:** See [node-canvas Windows installation guide](https://github.com/Automattic/node-canvas#compiling)
- **Alpine Linux:** See installation instructions below

## Install

### From GitHub (Recommended for this fork)

```bash
# Install from this fork
npm install -g github:tmheo/excalidraw-cli

# Or install as a project dependency
npm install github:tmheo/excalidraw-cli
```

### From npm (Original package)

```bash
# Original (may have outdated dependencies)
npm install -g @tommywalkie/excalidraw-cli
```

### From Local Build

```bash
# Clone and build
git clone https://github.com/tmheo/excalidraw-cli.git
cd excalidraw-cli
npm install
npm run prepack

# Install globally from local build
npm install -g .
```

### Alpine

If using Alpine (e.g. for Docker stuff), install the following packages.

```dockerfile
FROM node:22-alpine
RUN apk add --no-cache python3 g++ build-base cairo-dev jpeg-dev pango-dev \
    musl-dev giflib-dev pixman-dev pangomm-dev libjpeg-turbo-dev freetype-dev
```

## Usage

```bash
$ excalidraw-cli --help
Parses Excalidraw JSON schemas into PNGs

USAGE
  $ excalidraw-cli [INPUT] [OUTPUT]

ARGUMENTS
  INPUT   [default: {cwd}] Excalidraw file path / directory path
  OUTPUT  [default: {cwd}] Output PNG file path / directory path

OPTIONS
  -h, --help     show CLI help
  -q, --quiet    disable console outputs
  -v, --version  show CLI version
```

### Programmatic Usage

You can also use this package programmatically in your Node.js projects:

```javascript
// Using npx (no installation required)
const { execSync } = require('child_process');
execSync('npx github:tmheo/excalidraw-cli input.excalidraw output.png');

// Or if installed as a dependency
const { execSync } = require('child_process');
execSync('excalidraw-cli input.excalidraw output.png');
```

### Docker

For convenience we have also a Docker image that includes all dependencies out of the box.

#### Build

To build the Docker image run following command:

```bash
docker build -t excalidraw-cli .
```

#### Use

To use the docker image in a convenient way you can add following function to your `.bashrc` or `.zshrc`.

```bash
function excalidraw-cli {
  docker run --rm -it -v $PWD:/data excalidraw-cli $@
}
```

Then simply reload your terminal to have this function available.

```bash
$ excalidraw-cli drawings/my-drawing.excalidraw .
✔ drawings/my-drawing.excalidraw => drawings/my-drawing.png
```

## How it works

Currently, [`excalidraw`](https://www.npmjs.com/package/excalidraw) NPM package only exports a React component. `excalidraw-cli` uses **[node-canvas](https://github.com/Automattic/node-canvas)** at its core, this allows to generate canvas without relying on the `window` context, and uses a home-made renderer which tries to _mimic_ Excalidraw's as much as possible, using [**Rough.js**](https://roughjs.com/) API primarily.

Hopefully, `excalidraw-cli` will directly use Excalidraw renderer methods for consistent results, once Excalidraw provides some Node-compatible API.

See the related issue thread [excalidraw#1780](https://github.com/excalidraw/excalidraw/issues/1780).

## Contributing

> **Note**: This project uses **TypeScript 5.x** for type safety and modern JavaScript features.

Install dependencies with `npm` or `yarn`.

```sh
npm install
# or
yarn install
```

Build the project (transpile TypeScript to CommonJS and export fonts):

```sh
npm run prepack
```

Test the CLI with the transpiled source code:

```sh
node ./bin/run           # Run with Node
npm run excalidraw-cli   # Run with NPM script
```

Run tests with Jest 29:

```sh
npm run test
```

You can check requested / planned / work-in-progress features in [Projects](https://github.com/tommywalkie/excalidraw-cli/projects).

## License

MIT
