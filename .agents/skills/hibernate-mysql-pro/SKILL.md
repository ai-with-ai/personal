---
name: hibernate-mysql-pro
description: "Optimization guidelines for building a reliable, high-performance MySQL 8+ database with Hibernate ORM."
---

# 💾 Hibernate & MySQL Pro Skill

Use this skill when designing the entity relationships, migrations, or query logic for `personalProject`.

---

## 🛠️ Schema Best Practices

- **Primary Keys:** Use `BIGINT` or `UUID` (Project-level preference) for all primary keys.
- **Explicit Relationships:** Use foreign key constraints to maintain referential integrity.
- **Case Sensitivity:** MySQL on Linux is case-sensitive for table names; avoid using uppercase letters in table names.
- **Indexes:** Always index frequently used filter columns (e.g., `user_id`, `created_at`, `status`).

---

## 💻 Hibernate Snippet (Entity Configuration)

```java
@Entity
@Table(name = "projects")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ProjectEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    private ProjectStatus status;

    @CreationTimestamp
    private LocalDateTime createdAt;
}
```

---

## ⚖️ Performance Checklist
- [ ] NO N+1: Use `@EntityGraph` or `FETCH JOIN` where associations are needed.
- [ ] Lazy Loading: Default all `@OneToMany` and `@ManyToMany` to `FetchType.LAZY`.
- [ ] Batched Inserts: Configure `hibernate.jdbc.batch_size` to improve bulk performance.
- [ ] DB Migrations: Use **Flyway** for version-controlled schema evolution.
