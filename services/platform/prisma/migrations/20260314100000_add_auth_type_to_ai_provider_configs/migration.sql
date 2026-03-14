-- AlterTable
ALTER TABLE "ai_provider_configs" ADD COLUMN "auth_type" VARCHAR(20) NOT NULL DEFAULT 'api-key';
