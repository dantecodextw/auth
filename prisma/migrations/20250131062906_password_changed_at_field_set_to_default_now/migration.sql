/*
  Warnings:

  - Made the column `password_changed_at` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "User" ALTER COLUMN "password_changed_at" SET NOT NULL,
ALTER COLUMN "password_changed_at" SET DEFAULT CURRENT_TIMESTAMP;
