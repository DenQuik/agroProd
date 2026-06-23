# Registro de Cambios — agroProd Backend

## Fecha: 2026-06-23

---

## ✅ FASE 0: Fundación y Base de Datos

### Schema (`prisma/schema.prisma`)
- **`Productor`**: Se agregó campo `apellido String` para separar nombre completo.
- **`Predio`**: Se reemplazó `coordenadas String?` (opcional) por `latitud Float` + `longitud Float` (ambos obligatorios y tipados).
- **`Municipio`**: Se añadió constraint `@@unique([nombre, estadoId])` para garantizar idempotencia en el seed.
- **`Parroquia`**: Se añadió constraint `@@unique([nombre, municipioId])` por la misma razón.
- **`Usuario`** *(nuevo modelo)*: Gestión de accesos del sistema. Campos: `id`, `username` (único), `password` (hash bcrypt), `nombre`, `rol` (`"ADMIN"` / `"ANALISTA"`), `creadoEn`.
- **Generator**: Se corrigió `provider = "prisma-client.js"` → `"prisma-client"` (causaba error `ENOENT` al ejecutar `prisma generate`).

### Migraciones aplicadas
| Nombre | Descripción |
|--------|-------------|
| `20260623125304_add_apellido_latlon_usuario` | Agrega `apellido` a Productor, reemplaza coordenadas en Predio, crea tabla Usuario |
| `20260623125639_add_unique_municipio_parroquia` | Agrega índices únicos compuestos en Municipio y Parroquia |

### Archivos de soporte (`src/config/`, `src/constants/`, `src/types/`, `src/middlewares/`)
| Archivo | Responsabilidad |
|---------|----------------|
| `src/config/env.config.ts` | Validación estricta de variables de entorno con Zod. Importa `dotenv/config` internamente para garantizar que `.env` esté cargado antes de parsear. Llama a `process.exit(1)` si alguna variable requerida falta. |
| `src/constants/http-status.constants.ts` | Objeto congelado (`Object.freeze`) con constantes semánticas: OK=200, CREATED=201, BAD_REQUEST=400, UNAUTHORIZED=401, CONFLICT=409, INTERNAL=500. |
| `src/constants/regex.constants.ts` | Expresiones regulares para Cédula/RIF venezolano (`^[VEJG]-\d{7,9}-\d$`) y teléfono celular (`^04\d{2}-?\d{7}$`). |
| `src/types/express.d.ts` | Augmentación del tipo `Request` de Express para inyectar `req.usuario?: { id, username, rol }` desde el middleware JWT. |
| `src/middlewares/error.middleware.ts` | Manejador global de errores. Detecta `ZodError` (→ 400 con detalles), errores Prisma por duck typing (→ 409 en P2002), y cualquier otro (→ 500). |

### `.env` — Variables requeridas añadidas
```
PORT=3000
FRONTEND_URL="http://localhost:5173"
JWT_SECRET="super-secret-key-agroprod-2026-development-only"
```

---

## ✅ FASE 1: Seed Geopolítico y Usuario Inicial

### `prisma/seed.ts`
- Siembra la estructura geopolítica de forma **idempotente** (usa `upsert`) para que pueda ejecutarse múltiples veces sin duplicar datos.
- Datos sembrados:
  - **4 estados**: Distrito Capital, Miranda, Zulia, Portuguesa.
  - **9 municipios** con sus parroquias correspondientes.
  - **66 parroquias** en total.
- Crea el usuario administrador inicial (`admin` / `admin123`) con `bcrypt.hash(password, 10)`.
- Cierra la conexión Prisma en bloque `finally`.

---

## ✅ FASE 2: Autenticación (Auth Module)

### Archivos creados
| Archivo | Responsabilidad |
|---------|----------------|
| `src/config/jwt.config.ts` | Exporta `jwtConfig` con `secret` (desde `env.JWT_SECRET`) y `expiresIn: '8h'`. Sin refresh tokens. |
| `src/validators/auth.validator.ts` | Schema Zod para login: `username` (string, trim, min 3) y `password` (string, min 6). |
| `src/services/auth.service.ts` | Función `login(username, password)`: busca usuario, compara hash con `bcrypt.compare`, firma JWT. Retorna `{ token, usuario: { id, username, nombre, rol } }`. Usa el mismo mensaje de error para usuario inexistente y contraseña incorrecta (evita enumeración de usuarios). |
| `src/middlewares/auth.middleware.ts` | Extrae Bearer token del header `Authorization`, verifica con `jwt.verify`, usa type guard `isTokenPayload()` para validar estructura del payload e inyecta `req.usuario`. |
| `src/controllers/auth.controller.ts` | `loginController`: parsea body con Zod (ZodError → 400 automático), llama al servicio, captura errores de credenciales y responde 401. |
| `src/routes/auth.routes.ts` | Define `POST /login` sin middleware de auth (ruta pública de entrada). |

### Endpoint funcional
```
POST /api/auth/login
Body: { "username": "admin", "password": "admin123" }
Response 200: { "token": "...", "usuario": { id, username, nombre, rol } }
Response 401: { "error": "Credenciales inválidas" }
Response 400: { "error": "Datos de entrada inválidos", "detalles": [...] }
```

---

## ✅ FASE 3: Módulo Geografía (Público)

### Archivos creados
| Archivo | Responsabilidad |
|---------|----------------|
| `src/validators/geografia.validator.ts` | Schemas Zod: `getMunicipiosSchema` valida `estadoId` y `getParroquiasSchema` valida `municipioId`, ambos con `z.coerce.number().int().positive()`. |
| `src/services/geografia.service.ts` | Tres funciones: `findEstados()`, `findMunicipiosByEstado(estadoId)`, `findParroquiasByMunicipio(municipioId)`. Todas usan `select` selectivo para no over-fetchear y `orderBy: { nombre: 'asc' }`. |
| `src/controllers/geografia.controller.ts` | Tres controllers delgados: validan params con Zod y delegan al servicio. ZodError se propaga al error middleware global. |
| `src/routes/geografia.routes.ts` | Define 3 endpoints GET públicos (sin auth): `/estados`, `/estados/:estadoId/municipios`, `/municipios/:municipioId/parroquias`. |

### Endpoints funcionales
```
GET /api/geografia/estados
GET /api/geografia/estados/:estadoId/municipios
GET /api/geografia/municipios/:municipioId/parroquias
```

### `src/index.ts` — Estado final
- Importa y monta `authRoutes` en `/api/auth`.
- Importa y monta `geografiaRoutes` en `/api/geografia` (sin auth).
- Registra `errorMiddleware` como último middleware.

---

## 🔜 Próxima fase

**FASE 4: Productores y Predios** — ver `plan.txt` para detalle completo.
