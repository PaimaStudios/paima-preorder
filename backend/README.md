# Paima Launchpad Backend

This documentation provides a basic overview of the backend. Each module has its own `README` file with more detailed information.

## Usage

Launchpads data is stored in `utils/src/data.ts`. Edit that to add/change available launchpads. The data properties are explained in the type's comments.

## Prerequisites

Ensure that the `paima-engine-{linux|mac}` executable is located in the parent directory of this project. Paima Engine version needs to be at least 4.0.0, which is the version that this project was tested with. The directory structure should be as follows:

```
backend
../paima-engine-linux
../.env
```

## Installation

To install dependencies and perform initial setup, run the following command:

```
npm run initialize
```

This does the following:

- install dependencies of this template
- copies `.env.example` as `.env.localhost` to the parent folder - edit that file as necessary

### MacOS specific

If you're using Mac and run into installation issues you can add `--target=esbuild-darwin-arm64` as a workaround to `npm install`. This installs the correct version of a problematic package. For example:

```
npm install --save-dev esbuild@latest --target=esbuild-darwin-arm64
```

## Building

To compile the Game Node into `endpoints` and `gameCode` entrypoints used by Paima Engine, use the following command:

```
npm run pack
```

## Environment Setup

Config file `.env.localhost` is created during `npm run initialize` in the parent folder, based on `.env.example` in this project. This is an empty file that you need to fill in with your specific values, before running Paima Engine.

Feel free to use examples written in the file for initial testing.

## Contracts

1. Start a local network using `npm run chain:start`
2. Deploy the contracts using `npm run chain:deploy`

## Development

To reflect changes in the `API`, use the following command to regenerate all `tsoa` routes:

```
npm run compile:api
```

If there are any changes to the DB schema or queries, start the `pgtyped` watcher process using the following command. It will regenerate all the DB types used in the project:

```
npm run compile:db
```

To speed up the development cycle you can at any time completely reset the database and start syncing from the latest blockheight. Run this command, that will modify your `.env.localhost` and `docker-compose.yml` files:

```
npm run database:reset
```

## Production

To start the database, run the command:

```
npm run database:up
```

To run the Game Node, follow these steps:

1. Change to the parent directory where the packaged folder was generated:

```
cd ..
```

2. Execute the following command:

```
./paima-engine-linux run
```

You can set the `NETWORK` variable if you want to load a custom config for your Game Node. For example to load `.env.localhost` use:

```
NETWORK=localhost ./paima-engine-linux run
```

## Documentation

If you've got this far you're probably already familiar with our documentation. But if you need to refresh your knowledge you can copy the documentation files to your file system by using the standalone CLI command:

```
./paima-engine-linux docs
```

Or you can visit our [Paima Documentation Website](docs.paimastudios.com) at any time.
