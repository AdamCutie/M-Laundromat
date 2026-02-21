# Backend AI Engineering Rules — Node.js (Express + Mongoose)

This project follows production-grade backend engineering standards for a Node.js runtime.
AI must strictly follow these architectural constraints.

---

# 1. Tech Stack

- Node.js
- Express 5.x
- MongoDB
- Mongoose (async/await)
- JWT auth
- bcryptjs
- dotenv
- cors

---

# 2. Architecture Style

Modular Monolith with layered separation.

project/
│
├── config/ # DB connection, environment config
├── controllers/ # HTTP handlers only
├── middleware/ # auth, validation, error handling
├── models/ # Mongoose models/schemas
├── routes/ # Express routers
├── utils/ # helpers, constants
└── server.js # app entry point

---

# 3. Layer Responsibilities (STRICT)

## Routes (routes/)

- Define endpoints and wire middleware.
- Must NOT contain business logic.
- Must call controller functions.

## Controllers (controllers/)

- Handle HTTP request/response only.
- Orchestrate calls to models/services.
- Must NOT contain complex business rules.
- Should validate inputs (or delegate to middleware).
- Must use async/await and proper error propagation.

## Models (models/)

- Mongoose schema/model definitions only.
- No request/response logic.
- No direct access to Express objects.

## Middleware (middleware/)

- Cross-cutting concerns only: auth, validation, logging, error handling.
- Must NOT contain business logic.

## Utils (utils/)

- Pure helpers and shared constants.
- No side effects unless explicitly documented.

---

# 4. Database Rules

- Use Mongoose for all DB interaction.
- Use async/await for all DB operations.
- Avoid N+1 queries via `populate` only when needed.
- Index frequently filtered fields in schemas.
- Use transactions for multi-document critical updates.

---

# 5. Dependency Patterns

- Prefer dependency injection via module parameters or function args.
- Avoid global mutable state.
- Controllers should not import config directly unless necessary.

---

# 6. Error Handling

- Controllers should throw or pass errors to centralized error middleware.
- Do not leak internal errors to API responses.
- Use consistent error response structure.

---

# 7. Security Standards

- Passwords must be hashed with bcryptjs.
- Never store plain text secrets.
- Use environment variables for configuration.
- Validate all external input.
- Configure CORS explicitly for allowed origins.
- JWTs must be signed with a strong secret and proper expiry.

---

# 8. Async Rules

- Use async/await consistently.
- Never block the event loop with sync IO.
- Do not mix callback-style and async/await in the same flow.

---

# 9. Code Quality Rules

- Use full type hints when using TypeScript (if introduced).
- Follow clean naming conventions.
- Avoid duplicated logic.
- Keep functions small and focused.
- Prefer composition over inheritance.
- No circular imports.

---

# 10. API Design Rules

- RESTful naming conventions.
- Use proper status codes.
- Paginated endpoints must support:
  - page
  - limit
- Responses must follow consistent structure.

---

# 11. Pagination Standard

All list endpoints must:

- Accept page and limit
- Return total count
- Return metadata

Standard response format:

{
"data": [...],
"meta": {
"total": 100,
"page": 1,
"limit": 10
}
}

---

# 12. Logging

- Use structured logging.
- Log important business events.
- Do not log sensitive data.

---

# 13. Testing Expectations

- Business logic must be testable independently.
- Controllers should be testable without a live DB (mock models).
- Use Jest or a chosen test runner consistently.

---

# 14. Migration Policy

- For schema changes, update Mongoose models with backward-compatible defaults.
- If you introduce a migration tool, document it here and use it consistently.

---

# 15. What AI Must Never Do

- Put business logic in routes.
- Access DB directly from routes.
- Expose internal-only fields in API responses.
- Hardcode secrets.
- Mix sync and async incorrectly.
