---
description: Automated Java 21 / Spring Boot 3 / Maven Build and Test Pipeline
---

# 🚀 Maven GitHub CI Workflow

This workflow automates the **Building, Testing, and Quality Assurance** of the `personalProject` backend using **GitHub Actions**.

## 🛠️ Step-by-Step Instructions

1.  **Environment Setup:** Create a `.github/workflows/maven-ci.yml` file in your repository.
2.  **Configuration:** Paste the following content into the YAML file:

```yaml
name: Java CI with Maven

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
    - name: Set up JDK 21
      uses: actions/setup-java@v4
      with:
        java-version: '21'
        distribution: 'temurin'
        cache: maven
    - name: Build with Maven
      run: mvn -B package --file pom.xml
    - name: Test Report
      if: always()
      uses: actions/upload-artifact@v4
      with:
        name: junit-tests
        path: target/surefire-reports
```

3.  **Verification:** Push the file to GitHub and verify that the action triggers successfully in the **Actions** tab.
4.  **Artifact Review:** Download the `junit-tests` artifact to review test failures.

---

## 🛡️ Best Practices
- **PR Protection:** Enable GitHub Branch Protection to ensure CI passes before merging.
- **Fail Fast:** If the build fails, the workflow terminates immediately, preventing broken code from reaching staging.
