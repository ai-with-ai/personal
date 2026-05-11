---
name: java-spring-ddd
description: "Guidelines and code samples for building a Java 21 / Spring Boot 3 backend using Domain-Driven Design (DDD)."
---

# 🛡️ Java Spring DDD Skill

Use this skill when implementing core business logic or architecting the backend for `personalProject`. It ensures that all code follows high-level DDD principles with modern Java 21 syntax.

---

## 🛠️ Architecture Overview

The backend is divided into 4 main layers:
1.  **Interface:** (Controllers, DTOs, Web Resources)
2.  **Application:** (Services, Orchestration, Transactional logic)
3.  **Domain:** (Entities, Aggregates, Value Objects, Domain Services, Repository Interfaces)
4.  **Infrastructure:** (Repositories, External API adapters, DB Configuration)

---

## 💻 Java 21 Code Snippet (Domain Entity)

```java
public record ProjectId(UUID value) implements Serializable {
    public ProjectId {
        Objects.requireNonNull(value, "Project ID cannot be null");
    }
}

@Getter
public class Project {
    private final ProjectId id;
    private String name;
    private ProjectStatus status;

    public Project(ProjectId id, String name) {
        this.id = id;
        this.name = name;
        this.status = ProjectStatus.DRAFT;
    }

    public void publish() {
        if (this.name == null || this.name.isBlank()) {
            throw new DomainException("Project name must be set before publishing");
        }
        this.status = ProjectStatus.PUBLISHED;
    }
}
```

---

## ⚖️ Implementation Checklist
- **Atomic Operations:** All domain logic remains in Domain Services or Aggregates.
- **DTOs Only:** Interface layer only accepts/returns DTOs (using **MapStruct**).
- **No Side Effects:** Domain logic remains pure of external service dependencies.
- **Rich Models:** Prefer rich models over anemic models (e.g., methods for business actions).
