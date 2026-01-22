# Internal Tools API

Technical test – REST API for managing internal SaaS tools.

## Tech stack

- Node.js / TypeScript
- NestJS
- Prisma ORM
- MySQL (Docker)
- Swagger (OpenAPI)

## Getting started

### Database

A Docker environment is provided as part of the technical test.

Run the database environment from the provided back_env directory:

docker compose --profile mysql up -d

The database is automatically initialized with sample data.

### API

Install dependencies:

pnpm install

Start the API:

pnpm run start:dev

The API will be available at:

- Base URL: http://localhost:3000/api
- Swagger documentation: http://localhost:3000/api/docs

## Configuration

The application uses environment variables for configuration.

Create a `.env` file based on the provided `.env.example` file and adjust values if needed.

## Project architecture

The project follows a standard NestJS architecture:

- Feature-based modules (example: tools)
- DTO-based validation using class-validator
- Centralized error handling using exception filters
- Prisma as the database access layer

## API documentation

All endpoints are documented and testable via Swagger:

http://localhost:3000/api/docs
