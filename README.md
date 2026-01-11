# Debt Manager API

Sistema de gestión de deudas entre amigos construido con Node.js, TypeScript, Prisma y PostgreSQL.

## 🚀 Tecnologías

- **Node.js** v20+
- **TypeScript** 5.x
- **Prisma ORM** 5.22.0
- **PostgreSQL** 16
- **Redis** 7 (Caché)
- **Express.js**
- **Jest** (Testing)
- **PNPM** (Package Manager)

## 📋 Requisitos previos

- Node.js v20 o superior
- PNPM v10+
- Docker y Docker Compose

## 🛠️ Instalación

1. Clonar el repositorio:
```bash
git clone https://github.com/alejandro2096/debt-manager.git
cd debt-manager
```

2. Instalar dependencias:
```bash
pnpm install
```

3. Configurar variables de entorno:
```bash
cp .env.example .env
```

4. Levantar servicios con Docker:
```bash
pnpm docker:up
```

5. Ejecutar migraciones de Prisma:
```bash
pnpm prisma:migrate
```

6. Generar Prisma Client:
```bash
pnpm prisma:generate
```

## 🏃 Ejecución

### Modo desarrollo:
```bash
pnpm dev
```

### Modo producción:
```bash
pnpm build
pnpm start
```

## 🧪 Testing
```bash
# Ejecutar tests
pnpm test

# Ejecutar tests en modo watch
pnpm test:watch
```

## 📚 Scripts disponibles

- `pnpm dev` - Inicia el servidor en modo desarrollo
- `pnpm build` - Compila TypeScript a JavaScript
- `pnpm start` - Inicia el servidor en producción
- `pnpm test` - Ejecuta los tests con cobertura
- `pnpm prisma:generate` - Genera Prisma Client
- `pnpm prisma:migrate` - Ejecuta migraciones
- `pnpm prisma:studio` - Abre Prisma Studio
- `pnpm docker:up` - Levanta contenedores
- `pnpm docker:down` - Detiene contenedores

## 🏗️ Arquitectura

El proyecto sigue los principios de **Clean Architecture**:
```
src/
├── domain/              # Entidades y lógica de negocio
├── application/         # Casos de uso
├── infrastructure/      # Implementaciones (DB, cache, etc)
├── presentation/        # Controllers y routes
└── shared/             # Utilidades compartidas
```

## 📝 Modelo de datos

### User
- id (UUID)
- email (único)
- password (encriptado)
- name
- timestamps

### Debt
- id (UUID)
- creditorId (quien prestó)
- debtorId (quien debe)
- amount (decimal)
- description
- status (PENDING | PAID)
- dueDate
- paidAt
- timestamps

## 🔒 Seguridad

- Contraseñas hasheadas con bcrypt
- Autenticación JWT
- Rate limiting
- CORS configurado
- Helmet para headers de seguridad

## 📄 Licencia

MIT

## 👨‍💻 Autor

Alejandro Molina