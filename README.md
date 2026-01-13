# Debt Manager (Monorepo)

Sistema de gestión de deudas entre amigos. Incluye **API (backend)** y **Web App (frontend)**.

- **Backend:** Node.js + TypeScript + Express + Prisma + PostgreSQL + Redis (caché)
- **Frontend:** React + Vite + TypeScript + TailwindCSS

---

## Tecnologías

### Backend

- Node.js v20+ / v22+
- TypeScript 5.x
- Express.js (según `package.json`, v5.x)
- Prisma ORM 5.22.0
- PostgreSQL 16
- Redis 7
- JWT (Auth)
- Zod (Validación)
- Winston (Logs)
- Jest (Testing)
- PNPM (package manager)

### Frontend

- React + Vite
- TypeScript
- React Router
- Axios
- TailwindCSS

---

## Decisiones técnicas (breve)

### 1) Arquitectura (Clean / Hexagonal)

El backend está organizado por capas para mantener **separación de responsabilidades**, facilitar testing y evitar acoplamiento con frameworks/DB:

- **Domain:** entidades y contratos (interfaces de repositorios)
- **Application:** casos de uso + DTOs (lógica de negocio y reglas)
- **Infrastructure:** Prisma/Redis/JWT/Bcrypt/exporters
- **Presentation:** controllers, routes, middlewares y validators

Esto permite cambiar implementaciones (ej: cambiar Redis por otro caché) sin tocar la lógica del dominio.

### 2) Validación y errores

- Validación con **Zod** (body/query)
- Manejo de errores centralizado (middleware)
- Respuestas consistentes: `{ success, data, message, pagination }`

### 3) Performance

- **Redis** cachea la lista de deudas (paginadas/filtradas)
- Invalidación del caché en create/update/delete/pay
- Endpoint de **stats** para agregaciones rápidas

### 4) Frontend modular (feature-based)

Carpetas por feature (`auth`, `debts`) + `shared` para componentes reutilizables.
Esto mantiene el proyecto escalable y fácil de mantener.

---

## 🗂️ Estructura del proyecto

---

## 📋 Requisitos previos

- Node.js v20 o v22 (recomendado usar NVM)
- PNPM v10+
- Docker y Docker Compose

---

## 🛠️ Despliegue local (paso a paso)

### 1) Clonar el repositorio

```bash
git clone https://github.com/alejandro2096/debt-manager.git
cd debt-manager

2) Instalar dependencias (monorepo)

Desde la raíz:

pnpm install


Si tu monorepo no está configurado con workspaces, instala por carpeta:

cd backend && pnpm install
cd ../frontend && pnpm install

Backend local (con Docker para DB + Redis)
1) Variables de entorno (backend)
cd backend
cp .env.example .env



2) Levantar Postgres y Redis

En backend/:

pnpm docker:up

3) Migraciones y Prisma Client
pnpm prisma:migrate
pnpm prisma:generate

4) Ejecutar backend en desarrollo
pnpm dev


API disponible en:

http://localhost:3000/api/v1

(Opcional) Ver BD en UI
pnpm prisma:studio

Frontend local (Vite)
1) Variables de entorno (frontend)
cd ../frontend
cp .env.example .env


Asegura la URL de la API, por ejemplo:

VITE_API_BASE_URL=http://localhost:3000/api/v1

2) Ejecutar frontend
pnpm dev
```
