# Troubleshooting

Common issues and how to fix them.

---

## Installation Issues

### `npx forgekit-cli` fails with "command not found"

**Cause:** Node.js is not installed or is below version 18.

**Fix:**
```bash
node --version  # Must be 18.0.0 or higher
```

Install or upgrade Node.js from [nodejs.org](https://nodejs.org) or via `nvm`:
```bash
nvm install 20
nvm use 20
```

---

### `npx forgekit-cli` hangs on first run

**Cause:** npm is downloading the package for the first time — this is normal.

**Fix:** Wait 10–30 seconds. Subsequent runs are instant since npx caches the package.

---

### `Error: EACCES: permission denied`

**Cause:** npm global permissions issue.

**Fix:** Do not use `sudo`. Instead fix npm permissions:
```bash
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
export PATH=~/.npm-global/bin:$PATH
```

Or use `nvm` which handles this automatically.

---

## Scaffolding Issues

### `Template not found: <name>`

**Cause:** The template name is incorrect or misspelled.

**Fix:** Run `forgekit list` to see all available templates:
```bash
npx forgekit-cli list
```

Available templates: `web-app`, `api-service`, `ml-pipeline`

---

### `Error: Project directory already exists`

**Cause:** A directory with the project name already exists at the target path.

**Fix:** Either choose a different name or use `--dir` to specify a different output location:
```bash
npx forgekit-cli new my-app --template web-app --dir ~/projects
```

---

### `Error: ENOENT: no such file or directory` during scaffold

**Cause:** The output directory doesn't exist and cannot be created due to permissions.

**Fix:** Check that the parent directory is writable:
```bash
ls -la .  # Check current directory permissions
```

---

### Scaffolded project has missing files

**Cause:** The scaffold completed but a post-install step failed silently.

**Fix:** Run `forgekit doctor` to check your environment:
```bash
npx forgekit-cli doctor
```

Then try scaffolding again with `--skip-install` to isolate the issue:
```bash
npx forgekit-cli new my-app --template web-app --skip-install
```

---

## Template-Specific Issues

### `web-app` — `npm install` fails after scaffold

**Cause:** Node.js version is too old (requires 18+) or npm registry is unreachable.

**Fix:**
```bash
node --version   # Must be >=18
npm --version    # Must be >=8
cd my-app && npm install
```

---

### `api-service` — `pip install` fails

**Cause:** Python 3.9+ is required. Some systems default to Python 2.

**Fix:**
```bash
python3 --version   # Must be 3.9+
pip3 install -r requirements.txt
```

If `pip3` is not found:
```bash
python3 -m pip install -r requirements.txt
```

---

### `api-service` — `from main import app` fails in tests

**Cause:** Working directory is wrong when running pytest.

**Fix:** Run pytest from the project root (where `main.py` lives):
```bash
cd my-api-project
pytest tests/
```

---

### `ml-pipeline` — pytest INTERNALERROR with asyncio

**Cause:** `pytest-asyncio` version conflict from mlflow/jupyter dependencies.

**Fix:** Run pytest with the asyncio plugin disabled:
```bash
python -m pytest tests/ -p no:asyncio
```

Or add to `pytest.ini` in the project root:
```ini
[pytest]
testpaths = tests
asyncio_mode = auto
```

---

## CLI Issues

### `forgekit doctor` reports Python not found

**Cause:** Python is not installed or not in `PATH`.

**Fix:** Install Python 3 from [python.org](https://python.org) or via your package manager:
```bash
# macOS
brew install python3

# Ubuntu/Debian
sudo apt install python3
```

---

### `forgekit doctor` reports Docker not found

**Cause:** Docker Desktop is not installed. Docker is **optional** — templates work without it.

**Fix:** Install Docker from [docker.com](https://docker.com) if you need container support. ForgeKit scaffolding works without Docker.

---

## Telemetry Issues

### How do I disable telemetry?

ForgeKit collects anonymous, opt-in usage data. To disable:
```bash
npx forgekit-cli telemetry disable
```

To check your current status:
```bash
npx forgekit-cli telemetry status
```

---

## CI/CD Issues

### GitHub Actions workflow fails on `npm ci --workspaces`

**Cause:** `package-lock.json` is out of sync.

**Fix:** Run `npm install` locally and commit the updated lockfile:
```bash
npm install
git add package-lock.json
git commit -m "chore: update lockfile"
```

---

### Integration test fails on api-service with `ModuleNotFoundError`

**Cause:** FastAPI dependencies not installed or Python path issue.

**Fix:** Ensure you're running from the project root where `main.py` lives:
```bash
cd /tmp/int-api
pip install -r requirements.txt
python -c "from main import app"
```

---

## Still stuck?

- Search [GitHub Issues](https://github.com/SubhanshuMG/ForgeKit/issues)
- Open a [GitHub Discussion](https://github.com/SubhanshuMG/ForgeKit/discussions)
- Run `npx forgekit-cli doctor` and include the output when reporting issues
