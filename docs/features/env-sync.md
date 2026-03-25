---
title: Encrypted Env Sync
description: AES-256-GCM encrypted .env file management across environments.
---

# Encrypted Env Sync

ForgeKit provides encrypted environment variable management. Push your `.env` files to secure local storage, pull them on any machine, and diff between environments, all protected by a passphrase.

## Usage

```bash
forgekit env <subcommand>
```

### Subcommands

| Subcommand | Description |
|------------|-------------|
| `push [env]` | Encrypt and store the current `.env` file |
| `pull [env]` | Decrypt and restore a stored `.env` file |
| `list` | Show all stored environments for this project |
| `diff <env1> <env2>` | Compare two stored environments |

### Examples

```bash
# Save your current .env as "development"
forgekit env push development

# Restore the "staging" environment
forgekit env pull staging

# See all stored environments
forgekit env list

# Compare development and staging
forgekit env diff development staging
```

## How It Works

1. **Encryption**: Uses AES-256-GCM with a key derived from your passphrase via `scrypt`
2. **Storage**: Encrypted files are stored in `~/.forgekit/envs/<project-hash>/`
3. **Project identification**: Each project is identified by a SHA-256 hash of its absolute path
4. **Passphrase**: You are prompted for a passphrase (minimum 8 characters) on push and pull

## Security Model

| Aspect | Detail |
|--------|--------|
| Encryption algorithm | AES-256-GCM |
| Key derivation | scrypt (from passphrase) |
| Authentication | GCM provides authenticated encryption |
| Storage | Local filesystem only, nothing is sent to the cloud |
| Wrong passphrase | Decryption fails with a clear error |

## Example Workflow

```bash
# Developer A saves the production env
forgekit env push production
# Enter passphrase: ********

# Developer A shares passphrase with Developer B securely

# Developer B pulls the production env
forgekit env pull production
# Enter passphrase: ********
# ✔ .env restored from "production"
```

## Diff Output

```bash
forgekit env diff development staging
```

```
  Environment Diff: development ↔ staging

  DATABASE_URL:
    - postgres://localhost:5432/myapp_dev
    + postgres://staging-db:5432/myapp_staging

  API_KEY:
    - dev_key_123
    + staging_key_456

  DEBUG:
    - true
    (not set in staging)
```

::: tip Configuration
You can set a default environment name in your config:

```json
{
  "envSync": {
    "defaultEnvironment": "development"
  }
}
```
:::

::: warning Passphrase responsibility
ForgeKit does not store or recover passphrases. If you forget the passphrase for an environment, the encrypted data cannot be recovered. Use a password manager to store passphrases securely.
:::
