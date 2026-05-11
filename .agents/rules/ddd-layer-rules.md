# 📐 DDD Layer Rules

These rules ensure that the **Domain-Driven Design (DDD)** principles are strictly followed in the `personalProject` backend.

---

## 🎯 Constraint 1: Domain-Driven Isolation
The **Domain Layer** must NEVER depend on any other layer. It contains the core logic, entities, and repository interfaces.

## 🎯 Constraint 2: Infrastructure Adherence
The **Infrastructure Layer** must implement the repository interfaces defined in the Domain Layer. It contains HTTP clients, DTOs, and DB-specific code.

## 🎯 Constraint 3: Interface Layer Responsibility
The **Interface/Controller Layer** is responsible only for handling requests, validating input, and delegating to the Application Layer. It should NEVER contain business logic.

## 🎯 Constraint 4: Application Layer Orchestration
The **Application Layer** orchestrates domain objects and calls the Domain Layer for logic. It is the only place where `@Transactional` should ideally be used.

---

## 🛠️ Verification Checklist
- [ ] No Spring/Hibernate annotations are present in Domain Entity classes.
- [ ] Mapper classes (e.g., MapStruct) are used between the Domain and Interface layers.
- [ ] All business logic is encapsulated within Domain Services or Aggregate Roots.
- [ ] Repositories return Domain Objects, not Data Proxies or DTOs.
