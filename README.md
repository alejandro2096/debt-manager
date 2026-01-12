# Debt Manager API

Sistema de gestión de deudas entre amigos construido con Node.js, TypeScript, Prisma y PostgreSQL.

## 🚀 Tecnologías

- **Node.js** v20+ / v22+
- **TypeScript** 5.x
- **Prisma ORM** 5.22.0
- **PostgreSQL** 16
- **Redis** 7 (Caché)
- **Express.js** 4.x
- **JWT** para autenticación
- **Zod** para validación
- **Jest** para testing
- **PNPM** como package manager

## 🏗️ Arquitectura

El proyecto sigue los principios de **Clean Architecture / Hexagonal Architecture**:
```
src/
├── domain/              # Entidades y lógica de negocio
│   ├── entities/        # User, Debt
│   └── repositories/    # Interfaces de repositorios
├── application/         # Casos de uso
│   ├── use-cases/       # Lógica de aplicación
│   └── dto/            # Data Transfer Objects
├── infrastructure/      # Implementaciones
│   ├── database/       # Prisma, Redis
│   ├── security/       # Bcrypt, JWT
│   └── exporters/      # CSV, JSON
├── presentation/        # Capa de presentación
│   ├── controllers/    # Controladores HTTP
│   ├── routes/         # Definición de rutas
│   ├── middlewares/    # Auth, Validación, Errores
│   └── validators/     # Schemas de Zod
└── shared/             # Utilidades compartidas
    ├── errors/         # Clases de error personalizadas
    ├── types/          # Tipos TypeScript
    └── utils/          # Constantes, Logger
```

## 📋 Requisitos previos

- Node.js v20 o v22 (usar NVM para cambiar versiones)
- PNPM v10+
- Docker y Docker Compose

## 🛠️ Instalación

### 1. Clonar el repositorio
```bash
git clone https://github.com/alejandro2096/debt-manager.git
cd debt-manager
```

### 2. Instalar dependencias
```bash
pnpm install
```

### 3. Configurar variables de entorno
```bash
cp .env.example .env
```

Editar `.env` y configurar tus credenciales.

### 4. Levantar servicios con Docker
```bash
pnpm docker:up
```

Esto levantará PostgreSQL y Redis en contenedores.

### 5. Ejecutar migraciones de Prisma
```bash
pnpm prisma:migrate
```

### 6. Generar Prisma Client
```bash
pnpm prisma:generate
```

## 🏃 Ejecución

### Modo desarrollo
```bash
pnpm dev
```

El servidor estará disponible en `http://localhost:3000`

### Modo producción
```bash
pnpm build
pnpm start
```

## 📚 API Endpoints

### Autenticación

- `POST /api/v1/auth/register` - Registrar nuevo usuario
- `POST /api/v1/auth/login` - Iniciar sesión

### Deudas (requieren autenticación)

- `GET /api/v1/debts` - Listar deudas del usuario
- `POST /api/v1/debts` - Crear nueva deuda
- `GET /api/v1/debts/:id` - Obtener deuda por ID
- `PUT /api/v1/debts/:id` - Actualizar deuda
- `DELETE /api/v1/debts/:id` - Eliminar deuda
- `PATCH /api/v1/debts/:id/pay` - Marcar deuda como pagada
- `GET /api/v1/debts/stats` - Obtener estadísticas
- `GET /api/v1/debts/export?format=json|csv` - Exportar deudas

### Health Check

- `GET /api/v1/health` - Verificar estado del servidor

## 🧪 Testing
```bash
# Ejecutar tests
pnpm test

# Ejecutar tests en modo watch
pnpm test:watch
```

## 📊 Base de datos

### Ver base de datos con Prisma Studio
```bash
pnpm prisma:studio
```

### Modelo de datos

**User:**
- id (UUID)
- email (único)
- password (hasheado con bcrypt)
- name
- timestamps

**Debt:**
- id (UUID)
- creditorId (quien prestó)
- debtorId (quien debe)
- amount (decimal)
- description (opcional)
- status (PENDING | PAID)
- dueDate (opcional)
- paidAt (cuando se marcó como pagada)
- timestamps

## 🔒 Seguridad

- ✅ Contraseñas hasheadas con bcrypt
- ✅ Autenticación JWT con Bearer tokens
- ✅ Rate limiting (100 requests / 15 minutos)
- ✅ CORS configurado
- ✅ Helmet para headers de seguridad
- ✅ Validación de datos con Zod
- ✅ Manejo centralizado de errores

## 📜 Scripts disponibles
```bash
pnpm dev              # Modo desarrollo con hot-reload
pnpm build            # Compilar TypeScript
pnpm start            # Ejecutar en producción
pnpm test             # Ejecutar tests
pnpm test:watch       # Tests en modo watch
pnpm prisma:generate  # Generar Prisma Client
pnpm prisma:migrate   # Ejecutar migraciones
pnpm prisma:studio    # Abrir Prisma Studio
pnpm docker:up        # Levantar Docker Compose
pnpm docker:down      # Detener Docker Compose
```

## 🐳 Docker

El proyecto incluye `docker-compose.yml` con:
- PostgreSQL 16 (puerto 5432)
- Redis 7 (puerto 6379)

Para detener los servicios:
```bash
pnpm docker:down
```

## 📝 Validaciones de negocio

- ✅ No se pueden registrar deudas con valores negativos
- ✅ Una deuda pagada no puede ser modificada
- ✅ Solo el acreedor puede editar o eliminar deudas
- ✅ Solo el acreedor puede marcar deudas como pagadas
- ✅ No se puede crear una deuda con uno mismo
- ✅ El monto debe estar entre 0.01 y 999,999,999.99

## 🎯 Características implementadas

### Core
- ✅ Registro e inicio de sesión con JWT
- ✅ CRUD completo de deudas
- ✅ Filtrado de deudas (por estado, acreedor, deudor)
- ✅ Paginación de resultados
- ✅ Marcar deudas como pagadas
- ✅ Estadísticas de deudas por usuario

### Extra
- ✅ Exportar deudas en JSON o CSV
- ✅ Agregaciones (total pagado, saldo pendiente)
- ✅ Caché con Redis
- ✅ Logging con Winston
- ✅ Rate limiting
- ✅ Clean Architecture
- ✅ Validación con Zod
- ✅ Manejo de errores centralizado

## 📄 Licencia

MIT

## 👨‍💻 Autor

**Alejandro Molina**
- GitHub: [@alejandro2096](https://github.com/alejandro2096)

---

**Prueba Técnica - Double V Partners NYX**
*Agosto 2025*