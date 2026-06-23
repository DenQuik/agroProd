/*
  Warnings:

  - You are about to drop the column `coordenadas` on the `predio` table. All the data in the column will be lost.
  - Added the required column `latitud` to the `Predio` table without a default value. This is not possible if the table is not empty.
  - Added the required column `longitud` to the `Predio` table without a default value. This is not possible if the table is not empty.
  - Added the required column `apellido` to the `Productor` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `predio` DROP COLUMN `coordenadas`,
    ADD COLUMN `latitud` DOUBLE NOT NULL,
    ADD COLUMN `longitud` DOUBLE NOT NULL;

-- AlterTable
ALTER TABLE `productor` ADD COLUMN `apellido` VARCHAR(191) NOT NULL;

-- CreateTable
CREATE TABLE `Usuario` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `nombre` VARCHAR(191) NOT NULL,
    `rol` VARCHAR(191) NOT NULL,
    `creadoEn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Usuario_username_key`(`username`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
