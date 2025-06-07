/*
  Warnings:

  - The values [AUTH_PASSWORD_RESET,AUTH_KEY_ROTATION] on the enum `AuthEventType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `createdAt` on the `encryption_keys` table. All the data in the column will be lost.
  - You are about to drop the column `expiresAt` on the `encryption_keys` table. All the data in the column will be lost.
  - Added the required column `updated_at` to the `audit_logs` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `eventType` on the `audit_logs` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `updated_at` to the `encryption_keys` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "AuthEventType_new" AS ENUM ('AUTH_LOGIN_SUCCESS', 'AUTH_LOGIN_FAILURE', 'AUTH_LOGOUT', 'AUTH_2FA_SUCCESS', 'AUTH_2FA_FAILURE', 'AUTH_SUSPICIOUS_ACTIVITY', 'AUTH_ACCOUNT_LOCKED');
ALTER TABLE "audit_logs" ALTER COLUMN "eventType" TYPE "AuthEventType_new" USING ("eventType"::text::"AuthEventType_new");
ALTER TYPE "AuthEventType" RENAME TO "AuthEventType_old";
ALTER TYPE "AuthEventType_new" RENAME TO "AuthEventType";
DROP TYPE "AuthEventType_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "audit_logs" DROP CONSTRAINT "audit_logs_userId_fkey";

-- DropForeignKey
ALTER TABLE "user_2fa" DROP CONSTRAINT "user_2fa_userId_fkey";

-- DropIndex
DROP INDEX "audit_logs_eventType_idx";

-- DropIndex
DROP INDEX "audit_logs_userId_idx";

-- DropIndex
DROP INDEX "encryption_keys_active_idx";

-- AlterTable
ALTER TABLE "audit_logs" ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
DROP COLUMN "eventType",
ADD COLUMN     "eventType" "AuthEventType" NOT NULL;

-- AlterTable
ALTER TABLE "encryption_keys" DROP COLUMN "createdAt",
DROP COLUMN "expiresAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_2fa" ADD CONSTRAINT "user_2fa_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
