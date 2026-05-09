# Rifair AI Security & Secret Management

This document outlines the zero-trust secret architecture implemented in Rifair AI.

## Core Security Rules

1.  **NO SECRETS IN FRONTEND**: Any variable that is not public (i.e., not prefixed with `NEXT_PUBLIC_`) must NEVER be used in the frontend.
2.  **SERVER-ONLY ENFORCEMENT**: Critical modules use the `server-only` package. Attempting to import these into client components will cause a build failure.
3.  **CENTRALIZED SECRET MANAGER**: All secrets are managed in `backend/src/core/secrets/secretManager.ts`. No other file should directly access `process.env`.
4.  **FAIL-FAST VALIDATION**: The backend validates all environment variables at startup using Zod. If any required secret is missing or malformed, the server will not start.
5.  **AI GATEWAY**: All AI provider calls (Groq, Gemini, Claude) are routed through the backend AI Gateway. The frontend must never call a provider directly or know about provider API keys.
6.  **SECRET MASKING**: Sensitive keys are automatically masked in logs (e.g., `sk-****6789`).

## How to Add New Environment Variables

1.  **Backend**:
    - Add the variable name and validation rules to `backend/src/core/config/env.ts`.
    - Access it via `secrets.get('YOUR_VARIABLE')` in the code.
2.  **Frontend**:
    - Only add public variables prefixed with `NEXT_PUBLIC_` to `.env.local`.
    - If it's a secret, it **MUST** go to the backend.

## Secret Rotation

To rotate a secret:
1.  Update the secret value in your deployment platform (Vercel, Railway).
2.  Redeploy the application.
3.  The backend will validate the new secret at startup.

## Automated Audits

Run the security audit locally at any time:
```bash
npm run security:audit
```

This is also enforced automatically via a git pre-commit hook.

## Incident Response

If a secret is accidentally committed to git:
1.  **Rotate the secret immediately**.
2.  Use `bfg-repo-cleaner` or `git filter-repo` to purge the secret from the history.
3.  Force push the cleaned history (use with extreme caution).
