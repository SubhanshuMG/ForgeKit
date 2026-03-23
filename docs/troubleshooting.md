---
title: Troubleshooting
description: Solutions to common ForgeKit issues — installation errors, Node and Python version mismatches, Docker, CI/CD, and test failures.
---

# Troubleshooting

Solutions to common issues. Run `npx forgekit-cli doctor` first — it catches most environment problems in one step.

---

## Installation Issues

### `npx forgekit-cli` fails with "command not found"

**Cause:** Node.js is not installed or is below version 18.

**Fix:**

```bash
node --version  # Must be 18.0.0 or higher
```

Install or upgrade Node.js from [nodejs.org](https://nodejs.org) or via nvm:

```bash
nvm install 20
nvm use 20
```

---

### `EACCES: permission denied` when installing globally

**Cause:** npm's global prefix directory is owned by root, which causes permission errors when installing without `sudo`.

**Fix:** Do not use `sudo npm install -g`. Instead, configure npm to use a directory you own:

```bash
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
export PATH=~/.npm-global/bin:$PATH
```

Add the `export PATH` line to your `~/.bashrc` or `~/.zshrc` to make it permanent. Then re-run the install:

```bash
npm install -g forgekit-cli
```

Alternatively, use [nvm](https://github.com/nvm-sh/nvm) to manage Node.js — it installs into your home directory and avoids this problem entirely.

---

### Node version mismatch — CLI installs but commands fail

**Cause:** You have multiple Node.js versions installed and the wrong one is active.

**Fix:** Check which Node is active and switch to 18 or 20:

```bash
node --version      # Shows currently active version
nvm list            # Shows all installed versions (if using nvm)
nvm use 20          # Switch to Node 20
```

If you are not using nvm, check that your PATH points to the correct Node installation:

```bash
which node
```

---

### `npx forgekit-cli` hangs on first run

**Cause:** npm is downloading the package for the first time over a slow connection. This is normal behavior.

**Fix:** Wait 10–30 seconds. Subsequent runs are instant because npx caches the package locally.

---

## Python Issues

### `forgekit doctor` reports Python not found

**Cause:** Python 3 is not installed or not in your `PATH`.

**Fix:**

```bash
# macOS
brew install python3

# Ubuntu / Debian
sudo apt install python3 python3-pip

# Fedora / RHEL
sudo dnf install python3
```

After installing, verify:

```bash
python3 --version
pip3 --version
```

If `python3` is available but `forgekit doctor` still fails, your `PATH` may not include the Python binary directory. Check:

```bash
which python3
echo $PATH
```

---

### `pip install` fails for `api-service` or `ml-pipeline`

**Cause:** Python 2's `pip` is being called, or pip is not installed, or the Python version is below 3.9.

**Fix:**

```bash
python3 --version   # Must be 3.9+
pip3 --version      # Must exist
```

If `pip3` is not found, install it:

```bash
python3 -m ensurepip --upgrade
```

Then run the install explicitly:

```bash
pip3 install -r requirements.txt
# or
python3 -m pip install -r requirements.txt
```

---

### `ml-pipeline` — pytest INTERNALERROR with asyncio

**Cause:** `pytest-asyncio` version conflict from MLflow or Jupyter dependencies.

**Fix:** Run pytest with the asyncio plugin disabled:

```bash
python -m pytest tests/ -p no:asyncio
```

Or add this to `pytest.ini` in the project root:

```ini
[pytest]
testpaths = tests
asyncio_mode = auto
```

---

## Go Issues

### `go-api` template — `go: command not found`

**Cause:** Go is not installed or is not in your `PATH`.

**Fix:** Install Go from [go.dev/dl](https://go.dev/dl/). The `go-api` template requires Go 1.21 or higher.

After installing, verify:

```bash
go version
```

If Go is installed but not found, add it to your PATH:

```bash
export PATH=$PATH:/usr/local/go/bin
```

Add this line to your `~/.bashrc` or `~/.zshrc`.

---

### `go-api` — `go mod tidy` fails with network errors

**Cause:** The Go module proxy is unreachable (firewall or offline environment).

**Fix:** For offline use, set `GOFLAGS` to use the local module cache:

```bash
GONOSUMCHECK=* GOFLAGS=-mod=mod go build ./...
```

Or set a local proxy if your organization runs one:

```bash
export GOPROXY=https://your-proxy.example.com,direct
```

---

## Docker Issues

### Docker is not running

**Cause:** Docker Desktop is installed but not started, or the Docker daemon is not running.

**Fix:**

```bash
docker info    # Shows "Server: ERROR" if daemon is not running
```

Start Docker Desktop from your Applications folder (macOS) or system tray (Windows), or start the daemon on Linux:

```bash
sudo systemctl start docker
```

Docker is **optional** for scaffolding — you only need it to run `docker-compose up`.

---

### Port conflict in docker-compose

**Cause:** Another process is already using the port that `docker-compose` is trying to bind (e.g., port 3000, 5432, or 8000).

**Fix:** Find the conflicting process and stop it:

```bash
# macOS / Linux
lsof -i :3000      # Replace 3000 with the conflicting port
kill -9 <PID>

# Or change the port in docker-compose.yml
# Example: change "3000:3000" to "3001:3000"
```

Common port conflicts:

| Service | Default Port | Common Conflict |
|---------|-------------|-----------------|
| `web-app` backend | 3000 | Another Node.js app |
| `api-service` | 8000 | Another Python/uvicorn server |
| PostgreSQL | 5432 | Local Postgres instance |
| MLflow UI | 5000 | AirPlay on macOS |

---

## Scaffolding Issues

### `Template not found: <name>`

**Cause:** The template ID is incorrect or misspelled.

**Fix:** Run `forgekit list` to see all available template IDs:

```bash
npx forgekit-cli list
```

Available templates: `web-app`, `api-service`, `ml-pipeline`, `next-app`, `go-api`, `serverless`

---

### `Error: Project directory already exists`

**Cause:** A directory with the given project name already exists at the target path.

**Fix:** Choose a different name or use `--dir` to specify a different parent directory:

```bash
npx forgekit-cli new my-app-v2 --template web-app
# or
npx forgekit-cli new my-app --template web-app --dir ~/projects
```

---

### `Error: ENOENT: no such file or directory` during scaffold

**Cause:** The output directory cannot be created due to permissions.

**Fix:** Check that the parent directory is writable:

```bash
ls -la .
```

If you are scaffolding into a path like `~/projects`, make sure `~/projects` exists:

```bash
mkdir -p ~/projects
```

---

### Scaffolded project has missing files

**Cause:** A post-scaffold install step failed partway through.

**Fix:** Run `forgekit doctor` to check your environment, then re-scaffold with `--skip-install` to confirm the template files themselves are intact:

```bash
npx forgekit-cli doctor
npx forgekit-cli new my-app --template web-app --skip-install
```

If files are present with `--skip-install`, the issue is in the install step. See the Python or Node issues sections above.

---

## Test Issues

### Jest test timeout — tests hang or take too long

**Cause:** A test is waiting on an async operation that never resolves, or the default 5-second timeout is too short for your environment.

**Fix:** Increase the timeout for the affected test:

```typescript
it('should do something slow', async () => {
  // ...
}, 30000) // 30 seconds
```

Or set a global default in `jest.config.js`:

```js
module.exports = {
  testTimeout: 30000,
}
```

If tests hang indefinitely, check for unclosed database connections, pending promises, or open server handles. Use `--detectOpenHandles`:

```bash
npx jest --detectOpenHandles
```

---

### Coverage threshold failure — CI fails even though tests pass

**Cause:** Test coverage dropped below the configured threshold in `jest.config.js`.

**Fix:** Check the current coverage report to see which files are under-covered:

```bash
npm test --workspace=packages/cli -- --coverage
open packages/cli/coverage/index.html
```

Current thresholds for `src/core/**`:

| Metric | Minimum |
|--------|---------|
| Lines | 40% |
| Functions | 33% |
| Branches | 30% |

Either add tests to bring coverage above the thresholds, or if you added new code paths that are intentionally not unit-tested (e.g., CLI command wrappers covered by integration tests), update the `coveragePathIgnorePatterns` in `jest.config.js` with justification in your PR.

---

## CI/CD Issues

### GitHub Actions workflow fails on `npm ci`

**Cause:** `package-lock.json` is out of sync with `package.json`.

**Fix:** Run `npm install` locally and commit the updated lockfile:

```bash
npm install
git add package-lock.json
git commit -s -m "chore: update lockfile"
```

---

### Integration test fails on `api-service` with `ModuleNotFoundError`

**Cause:** FastAPI or other dependencies are not installed, or the working directory is wrong.

**Fix:** Confirm you are running pytest from the project root where `main.py` lives:

```bash
cd /path/to/my-api-project
pip install -r requirements.txt
python -c "from main import app"   # Verify import works
pytest tests/
```

---

### `api-service` — `from main import app` fails in tests

**Cause:** The working directory is not the project root when pytest runs.

**Fix:** Run pytest from the directory containing `main.py`:

```bash
cd my-api-project
pytest tests/
```

---

## VitePress Build Issues

### VitePress build fails with `Cannot find module` errors

**Cause:** VitePress docs dependencies are not installed.

**Fix:**

```bash
cd docs
npm install
npm run build
```

If running from the repo root:

```bash
npm ci
npm run docs:build
```

---

### VitePress dev server crashes with `EADDRINUSE`

**Cause:** Port 5173 (the default VitePress port) is already in use.

**Fix:** Stop the process using that port:

```bash
lsof -i :5173
kill -9 <PID>
```

Or start VitePress on a different port:

```bash
npx vitepress dev docs --port 5174
```

---

## Still stuck?

- Run `npx forgekit-cli doctor` and include the full output when reporting
- Search [GitHub Issues](https://github.com/SubhanshuMG/ForgeKit/issues)
- Open a [GitHub Discussion](https://github.com/SubhanshuMG/ForgeKit/discussions)
