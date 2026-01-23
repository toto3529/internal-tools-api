# Internal Tools API

Technical test – REST API for managing internal SaaS tools.

This project implements a RESTful API that allows an organization to manage the SaaS tools used internally (catalog, costs, departments, and usage metrics).

The implementation strictly follows the requirements of Part 1 of the technical test.

---

## Tech Stack

- Node.js
- TypeScript
- NestJS
- Prisma ORM
- MySQL (Docker)
- Swagger / OpenAPI

---

## Quick Start

### 1) Start the database (Docker)

A Docker environment is provided for MySQL.

docker compose --profile mysql up -d

---

### 2) Install dependencies

pnpm install

---

### 3) Start the API

pnpm run start:dev

---

### 4) Access URLs

Base API URL  
http://localhost:3000/api

Swagger / OpenAPI documentation  
http://localhost:3000/api/docs

---

## Configuration

Create a .env file from the provided .env.example file and adjust values if needed (database connection, port, etc.).

cp .env.example .env

---

## API Scope – Part 1

This project only implements the features explicitly requested in Part 1 of the statement.

Anything not mentioned in Part 1 (authentication, authorization, caching, background jobs, advanced metrics, etc.) is intentionally out of scope.

---

## Endpoints

### GET /api/tools/health

Returns basic API health information.

Response includes:

- tools_count: total number of tools stored in database

---

### GET /api/tools

Returns a list of tools.

Features:

- Combinable filters:
  - department
  - status
  - category
  - min_cost
  - max_cost

- Pagination (optional):
  - page
  - limit

- Sorting:
  - sort_by: name | cost | date
  - order: asc | desc

Behavior:

- When no results match the filters, an empty data array is returned
- Category name is resolved in the response

Response structure:

- data: list of tools
- total: total number of tools in database
- filtered: number of tools matching filters
- filters_applied: echo of provided query parameters

---

### GET /api/tools/:id

Returns detailed information about a single tool.

Includes:

- Tool details
- total_monthly_cost
- usage_metrics for the last 30 days:
  - total_sessions
  - avg_session_minutes

Error handling:

- Returns 404 if the tool does not exist

---

### POST /api/tools

Creates a new tool.

Validations:

- name: required, 2 to 100 characters, unique
- vendor: required, maximum 100 characters
- website_url: must be a valid URL if provided
- monthly_cost: number greater than or equal to 0, maximum 2 decimals
- owner_department: must be a valid enum value
- category_id: must exist in database

Default values:

- status is set to active
- active_users_count is set to 0

Returns the created tool.

---

### PUT /api/tools/:id

Updates an existing tool.

Rules:

- The tool must exist (404 otherwise)
- Same validations as POST apply for modified fields
- status must be one of: active, deprecated, trial
- Fields not provided in the request are preserved
- updated_at is automatically updated

---

## Error Handling

All errors follow a consistent JSON format.

### 400 – Bad Request (validation failed)

```json
{
  "error": "Validation failed",
  "details": {
    "field": "reason"
  }
}
```

---

### 404 – Not Found

```json
{
  "error": "Tool not found",
  "message": "Tool with ID 999 does not exist"
}
```

---

### 409 – Conflict

Returned when a uniqueness constraint is violated.

Example (duplicate tool name):

```json
{
  "error": "Validation failed",
  "details": {
    "name": "Tool name must be unique"
  }
}
```

---

### 500 – Internal Server Error

```json
{
  "error": "Internal server error",
  "message": "Database connection failed"
}
```

---

## Swagger / OpenAPI

All endpoints are documented and testable via Swagger:

http://localhost:3000/api/docs

---

## Tests

No automated test suite is implemented.

Endpoint behavior, input validation and error handling are manually verified using the Swagger / OpenAPI interface, which allows direct execution and inspection of requests and responses.
