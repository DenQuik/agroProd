-- CreateTable
CREATE TABLE `Estado` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Estado_nombre_key`(`nombre`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Municipio` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(191) NOT NULL,
    `estadoId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Parroquia` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(191) NOT NULL,
    `municipioId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Productor` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `cedulaRif` VARCHAR(191) NOT NULL,
    `nombre` VARCHAR(191) NOT NULL,
    `telefono` VARCHAR(191) NOT NULL,
    `activo` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Productor_cedulaRif_key`(`cedulaRif`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Marca` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `rutaImagen` VARCHAR(191) NOT NULL,
    `hashImagen` VARCHAR(191) NOT NULL,
    `productorId` INTEGER NOT NULL,

    UNIQUE INDEX `Marca_hashImagen_key`(`hashImagen`),
    UNIQUE INDEX `Marca_productorId_key`(`productorId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Predio` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(191) NOT NULL,
    `coordenadas` VARCHAR(191) NULL,
    `sector` VARCHAR(191) NOT NULL,
    `parroquiaId` INTEGER NOT NULL,
    `productorId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Municipio` ADD CONSTRAINT `Municipio_estadoId_fkey` FOREIGN KEY (`estadoId`) REFERENCES `Estado`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Parroquia` ADD CONSTRAINT `Parroquia_municipioId_fkey` FOREIGN KEY (`municipioId`) REFERENCES `Municipio`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Marca` ADD CONSTRAINT `Marca_productorId_fkey` FOREIGN KEY (`productorId`) REFERENCES `Productor`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Predio` ADD CONSTRAINT `Predio_parroquiaId_fkey` FOREIGN KEY (`parroquiaId`) REFERENCES `Parroquia`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Predio` ADD CONSTRAINT `Predio_productorId_fkey` FOREIGN KEY (`productorId`) REFERENCES `Productor`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
