# agroProd - Guía del Desarrollador y Mandatos del Sistema (GEMINI.md)

Este archivo sirve como manual de instrucciones, arquitectura y estándares de desarrollo para el proyecto **agroProd**. Es la fuente de la verdad para cualquier desarrollador o agente de IA que trabaje en esta base de código.

---

## 1. Descripción del Proyecto y Arquitectura

**agroProd** (Sistema de Gestión Agroproductiva) es una aplicación backend diseñada para registrar y administrar productores agropecuarios, sus marcas comerciales y sus respectivos predios (fincas), todos organizados jerárquicamente por ubicación geográfica.

### Stack Tecnológico
- **Entorno de Ejecución (Runtime):** Node.js con TypeScript.
- **Configuración de Módulos:** ESNext con ESM (`"type": "module"` en `package.json`).
- **Framework Web:** Express 5.x (con soporte nativo para rutas asíncronas).
- **ORM / Acceso a Datos:** Prisma 7.x utilizando `@prisma/adapter-mariadb` para conectarse a una base de datos MySQL o MariaDB de forma adaptada.
- **Base de Datos:** MySQL / MariaDB (Base de datos local: `agroprod_db`).
- **Autenticación & Seguridad:** `bcrypt` para hash de contraseñas y `jsonwebtoken` para tokens JWT.
- **Validación de Datos:** `zod` para validaciones de esquemas estrictos.
- **Utilerías de Desarrollo:** `tsx` para watch mode y ejecución directa en desarrollo sin paso de build separado, y `typescript` para tipado estático estricto.

---

## 2. Convenciones y Mandatos del Código

Para asegurar la consistencia y el correcto funcionamiento del sistema, se deben seguir rigurosamente las siguientes directrices:

### 2.1 Extensiones `.js` en Importaciones Relativas
Debido a la configuración de módulos de TypeScript (`"module": "ESNext"`, `"moduleResolution": "bundler"`, `"target": "ES2023"`) y el uso de ESM (`"type": "module"` en `package.json`), **todas las importaciones relativas dentro del código fuente de TypeScript deben usar explícitamente el sufijo `.js`**.
*   **Correcto:** `import { prisma } from '../lib/prisma.js';`
*   **Incorrecto:** `import { prisma } from '../lib/prisma';`

### 2.2 Singleton de Base de Datos y Ubicación de Cliente Prisma
El cliente de Prisma se genera en una ruta personalizada (`generated/prisma`) en lugar de la ubicación por defecto dentro de `node_modules`.
- **Cliente Generado:** Ubicado en `./generated/prisma`
- **Acceso Centralizado:** No se debe instanciar `PrismaClient` directamente en los controladores o rutas. En su lugar, se debe importar la instancia singleton desde `./lib/prisma.js`:
  ```typescript
  import { prisma } from '../lib/prisma.js';
  ```
- **Adaptador de Base de Datos:** Prisma está configurado con un adaptador MariaDB para gestionar la base de datos de manera óptima:
  ```typescript
  import { PrismaMariaDb } from "@prisma/adapter-mariadb";
  import { PrismaClient } from "../generated/prisma/client";
  ```

### 2.3 Tipado Estricto de TypeScript
El compilador está configurado con `"strict": true`.
- No uses tipos `any` implícitos ni explícitos.
- Declara explícitamente los tipos de datos en parámetros y retornos de funciones si TypeScript no los infiere automáticamente de forma segura.
- No uses casts de tipo innecesarios o inseguros (como `as any`).

### 2.4 Control de Errores y Express 5
Express 5 gestiona las promesas rechazadas en manejadores asíncronos de forma automática sin necesidad de middlewares especiales de captura de promesas. Sin embargo, para responder adecuadamente se utiliza:
- **`AppError`**: Una clase de error personalizada para lanzar errores operativos con estados HTTP específicos.
- **`errorMiddleware`**: Middleware centralizado que formatea las respuestas de error ante:
  - Validaciones fallidas de Zod (`ZodError` -> devuelve 400 con detalles).
  - Errores conocidos de Prisma (por ejemplo, llaves duplicadas `P2002` -> devuelve 409 con mensaje limpio).
  - Instancias de `AppError` -> devuelve el código de estado correspondiente y mensaje.
  - Otros errores no controlados -> devuelve 500.

### 2.5 Validación con Zod
Todas las entradas de las peticiones HTTP (parámetros de ruta, query params, cuerpo de petición) deben validarse en los controladores o middlewares utilizando un esquema Zod definido en `src/validators/`.
- Ejemplo de validación en controlador:
  ```typescript
  const body = loginSchema.parse(req.body);
  ```

### 2.6 Constantes y Formatos Estructurados
- **Estados HTTP:** Utilizar siempre el objeto congelado `HTTP_STATUS` definido en `src/constants/http-status.constants.ts` (ej. `HTTP_STATUS.OK`, `HTTP_STATUS.BAD_REQUEST`).
- **Expresiones Regulares:** Para validación de datos estándar como Cédula/RIF o Teléfono, utilizar los patrones regex en `src/constants/regex.constants.ts`.

---

## 3. Modelo de Datos (Esquema de Prisma)

El modelo de datos está estructurado en tres grandes bloques que deben ser mantenidos consistentes:

### 3.1 Ubicación Geográfica (Relación Jerárquica)
- **Estado (`Estado`):** Contiene `id` y `nombre` único.
- **Municipio (`Municipio`):** Pertenece a un `Estado`. Unicidad compuesta por `[nombre, estadoId]`.
- **Parroquia (`Parroquia`):** Pertenece a un `Municipio`. Unicidad compuesta por `[nombre, municipioId]`. Se conecta directamente con los predios.

### 3.2 Productores y Marcas (Relación 1:1 Estricta)
- **Productor (`Productor`):** Almacena `cedulaRif` (único), `nombre`, `apellido`, `telefono`, y estado `activo`.
- **Marca (`Marca`):** Pertenece a un único productor. Almacena `codigo`, `rutaImagen` y un hash único (`hashImagen`) de la imagen para evitar duplicaciones físicas.
  - El borrado de un productor causa el borrado en cascada de su marca asociada (`onDelete: Cascade`).

### 3.3 Predios o Fincas
- **Predio (`Predio`):** Representa las fincas. Almacena `nombre`, `latitud` (Float), `longitud` (Float), `sector`, `parroquiaId` (FK) y `productorId` (FK).
  - Pertenece a un `Productor` (borrado en cascada `onDelete: Cascade`).
  - Pertenece a una `Parroquia` geográfica.

### 3.4 Usuarios del Sistema
- **Usuario (`Usuario`):** Almacena `username` (único), `password` (bcrypt hash), `nombre`, y `rol` ("ADMIN" | "ANALISTA").

---

## 4. Configuración del Entorno y Base de Datos

### 4.1 Variables de Entorno (`.env`)
Para levantar el proyecto localmente, debes crear un archivo `.env` en la raíz del proyecto. Este archivo está excluido del control de versiones. Las variables requeridas son:

```env
PORT=3000
DATABASE_HOST=localhost
DATABASE_USER=root
DATABASE_PASSWORD=cambur
DATABASE_NAME=agroprod_db
DATABASE_URL=mysql://root:cambur@localhost:3306/agroprod_db
```

### 4.2 Inicialización de Base de Datos y Prisma
Una vez configuradas las variables, ejecuta estos comandos para inicializar y sincronizar tu base de datos:

1.  **Instalar dependencias:**
    ```bash
    npm install
    ```
2.  **Sincronizar base de datos con migraciones existentes:**
    ```bash
    npx prisma migrate dev
    ```
3.  **Generar el Cliente Prisma personalizado:**
    ```bash
    npx prisma generate
    ```

---

## 5. Scripts de Ejecución Disponibles

En el `package.json` se proveen los siguientes scripts para el ciclo de vida del proyecto:

*   **Entorno de Desarrollo (con recarga rápida en vivo):**
    ```bash
    npm run dev
    ```
    *Ejecuta `tsx watch src/index.ts` para refrescar el servidor de desarrollo al detectar cambios.*
    
*   **Pruebas (Testing):**
    ```bash
    npm test
    ```
    *Actualmente configurado como placeholder.*

---

## 6. Estructura del Directorio del Proyecto

A continuación se detalla el propósito de cada directorio clave:

```text
C:\laragon\www\agroProd\
├───package.json            # Configuración de dependencias y scripts de ejecución.
├───tsconfig.json           # Configuración de compilación de TypeScript (ESNext/ES2023).
├───prisma.config.ts        # Configuración del CLI de Prisma.
├───lib/
│   └───prisma.ts           # Inicialización y exportación del cliente singleton de Prisma con el adaptador MariaDB.
├───prisma/
│   ├───schema.prisma       # Definición de modelos de datos, relaciones y fuentes de datos de Prisma.
│   ├───seed.ts             # Semillero geopolítico y de usuarios del sistema.
│   └───migrations/         # Migraciones SQL controladas por Prisma.
└───src/
    ├───index.ts            # Punto de entrada de la aplicación Express y definición de servidor/endpoints.
    ├───config/             # Configuraciones del sistema (Entorno, JWT).
    ├───constants/          # Valores constantes globales (Estados HTTP, expresiones regulares).
    ├───controllers/        # Controladores que reciben peticiones HTTP, validan parámetros y llaman a servicios.
    ├───errors/             # Clases de error personalizadas (AppError).
    ├───middlewares/        # Middlewares globales (Error middleware, autenticación, carga de archivos).
    ├───routes/             # Definición de enrutadores de Express estructurados por dominio.
    ├───services/           # Lógica de negocio e interacción con Prisma.
    ├───types/              # Declaración de tipos y extensiones globales de Express.
    ├───utils/              # Funciones utilitarias secundarias.
    └───validators/         # Esquemas de validación de datos con Zod.
```

---

## 7. Directrices para Nuevas Rutas y Funcionalidades

1.  **Modularidad estricta:** Al implementar endpoints para nuevos recursos (ej. marcas, productores, predios), se debe seguir rigurosamente la separación de responsabilidades:
    - **Ruta (`routes`)**: Define los endpoints y asocia middlewares (como `authMiddleware`).
    - **Validador (`validators`)**: Crea los esquemas de Zod para las entradas.
    - **Controlador (`controllers`)**: Parsear peticiones mediante los validadores, ejecutar servicios y retornar respuestas HTTP formateadas con códigos de `HTTP_STATUS`.
    - **Servicio (`services`)**: Aloja la lógica de base de datos e interacción con Prisma.
2.  **Manejo de Transacciones:** Al crear registros dependientes múltiples (por ejemplo, registrar un Productor y su Marca asociada en una misma petición), se debe usar siempre transacciones de Prisma (`prisma.$transaction`) para evitar dejar la base de datos en estados inconsistentes.
3.  **Seguridad:** Proteger endpoints que requieran roles o sesión activa utilizando el `authMiddleware`. El middleware expone los datos del usuario logueado en `req.usuario` (`id`, `username`, `rol`).
4.  **Manejo seguro de imágenes:** Las imágenes de marcas se guardan en el servidor físico. Antes de procesarlas, se debe validar su formato y calcular su hash utilizando algoritmos criptográficos o librerías de hash de imágenes (como `image-hash`), asegurando que se compare con el campo único `hashImagen` en la base de datos antes de permitir el guardado para evitar duplicaciones.
