<!--
Purpose: guidance for AI coding agents to be productive in this repository.
If parts are placeholder text, the repository did not contain discoverable files
to extract exact examples from — please point me at the main app code if you
want these placeholders replaced with concrete file examples.
-->

# Copilot / AI Agent Instructions (concise)

Overview
- This repository currently has no top-level source files detected; before
  making behavioural changes, locate the application entrypoints (common
  locations: `src/`, `app/`, `services/`, `packages/`, or `apps/`). If this is a
  monorepo look for `package.json`/`pyproject.toml`/`pom.xml` files under
  subfolders.

Big picture / how to discover architecture
- Search for these markers to reconstruct architecture quickly:
  - `package.json`, `yarn.lock`, `pnpm-lock.yaml` -> Node services/packages
  - `pyproject.toml`, `requirements.txt` -> Python services
  - `pom.xml`, `build.gradle` -> Java services
  - `*.csproj`, `global.json` -> .NET services
  - `docker-compose.yml`, `Dockerfile`, `.devcontainer` -> container/dev flows
  - `apps/` or `services/` folders -> independent deployable units
- Data flows: follow config/secrets and environment files (`.env`, `config/*`)
  to find DB, cache, queue endpoints. Grep for common client libraries
  (`pg`, `redis`, `kafka`, `@azure/*`, `boto3`, `pika`) to find integrations.

Build / test / debug workflows (what an agent should try)
- On Windows (PowerShell) prefer these commands depending on detected stack:
  - Node: `pwsh -c "npm install"` then `pwsh -c "npm test"` or `npm run start`
  - Python: create venv `python -m venv .venv; .\.venv\Scripts\Activate.ps1`
    then `pip install -r requirements.txt` and `pytest`.
  - .NET: `pwsh -c "dotnet build"` then `dotnet test`.
  - Java (Maven): `pwsh -c "mvn -T 1C -DskipTests=false test"`.
  - Docker compose: `pwsh -c "docker-compose up --build"`.
- If no scripts are present, search for `Makefile`, `build.*`, or CI files
  (`.github/workflows`, `azure-pipelines.yml`) to infer the canonical commands.

Project conventions and patterns to respect
- Branching / commit: look for `CONTRIBUTING.md` or CI checks in
  `.github/workflows` to detect linting/format requirements (eslint, flake8).
- Imports / module format: prefer the project's existing style (ESM vs CJS,
  relative vs absolute import). If you change imports, update the nearest
  build config (`tsconfig.json`, `python.__init__` locations).
- Error handling: follow existing error-wrapping patterns — search for
  `error-handler`, `middleware/error`, `common/exceptions` and mimic style.

Integration points & external dependencies
- Locate runtime config in: `.env`, `config/*.yml`, `config/*.json`, `secrets/`.
  When adding code that touches external systems, make it configurable via
  environment variables and provide a default that causes a fast failure in CI.
- For cloud infra (Azure/AWS/GCP) look for provider SDK usage or IaC files
  (`bicep`, `arm`, `terraform`, `azure-pipelines.yml`, `cloudbuild.yaml`).

What to change and what to avoid
- Prefer small, local edits. When refactoring across modules, update tests and
  CI scripts together. Avoid changing formatting settings or lint rules in the
  same PR unless explicitly asked.
- Do not commit credentials, secrets, or `.env` contents. Use placeholders and
  update `README.md` with any new env variables.

Examples (how to find concrete examples in this repo)
- If present, reference the app entry in `src/index.js` or `src/main.py` for
  request/response flow and middleware examples.
- For HTTP services, copy patterns from `src/routes/*` and `src/controllers/*`.
- For database access, follow the queries/ORM usage in `src/db/` or `models/`.

If you need more precise instructions
- Point me to the primary service folder (for example: `services/api`,
  `apps/web`, or `packages/backend`) or paste the contents of these files:
  `package.json`, `pyproject.toml`, `Dockerfile`, `docker-compose.yml`.
- I will update this file with concrete examples and commands from the
  repository and preserve any existing `.github/copilot-instructions.md` text.

Feedback request
- Tell me which folder is the main app and any non-standard build/test
  commands I should include; I'll incorporate those and iterate.
