/*
  Warnings:

  - A unique constraint covering the columns `[nombre,estadoId]` on the table `Municipio` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[nombre,municipioId]` on the table `Parroquia` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `Municipio_nombre_estadoId_key` ON `Municipio`(`nombre`, `estadoId`);

-- CreateIndex
CREATE UNIQUE INDEX `Parroquia_nombre_municipioId_key` ON `Parroquia`(`nombre`, `municipioId`);
