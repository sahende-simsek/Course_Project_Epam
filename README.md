# Course_Project

## Admin / Evaluator bootstrap (emails & domains)

This project supports bootstrapping admin/evaluator accounts via environment config. Use this only for initial bootstrap — production role management should use your IdP or a DB-driven admin UI.

There are two mechanisms:

- `ADMIN_EMAILS`: exact email list (e.g. `admin2@example.com,admin3@example.com`)
- `ADMIN_EMAIL_DOMAINS`: domain list (e.g. `example.com`) — **any email ending with this domain is treated as evaluator/admin** on first registration.

Local example (.env):

```
# .env example for local development
DATABASE_URL="postgresql://portal_user:your_password@localhost:5432/portal_db"

# Admin/evaluator emails (comma-separated, lowercased)
# Exact addresses promoted to evaluator/admin
ADMIN_EMAILS="admin@example.com"

# Or promote all users from a domain to evaluator/admin on registration
ADMIN_EMAIL_DOMAINS="example.com"
```

Deployment / CI guidance (GitHub Actions):

1. Add a repository secret named `ADMIN_EMAILS` with the comma-separated admin emails (e.g. `alice@example.com,bob@example.com`).
2. Ensure your deployment pipeline injects that secret into the runtime environment (do not commit `.env` with secrets).

Notes:
- On startup the application will read `ADMIN_EMAILS` to seed admin roles if a corresponding user exists or to mark seeded accounts; this is intended as a bootstrap only.
- Long-term: integrate role/group claims from your Identity Provider (IdP) or maintain roles in the database and provide an admin UI for role management.
- Security: keep `ADMIN_EMAILS` in your secrets manager (GitHub Secrets, Azure Key Vault, AWS Secrets Manager, etc.) and rotate access appropriately.

### GitHub Actions example (run after migrations)

Example workflow step to run the seed script during deployment. This uses the repo secret `ADMIN_EMAILS` and does not print the secret value.

```yaml
- name: Seed admin users
	run: |
		npm ci
		npm run build
		# Run seed script (ADMIN_EMAILS provided via secrets)
		ADMIN_EMAILS="${{ secrets.ADMIN_EMAILS }}" node scripts/seed-admins.js
	# Do not echo or log the secret value anywhere; GitHub masks secrets automatically.
	shell: bash
```

Security scanner note:
- Do not commit `.env` or plaintext secrets. GitHub Actions masks secrets, so avoid printing them. If you have an automated secret-scanner in CI that blocks deployments for certain secret names, configure it to accept the `ADMIN_EMAILS` secret usage for this bootstrap flow or prefer a secrets manager integration (recommended).
