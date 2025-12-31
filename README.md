# E-Commerce Backend API (NestJS + GraphQL + Socket.io)

A fully-featured **E-Commerce Backend API** built with **NestJS**, **TypeScript**, **GraphQL**, and **Socket.io**.  
This backend handles core e-commerce functionalities including authentication, product and order management, real-time updates, and more.  
It is modular, scalable, and can be connected to any frontend (React, Angular, Vue, Flutter, etc.).

---

## Project Description

This project represents the backend of an e-commerce system, designed using **NestJS best practices**.  
It is structured to support:

- User authentication and role-based authorization
- Product management (CRUD)
- Order and cart logic
- GraphQL API for flexible queries and mutations
- Real-time communication using Socket.io
- Database interaction via repository pattern
- Modular architecture with reusable services, guards, interceptors, pipes, and utilities

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

## Technologies Used

- **Node.js**
- **NestJS**
- **TypeScript**
- **GraphQL**
- **Socket.io**
- **npm**
- **Jest** (Testing)

---

## Installation

Clone the repository:

```bash
git clone https://github.com/Abdelrahmangamal0/E-Commerce_Nodejs.git
cd E-Commerce_Nodejs

```

Install dependencies:

```bash
npm install
```

## Running the Application

Run in development mode:

```bash
npm run start:dev
```

Run in production mode:

```bash
npm run start:prod
```

The server will start at:

```
http://localhost:3000
```

---

## Testing

Run unit tests:

```bash
npm run test
```

Run end-to-end tests:

```bash
npm run test:e2e
```

Generate test coverage:

```bash
npm run test:cov
```

---

## API Description

This backend exposes RESTful APIs that handle:

* User authentication and authorization
* Product management
* Orders and cart logic
* Database operations via repository pattern

API endpoints can be consumed by any frontend or mobile client.

---
GraphQL

Query and Mutation endpoints defined per module

Supports flexible querying for users, products, and orders

Socket.io

Real-time notifications for order updates

Event-based messaging for user interactions

Notes

Backend-only project (no frontend UI)

Designed for real-world scalable applications

Modular NestJS structure with reusable components

Supports GraphQL and Socket.io for modern web apps
---

## Deployment

The project can be deployed on:

* Render
* Railway
* Heroku
* VPS using PM2 and Nginx
* AWS 

Ensure environment variables are configured correctly before deployment.

---

## License

This project is licensed under the MIT License.

---

## Author

Abdelrahman Gamal
GitHub: [https://github.com/Abdelrahmangamal0](https://github.com/Abdelrahmangamal0)
