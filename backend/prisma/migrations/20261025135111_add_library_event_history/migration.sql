-- CreateEnum
CREATE TYPE "LibraryEventType" AS ENUM ('ITEM_CREATED', 'ITEM_DELETED', 'CATEGORY_CREATED', 'CATEGORY_DELETED', 'BORROWED', 'RETURNED');

-- CreateTable
CREATE TABLE "LibraryEvent" (
    "id" TEXT NOT NULL,
    "type" "LibraryEventType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "itemId" TEXT,
    "itemTitle" TEXT,
    "categoryId" TEXT,
    "categoryName" TEXT,

    CONSTRAINT "LibraryEvent_pkey" PRIMARY KEY ("id")
);
