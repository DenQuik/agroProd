# agroProd - Guía del Desarrollador y Mandatos del Sistema (GEMINI.md)

Este archivo sirve como manual de instrucciones, arquitectura y estándares de desarrollo para el proyecto **agroProd**. Es la fuente de la verdad para cualquier agente de IA (como Gemini) o desarrollador que trabaje en esta base de código.

---

## 1. Descripción del Proyecto y Arquitectura

**agroProd** (Sistema de Gestión Agroproductiva) es un sistema diseñado para registrar y administrar productores agropecuarios, sus marcas comerciales y sus respectivos predios (fincas). Toda la información está organizada jerárquicamente por ubicación geográfica.

### Stack Tecnológico
- **Entorno de Ejecución (Runtime):** Node.js con TypeScript.
- **Framework Web:** Express 5.x (soporte nativo de rutas asíncronas).
- **Manejador de Base de Datos (ORM):** Prisma 7.x utilizando `@prisma/adapter-mariadb` para conectarse a una base de datos MySQL o MariaDB.
- **Base de Datos:** MySQL / MariaDB (Nombre de la base de datos: `agroprod_db`).
- **Autenticación & Seguridad:** `bcrypt` para hash de contraseñas, `jsonwebtoken` para tokens JWT.
- **Utilerías de Desarrollo:** `tsx` para watch mode y ejecución instantánea en desarrollo sin paso de build separado, y `typescript` para tipado estático estricto.

---

## 2. Convenciones y Mandatos del Código

Para asegurar la consistencia y el correcto funcionamiento del sistema, se deben seguir rigurosamente las siguientes directrices:

### 2.1 Extensiones `.js` en Importaciones Relativas
Debido a la configuración de módulos en TypeScript (`"module": "ESNext"`, `"moduleResolution": "bundler"`, `"target": "ES2023"`) y el uso de ESM (`"type": "module"` en `package.json`), **todas las importaciones relativas dentro del código fuente de TypeScript deben usar explícitamente el sufijo `.js`**.
*   **Correcto:** `import { prisma } from '../lib/prisma.js';`
*   **Incorrecto:** `import { prisma } from '../lib/prisma';`

### 2.2 Singleton de Base de Datos y Ubicación de Cliente Prisma
El cliente de Prisma se genera en una ruta personalizada (`generated/prisma`) en lugar de la ubicación por defecto dentro de `node_modules`. 
*   **Cliente Generado:** Ubicado en `./generated/prisma`
*   **Acceso Centralizado:** No se debe instanciar `PrismaClient` directamente en los controladores o rutas. En su lugar, se debe importar la instancia singleton desde `./lib/prisma.js`:
    ```typescript
    import { prisma } from '../lib/prisma.js';
    ```
*   **Adaptador de Base de Datos:** Prisma está configurado con un adaptador MariaDB para gestionar la base de datos de manera óptima:
    ```typescript
    import { PrismaMariaDb } from "@prisma/adapter-mariadb";
    import { PrismaClient } from "../generated/prisma/client";
    ```

### 2.3 Tipado Estricto de TypeScript
El compilador está configurado con `"strict": true`. 
*   No uses tipos `any` implícitos ni explícitos.
*   Declara explícitamente los tipos de datos en parámetros y retornos de funciones si TypeScript no los infiere automáticamente de forma segura.
*   No uses casts de tipo innecesarios o inseguros (ej. `as any`).

### 2.4 Control de Errores y Express 5
Express 5 gestiona las promesas rechazadas en manejadores asíncronos de forma automática (no requiere middleware especial para atrapar errores no manejados), pero se recomienda encapsular las operaciones con bloques `try/catch` para devolver respuestas limpias y estructuradas en formato JSON.

---

## 3. Modelo de Datos (Esquema de Prisma)

El modelo de datos está estructurado en tres grandes bloques que deben ser mantenidos consistentes:

### 3.1 Ubicación Geográfica
Estructura jerárquica de relación de uno a muchos:
*   **Estado** `Estado`: Contiene id y nombre único.
*   **Municipio** `Municipio`: Pertenece a un `Estado`.
*   **Parroquia** `Parroquia`: Pertenece a un `Municipio` y se conecta directamente con los predios.

### 3.2 Productores y Marcas
Relación 1:1 estricta:
*   **Productor** `Productor`: Almacena la cédula o RIF único, nombre, teléfono, fecha de creación y estado activo.
*   **Marca** `Marca`: Pertenece a un único productor. Almacena la ruta de la imagen física y un hash único (`hashImagen`) para evitar imágenes duplicadas. El borrado de un productor causa el borrado en cascada de su marca asociada (`onDelete: Cascade`).

### 3.3 Predios (Fincas)
*   **Predio** `Predio`: Almacena el nombre de la finca, coordenadas opcionales, sector, ID de parroquia, e ID del productor.
*   Pertenece a un `Productor` (borrado en cascada `onDelete: Cascade`).
*   Pertenece a una `Parroquia` geográfica.

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
    *(Por implementar)*

---

## 6. Estructura del Directorio del Proyecto

A continuación se detalla el propósito de cada directorio clave:

```text
C:\laragon\www\agroProd\
├───package.json            # Configuración de dependencias y scripts de ejecución.
├───tsconfig.json           # Configuración de compilación de TypeScript (ESNext/ES2023).
├───prisma.config.ts        # Configuración del CLI de Prisma.
├───RESUMEN_SISTEMA.md      # Descripción técnica rápida y resumen del estado del software.
├───generated/              # Directorio donde se genera el cliente Prisma personalizado.
│   └───prisma/
├───lib/
│   └───prisma.ts           # Inicialización y exportación del cliente singleton de Prisma con el adaptador MariaDB.
├───prisma/
│   ├───schema.prisma       # Definición de modelos de datos, relaciones y fuente de datos.
│   └───migrations/         # Migraciones SQL controladas por Prisma.
└───src/
    └───index.ts            # Punto de entrada de la aplicación Express y definición de servidor/endpoints.
```

---

## 7. Directrices para Nuevas Rutas y Funcionalidades

1.  **Mantener la modularidad:** Cuando se implementen los controladores para Productores, Marcas, Predios y Ubicaciones, separarlos en carpetas correspondientes (ej. `src/routes/` y `src/controllers/`).
2.  **Validación de Entradas:** Validar siempre los campos clave en las peticiones HTTP (por ejemplo, validación de formato de Cédula/RIF, verificación de número telefónico, y control de hash de marcas).
3.  **Manejo de Archivos:** Las imágenes de las marcas deben gestionarse de manera segura, almacenando su ruta en disco o almacenamiento local y calculando su hash MD5/SHA256 antes de guardarlo para mantener la unicidad en el campo `hashImagen`.
4.  **Uso de la Base de Datos:** Usar transacciones de Prisma (`prisma.$transaction`) si se crean registros dependientes múltiples para evitar estados inconsistentes (por ejemplo, registrar un Productor y su Marca asociada en una misma petición).
