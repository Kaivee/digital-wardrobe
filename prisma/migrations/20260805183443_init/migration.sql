-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Category` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `wearLimit` INTEGER NOT NULL DEFAULT 3,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Category_name_key`(`name`),
    UNIQUE INDEX `Category_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ClothingItem` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `categoryId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `color` VARCHAR(191) NOT NULL,
    `colorHex` VARCHAR(191) NOT NULL DEFAULT '#C9C4BA',
    `pattern` ENUM('SOLID', 'STRIPED', 'CHECKED', 'FLORAL', 'GRAPHIC', 'TEXTURED', 'OTHER') NOT NULL DEFAULT 'SOLID',
    `formalityScore` INTEGER NOT NULL DEFAULT 3,
    `status` ENUM('CLEAN', 'LAUNDRY', 'ARCHIVED') NOT NULL DEFAULT 'CLEAN',
    `purchasePrice` DOUBLE NOT NULL DEFAULT 0,
    `wearCount` INTEGER NOT NULL DEFAULT 0,
    `wearCountSinceWash` INTEGER NOT NULL DEFAULT 0,
    `imageUrl` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `ClothingItem_userId_status_idx`(`userId`, `status`),
    INDEX `ClothingItem_userId_categoryId_idx`(`userId`, `categoryId`),
    INDEX `ClothingItem_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Outfit` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `occasion` ENUM('CASUAL', 'SMART_CASUAL', 'WORK', 'FORMAL', 'DATE_NIGHT', 'ACTIVE') NOT NULL DEFAULT 'CASUAL',
    `notes` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Outfit_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OutfitItem` (
    `id` VARCHAR(191) NOT NULL,
    `outfitId` VARCHAR(191) NOT NULL,
    `itemId` VARCHAR(191) NOT NULL,
    `position` INTEGER NOT NULL DEFAULT 1,

    UNIQUE INDEX `OutfitItem_outfitId_itemId_key`(`outfitId`, `itemId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `WearLog` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `itemId` VARCHAR(191) NOT NULL,
    `outfitId` VARCHAR(191) NULL,
    `dateWorn` DATE NOT NULL,
    `weatherTemp` INTEGER NULL,
    `notes` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `WearLog_itemId_dateWorn_idx`(`itemId`, `dateWorn`),
    INDEX `WearLog_userId_dateWorn_idx`(`userId`, `dateWorn`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ColorCompatibility` (
    `id` VARCHAR(191) NOT NULL,
    `color1` VARCHAR(191) NOT NULL,
    `color2` VARCHAR(191) NOT NULL,
    `score` INTEGER NOT NULL DEFAULT 5,

    INDEX `ColorCompatibility_color2_idx`(`color2`),
    UNIQUE INDEX `ColorCompatibility_color1_color2_key`(`color1`, `color2`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ClothingItem` ADD CONSTRAINT `ClothingItem_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ClothingItem` ADD CONSTRAINT `ClothingItem_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `Category`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Outfit` ADD CONSTRAINT `Outfit_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OutfitItem` ADD CONSTRAINT `OutfitItem_outfitId_fkey` FOREIGN KEY (`outfitId`) REFERENCES `Outfit`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OutfitItem` ADD CONSTRAINT `OutfitItem_itemId_fkey` FOREIGN KEY (`itemId`) REFERENCES `ClothingItem`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `WearLog` ADD CONSTRAINT `WearLog_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `WearLog` ADD CONSTRAINT `WearLog_itemId_fkey` FOREIGN KEY (`itemId`) REFERENCES `ClothingItem`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `WearLog` ADD CONSTRAINT `WearLog_outfitId_fkey` FOREIGN KEY (`outfitId`) REFERENCES `Outfit`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
