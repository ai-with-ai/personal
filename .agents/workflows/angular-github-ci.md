---
description: Automated Angular 21 / SPA build and linting pipeline
---

# 🚀 Angular GitHub CI Workflow

This workflow automates the **Building, Optimization, and Linting** of the `personalProject` Angular 21 SPA.

## 🛠️ Step-by-Step Instructions

1.  **Environment Setup:** Create a `.github/workflows/angular-ci.yml` file in your repository.
2.  **Configuration:** Paste the following content into the YAML file:

```yaml
name: Angular CI

on:
  push:
    branches: [ "main", "develop" ]
  pull_request:
    branches: [ "main", "develop" ]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    - name: Set up Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '21'
        cache: 'npm'
    - name: Install Dependencies
      run: npm ci
    - name: Lint
      run: npm run lint
    - name: Production Build
      run: npm run build -- --configuration production
    - name: Upload Artifact
      uses: actions/upload-artifact@v4
      with:
        name: angular-dist
        path: dist/personalProject
```

3.  **Verification:** Push the file to GitHub and verify that the build succeeds in the **Actions** tab.
4.  **Deployment Prep:** The `angular-dist` artifact is now ready for deployment to Vercel or your production server.

---

## 🛡️ Best Practices
- **Strict Mode:** Ensure Angular strict mode is enabled in your `tsconfig.json`.
- **Lint First:** Always run linting before building to catch syntax and style issues.
- **Node Version Parity:** Use Node 21 locally and in CI to avoid environment drift.
