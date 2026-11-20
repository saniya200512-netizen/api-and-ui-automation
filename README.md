# API & UI Test Automation

Playwright + JavaScript + GitHub Actions.

- **API (9 tests):** Restful-Booker covering health check, auth, list, create, read, update, delete.
- **UI (9 tests):** SauceDemo covering login, cart, sorting, checkout, logout.
- **CI:** All 18 tests run on every push; the HTML report is uploaded as an artifact.

## Run locally
```
npm install
npx playwright install chromium
npm test            # everything
npm run test:api    # API only
npm run test:ui     # UI only
npm run report      # open HTML report
```

## Publish
Push to a GitHub repo; the workflow in `.github/workflows/playwright.yml` runs automatically.
Download the report from the run's Artifacts section.
