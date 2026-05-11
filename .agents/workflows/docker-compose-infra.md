---
description: Local orchestration for Java, Angular, and MySQL development
---

# 🚀 Docker Compose Infra Workflow

This workflow automates the **local development infrastructure** using **Docker Compose** to manage your Java backend, Angular frontend, and MySQL database.

## 🛠️ Step-by-Step Instructions

1.  **Environment Setup:** Create a `docker-compose.yml` file in the root of your project.
2.  **Configuration:** Paste the following content into the file:

```yaml
version: '3.8'

services:
  db:
    image: mysql:8.0
    container_name: personal-db
    restart: always
    environment:
      MYSQL_DATABASE: personalProject
      MYSQL_ROOT_PASSWORD: root
    ports:
      - "3306:3306"
    volumes:
      - db_data:/var/lib/mysql

  backend:
    build: ./backend
    container_name: personal-backend
    ports:
      - "8080:8080"
    environment:
      SPRING_DATASOURCE_URL: jdbc:mysql://db:3306/personalProject
    depends_on:
      - db

  frontend:
    build: ./frontend
    container_name: personal-frontend
    ports:
      - "4200:4200"
    depends_on:
      - backend

volumes:
  db_data:
```

3.  **Run:** Execute `docker-compose up -d` to start the entire environment.
4.  **Verification:** Access the frontend at `http://localhost:4200` and the backend at `http://localhost:8080`.

---

## 🛡️ Best Practices
- **Persistent Storage:** Always use Docker Volumes for the MySQL database to prevent data loss on container restarts.
- **Dependency Management:** Use `depends_on` to ensure the database is ready before the backend starts.
- **Hot-Reloading:** For development, mount your source folders as volumes in the containers.
