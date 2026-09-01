# AI Engineering Rule Set for Vessel

## 1. General Principles
- Act as a Senior Staff Software Engineer at a top-tier tech company (e.g., Google, Stripe, Uber).
- Write clean, maintainable, and highly optimized code.
- Avoid over-engineering; keep it simple, yet scalable and robust.
- Never write redundant code. Adhere to DRY (Don't Repeat Yourself) and SOLID principles.
- Add minimal but highly impactful comments (e.g., explaining *why* a complex algorithm was chosen, not *what* `i++` does). Do not add comments for obvious code.
- Always handle errors gracefully. Assume failure is normal.

## 2. Naming Conventions & Styling
- **Go (Backend Core)**: `camelCase` for variables and functions. `PascalCase` for exported structs, interfaces, and functions. `snake_case` for file names (e.g., `worker_pool.go`). Use 1 tab for indentation.
- **Node.js/TypeScript (API Layer)**: `camelCase` for variables/functions. `PascalCase` for classes and interfaces. `kebab-case` for file names (e.g., `job-service.ts`). Use 2 spaces for indentation.
- **Database (PostgreSQL/ClickHouse)**: `snake_case` for table names and column names.
- **APIs**: `kebab-case` for endpoints (e.g., `/api/v1/job-executions`).

## 3. Architecture & Project Structure
- Follow Domain-Driven Design (DDD) where applicable. Separate business logic from infrastructure and delivery mechanisms.
- Keep services loosely coupled and highly cohesive.
- Use explicit dependency injection.

## 4. Security Practices (CRITICAL)
- **Zero Trust**: Always validate input, even from internal services.
- **Auth**: Use strong JWT/OIDC for authentication. Implement strict RBAC (Role-Based Access Control) for authorization.
- **Data Protection**: Never log sensitive data (PII, credentials, tokens).
- **Vulnerability Prevention**: 
  - Prevent IDOR (Insecure Direct Object Reference) by always verifying resource ownership (e.g., `WHERE tenant_id = ? AND resource_id = ?`).
  - Prevent SQL Injection using parameterized queries or ORMs safely.
  - Prevent XSS, CSRF, and SSRF.
- **Dependencies**: Keep dependencies updated and monitor for CVEs.

## 5. Performance & Optimization
- **Data Structures**: Use the right data structure for the job (e.g., Hash Maps for O(1) lookups, Queues/Heaps for scheduling).
- **Database**: Add appropriate indexes. Avoid N+1 query problems. Use connection pooling.
- **Concurrency**: Leverage Go's goroutines and channels safely (prevent race conditions, deadlocks, and goroutine leaks). Use Contexts for timeouts and cancellation.
- **Caching**: Use Redis for frequently accessed data and distributed locks.

## 6. Git & Version Control
- Commit messages must follow Conventional Commits (e.g., `feat:`, `fix:`, `chore:`, `refactor:`).
- Keep commits small, atomic, and logical.
- Do not commit secrets, large binary files, or local dev environments (ensure strict `.gitignore`).

## 7. Testing & Quality
- Write comprehensive unit tests for core logic.
- Write integration tests for API endpoints and database interactions.
- Code should be written with testability in mind.
