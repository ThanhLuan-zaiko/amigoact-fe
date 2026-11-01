# Contributing to amigoact-fe

Thanks for your interest in contributing! This guide explains how to set up the frontend and how to send changes.

By participating in this project, you agree to abide by the [Code of Conduct](CODE_OF_CONDUCT.md).

## Prerequisites

- [Bun 1.4.2](https://bun.sh/docs/installation) (the version is pinned in the `packageManager` field of `package.json`)

## Getting Started

```bash
bun install
bun dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app. It reloads when you edit files.

## Available Scripts

| Command             | Purpose                                      |
| ------------------- | -------------------------------------------- |
| `bun dev`           | Start the development server                 |
| `bun run build`     | Create a production build                    |
| `bun start`         | Serve the production build                   |
| `bun run lint`      | Check code with Biome                        |
| `bun run format`    | Format code with Biome                       |

## Before You Write Code

This project uses Next.js 16, which has breaking changes from earlier versions. APIs, conventions, and file structure may differ from what you expect. Read the relevant guide in `node_modules/next/dist/docs/` before you write code, and see [AGENTS.md](../AGENTS.md) for details.

## Making Changes

1. Create a branch from the default branch with a short, descriptive name:

   ```bash
   git checkout -b feat/event-list
   ```

2. Make your changes. Keep each commit focused on one logical change.
3. Run the checks before you push:

   ```bash
   bun run lint
   bun run build
   ```

4. Push your branch and open a pull request.

## Managing Dependencies

Add or remove packages with Bun so that `package.json` and `bun.lock` stay in sync:

```bash
bun add <package>
bun remove <package>
```

Commit both `package.json` and `bun.lock` in the same pull request.

## Pull Requests

A good pull request:

- Has a clear title and a description of what changed and why
- Links to the related issue, if one exists
- Includes screenshots for visual changes
- Passes `bun run lint` and `bun run build`
- Stays small enough to review in one sitting

## Reporting Bugs and Requesting Features

Open an issue on GitHub. For bugs, include the steps to reproduce, what you expected, and what happened instead.

Do not report security vulnerabilities in public issues. See [SECURITY.md](SECURITY.md) for the private reporting process.
