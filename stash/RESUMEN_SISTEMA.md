# agroProd - Resumen del Sistema

## Descripción General
Proyecto personal de Programación II: **Sistema de Gestión Agroproductiva** para registrar productores, sus marcas comerciales y predios (fincas), organizados por ubicación geográfica (Estado → Municipio → Parroquia).

---

## Stack Tecnológico

| Capa       | Tecnología                              |
| ---------- | --------------------------------------- |
| Runtime    | Node.js + TypeScript (ESNext, ES2023)  |
| Framework  | Express 5.x                             |
| ORM        | Prisma 7.x + MariaDB Adapter            |
| BD         | MySQL / MariaDB (`agroprod_db`)         |
| Auth       | bcrypt + jsonwebtoken                   |
| Extras     | cors, dotenv, tsx (hot-reload dev)      |

---

## Modelo de Datos (Prisma Schema)

### 1. Ubicación Geográfica
```
Estado (1) ──→ Municipio (N) ──→ Parroquia (N)
```
- **Estado**: id, nombre (único)
- **Municipio**: id, nombre, estadoId (FK)
- **Parroquia**: id, nombre, municipioId (FK)

### 2. Productores y Marcas
```
Productor (1) ──→ Marca (1)
```
- **Productor**: id, cedulaRif (único), nombre, telefono, activo (default true), createdAt
- **Marca**: id, rutaImagen, hashImagen (único), productorId (FK único, borrado en cascada)
  - Relación 1:1 — cada productor tiene una sola marca

### 3. Predios (Fincas)
```
Productor (1) ──→ Predio (N)
Parroquia (1) ──→ Predio (N)
```
- **Predio**: id, nombre, coordenadas (opcional), sector, parroquiaId (FK), productorId (FK, borrado en cascada)

---

## Estado Actual del Proyecto

- **Muy temprano**: solo existe el endpoint `GET /health` que verifica conexión a MySQL
- Prisma Client generado en `generated/prisma/`
- 1 migración ejecutada (`init`)
- Sin tests
- Sin rutas CRUD implementadas aún
- BD apunta a `localhost:3306`, usuario `root`, password `cambur`

---

## Nota
No existe el archivo `gemini.md` en el proyecto.
