# Security Policy

## Reporting a Vulnerability

**Do not report security vulnerabilities as public GitHub issues.**

If you discover a security vulnerability in ForgeKit, please report it privately so we can fix it before public disclosure.

### How to Report

Use **[GitHub Security Advisories](https://github.com/forgekit/forgekit/security/advisories/new)** to submit a private report.

Include as much of the following as possible:

- **Description**, what the vulnerability is and where it exists
- **Steps to reproduce**, the minimal steps needed to trigger it
- **Impact**, what an attacker could achieve by exploiting it
- **Affected versions**, which version(s) are affected
- **Suggested fix**, if you have one (optional but appreciated)

### Response Timeline

| Action | Target |
|--------|--------|
| Acknowledge receipt | Within 48 hours |
| Confirm or dismiss | Within 7 days |
| Fix for critical issues | Within 30 days |
| Fix for high severity | Within 60 days |
| Coordinated disclosure | After fix is released |

We follow **responsible disclosure**: we will work with you to understand the issue, build a fix, and coordinate the public disclosure timing.

---

## Supported Versions

| Version | Supported |
|---------|-----------|
| Latest release | Yes |
| Previous minor | Security fixes only |
| Older versions | No |

---

## Security Design Principles

ForgeKit is built with the following security defaults:

- **Input validation** on all CLI arguments and template paths
- **Path containment**, scaffold operations are sandboxed to the target directory
- **No secrets in templates**, all templates are scanned for credentials before merge
- **Least privilege**, no unnecessary file system or network access
- **Dependency auditing**, `npm audit` runs on every CI build
- **DCO enforcement**, all contributions are certified by contributors

---

## Acknowledgments

We thank security researchers who responsibly disclose vulnerabilities to us. Significant findings will be acknowledged in our release notes with the reporter's permission.
