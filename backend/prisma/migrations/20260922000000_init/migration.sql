-- CreateEnum
CREATE TYPE "ChatRole" AS ENUM ('user', 'assistant');

-- CreateEnum
CREATE TYPE "EscalationUrgency" AS ENUM ('low', 'medium', 'high', 'critical');

-- CreateEnum
CREATE TYPE "EscalationStatus" AS ENUM ('pending', 'accepted', 'declined', 'closed');

-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('unverified', 'verified', 'superseded');

-- CreateEnum
CREATE TYPE "LegalSourceType" AS ENUM ('constitution', 'statute', 'regulation', 'case', 'official_guidance', 'other');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "email" TEXT NOT NULL,
    "full_name" TEXT,
    "avatar_url" TEXT,
    "phone_number" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "has_accepted_terms" BOOLEAN NOT NULL DEFAULT false,
    "is_superuser" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat_sessions" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "user_id" TEXT NOT NULL,
    "title" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "chat_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat_messages" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "session_id" TEXT NOT NULL,
    "role" "ChatRole" NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chat_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "legal_escalation_requests" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "reference_number" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "conversation_id" TEXT,
    "reason" TEXT NOT NULL,
    "urgency" "EscalationUrgency" NOT NULL DEFAULT 'medium',
    "status" "EscalationStatus" NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "legal_escalation_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "privacy_consents" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "user_id" TEXT NOT NULL,
    "terms_version" TEXT NOT NULL,
    "privacy_version" TEXT NOT NULL,
    "accepted_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "source" TEXT NOT NULL DEFAULT 'mobile_signup',

    CONSTRAINT "privacy_consents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "legal_sources" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "title" TEXT NOT NULL,
    "jurisdiction" TEXT NOT NULL,
    "source_type" "LegalSourceType" NOT NULL,
    "citation" TEXT,
    "source_url" TEXT,
    "issuing_authority" TEXT,
    "effective_from" DATE,
    "effective_to" DATE,
    "verified_at" TIMESTAMPTZ(6),
    "verification_status" "VerificationStatus" NOT NULL DEFAULT 'unverified',
    "notes" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "legal_sources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organizations" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'Government',

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "legal_aid_centers" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "address" TEXT,
    "phone" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "reviews_count" INTEGER NOT NULL DEFAULT 0,
    "verification_status" TEXT NOT NULL DEFAULT 'unverified',
    "verification_source_url" TEXT,
    "verified_at" TIMESTAMPTZ(6),
    "organization_id" TEXT,

    CONSTRAINT "legal_aid_centers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lawyers" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "category" TEXT,
    "location" TEXT,
    "experience_years" INTEGER NOT NULL DEFAULT 0,
    "cases_won" INTEGER NOT NULL DEFAULT 0,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "reviews_count" INTEGER NOT NULL DEFAULT 0,
    "verification_status" TEXT NOT NULL DEFAULT 'unverified',
    "verification_source_url" TEXT,
    "verified_at" TIMESTAMPTZ(6),
    "bio" TEXT,

    CONSTRAINT "lawyers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "legal_templates" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "title" TEXT NOT NULL,
    "category" TEXT,
    "description" TEXT,
    "content_template" TEXT NOT NULL,
    "fields" JSONB NOT NULL DEFAULT '[]',

    CONSTRAINT "legal_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "constitution_chapters" (
    "id" SERIAL NOT NULL,
    "chapter_number" INTEGER NOT NULL,
    "title" TEXT NOT NULL,

    CONSTRAINT "constitution_chapters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "constitution_sections" (
    "id" SERIAL NOT NULL,
    "chapter_id" INTEGER NOT NULL,
    "section_number" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "key_takeaway" TEXT,

    CONSTRAINT "constitution_sections_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "chat_sessions_user_id_updated_at_idx" ON "chat_sessions"("user_id", "updated_at");

-- CreateIndex
CREATE INDEX "chat_messages_session_id_created_at_idx" ON "chat_messages"("session_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "legal_escalation_requests_reference_number_key" ON "legal_escalation_requests"("reference_number");

-- CreateIndex
CREATE INDEX "legal_escalation_requests_user_id_created_at_idx" ON "legal_escalation_requests"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "legal_escalation_requests_status_created_at_idx" ON "legal_escalation_requests"("status", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "privacy_consents_user_id_terms_version_privacy_version_key" ON "privacy_consents"("user_id", "terms_version", "privacy_version");

-- CreateIndex
CREATE INDEX "constitution_sections_chapter_id_idx" ON "constitution_sections"("chapter_id");

-- AddForeignKey
ALTER TABLE "chat_sessions" ADD CONSTRAINT "chat_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "chat_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "legal_escalation_requests" ADD CONSTRAINT "legal_escalation_requests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "legal_escalation_requests" ADD CONSTRAINT "legal_escalation_requests_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "chat_sessions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "privacy_consents" ADD CONSTRAINT "privacy_consents_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "legal_aid_centers" ADD CONSTRAINT "legal_aid_centers_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "constitution_sections" ADD CONSTRAINT "constitution_sections_chapter_id_fkey" FOREIGN KEY ("chapter_id") REFERENCES "constitution_chapters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

