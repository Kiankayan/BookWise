-- CreateEnum
CREATE TYPE "LibraryItemType" AS ENUM ('BOOK', 'DVD', 'AUDIOBOOK', 'REFERENCE_BOOK');

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LibraryItem" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "author" TEXT,
    "nbrPages" INTEGER,
    "runTimeMinutes" INTEGER,
    "type" "LibraryItemType" NOT NULL,
    "isBorrowable" BOOLEAN NOT NULL,
    "borrower" TEXT,
    "borrowDate" TIMESTAMP(3),
    "categoryId" TEXT NOT NULL,

    CONSTRAINT "LibraryItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");

-- AddForeignKey
ALTER TABLE "LibraryItem" ADD CONSTRAINT "LibraryItem_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
