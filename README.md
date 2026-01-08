# E-Commerce Backend API (NestJS + RESTful API + GraphQL + Socket.io)

A fully-featured E-Commerce Backend API built using NestJS and TypeScript.
The project is designed as a RESTful-first backend, with selective usage of
GraphQL for optimized querying and Socket.io for real-time communication.

This backend handles authentication, users, products, orders, cart logic,
payments, and real-time notifications, and can be connected to any frontend
application such as React, Angular, Vue, or Flutter.

This project follows NestJS best practices and is structured in a modular,
scalable, and production-ready architecture.

---

## Project Description + Structure Overview

The system relies mainly on RESTful APIs to implement the core business logic.
GraphQL is used only in specific scenarios where flexible querying and efficient
data fetching are required. Socket.io is integrated to support real-time features
such as order status updates and live notifications.

The project structure is organized to clearly separate concerns and encourage
clean architecture and reusability.


---

## Folder Structure

```
src/
├── common/
│   ├── decorator/        # Custom decorators
│   ├── dtos/             # Data Transfer Objects
│   ├── entities/         # Shared entities
│   ├── enums/            # Enums used across the app
│   ├── Guard/            # Authentication & authorization guards
│   ├── interceptors/     # Interceptors
│   ├── interface/        # Shared interfaces
│   ├── middleware/       # Global and custom middlewares
│   ├── pipes/            # Validation & transformation pipes
│   ├── services/         # Shared services
│   └── utils/            # Helper utilities
│   └── index.ts
│
├── DB/
│   ├── models/           # Database models
│   ├── repository/       # Data access repositories
│   └── index.ts
│
├── modules/              # Application feature modules
├── app.controller.ts     # Main controller
├── app.module.ts         # Root module
├── app.service.ts        # Core service
├── main.ts               # Application entry point

test/                     # Unit and E2E tests
uploads/                  # Uploaded files
```

---


---

## API Architecture

The backend uses a hybrid API approach:

- RESTful API (Primary):
  Used for authentication, users, products, orders, cart operations, payments,
  and admin workflows.

- GraphQL (Secondary):
  Used for complex read operations, aggregated queries, and optimized data
  fetching where REST is not ideal.

- Socket.io:
  Used for real-time order status updates, notifications, and event-based
  communication.

---

## Technologies Used

- Node.js
- NestJS
- TypeScript
- RESTful API
- GraphQL
- Socket.io
- MongoDB
- Jest

---

## Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/Abdelrahmangamal0/E-Commerce_Nodejs.git
cd E-Commerce_Nodejs
npm install

```

Development mode:

npm run start:dev


Production mode:

npm run start:prod


Server will run on:

http://localhost:3000


API Access

REST API Base URL:

http://localhost:3000/api


GraphQL Endpoint:

http://localhost:3000/graphql

Testing
npm run test
npm run test:e2e
npm run test:cov

Deployment

The project can be deployed on:

Render

Railway

Heroku

VPS using PM2 and Nginx

AWS

Make sure all environment variables are configured correctly before deployment.

Notes

Backend-only project

RESTful API is the main architecture

GraphQL is used as a complementary layer

Designed for real-world scalable applications

Clean and modular NestJS structure

License

MIT License

Author

Abdelrahman Gamal
GitHub: https://github.com/Abdelrahmangamal0
