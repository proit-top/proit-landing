# Public repository rules

## Before every commit

1. Check `git diff --staged`.
2. Check the file list with `git status --short`.
3. Search for credential-like files and values.
4. Confirm that only public website content is staged.

## Never commit

- values from `.env` files;
- API keys, access tokens, cookies or passwords;
- private SSH keys or certificates;
- customer data, lead exports or database dumps;
- internal infrastructure addresses and private URLs;
- Hermes plans and internal notes;
- temporary build output and local caches.

## Safe configuration

Use `.env.example` with placeholder names only. Production values belong in Netlify environment variables or the relevant secret store, never in Git.

## Incident rule

If a secret is accidentally staged or pushed: stop, do not publish further changes, revoke/rotate the secret, then remove it from Git history and verify the repository again.
