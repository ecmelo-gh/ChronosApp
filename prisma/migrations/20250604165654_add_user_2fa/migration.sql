-- AlterTable
ALTER TABLE "users" ADD COLUMN     "encrypted_password" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "raw_user_meta_data" JSONB;

-- CreateTable
CREATE TABLE "user_2fa" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "secret" TEXT NOT NULL,
    "backupCodes" TEXT[],
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "recoveryEmail" TEXT,
    "lastUsed" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_2fa_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_2fa_userId_key" ON "user_2fa"("userId");

-- AddForeignKey
ALTER TABLE "user_2fa" ADD CONSTRAINT "user_2fa_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
