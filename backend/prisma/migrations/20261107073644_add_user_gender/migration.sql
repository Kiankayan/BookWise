-- CreateEnum
CREATE TYPE "UserGender" AS ENUM ('MAN', 'WOMAN');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "gender" "UserGender";
