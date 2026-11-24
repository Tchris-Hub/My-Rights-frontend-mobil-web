-- CreateEnum
CREATE TYPE "DataRequestType" AS ENUM ('export', 'deletion');

-- CreateEnum
CREATE TYPE "DataRequestStatus" AS ENUM ('pending', 'in_progress', 'completed', 'rejected');

-- CreateEnum
CREATE TYPE "EnquiryStatus" AS ENUM ('pending', 'accepted', 'declined', 'closed');

-- CreateEnum
CREATE TYPE "CaseStatus" AS ENUM ('open', 'referred', 'closed');

-- CreateTable
CREATE TABLE "saved_rights" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "user_id" TEXT NOT NULL,
    "source_type" TEXT NOT NULL,
    "source_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "citation" TEXT,
    "summary" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "saved_rights_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "data_requests" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "user_id" TEXT NOT NULL,
    "request_type" "DataRequestType" NOT NULL,
    "status" "DataRequestStatus" NOT NULL DEFAULT 'pending',
    "details" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "data_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_reports" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "user_id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'open',
    "context_type" TEXT,
    "context_id" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usage_counters" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "user_id" TEXT NOT NULL,
    "feature" TEXT NOT NULL,
    "day" DATE NOT NULL,
    "used" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "usage_counters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "professionals" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "user_id" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "bio" TEXT,
    "location" TEXT,
    "practice_areas" TEXT[],
    "service_areas" TEXT[],
    "languages" TEXT[],
    "availability" TEXT,
    "fee_band" TEXT,
    "verification_status" "VerificationStatus" NOT NULL DEFAULT 'unverified',
    "verified_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "professionals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "firms" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "description" TEXT,
    "location" TEXT,
    "practice_areas" TEXT[],
    "service_areas" TEXT[],
    "languages" TEXT[],
    "fee_band" TEXT,
    "verification_status" "VerificationStatus" NOT NULL DEFAULT 'unverified',
    "verified_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "firms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "firm_members" (
    "firm_id" TEXT NOT NULL,
    "professional_id" TEXT NOT NULL,
    "member_role" TEXT,

    CONSTRAINT "firm_members_pkey" PRIMARY KEY ("firm_id","professional_id")
);

-- CreateTable
CREATE TABLE "enquiries" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "reference_number" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "professional_id" TEXT,
    "firm_id" TEXT,
    "message" TEXT NOT NULL,
    "practice_area" TEXT,
    "status" "EnquiryStatus" NOT NULL DEFAULT 'pending',
    "response_message" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "enquiries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cases" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "user_id" TEXT NOT NULL,
    "situation" TEXT NOT NULL,
    "schema_version" INTEGER NOT NULL,
    "status" "CaseStatus" NOT NULL DEFAULT 'open',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "cases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "case_facts" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "case_id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'person',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "case_facts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "saved_rights_user_id_source_type_source_id_key" ON "saved_rights"("user_id", "source_type", "source_id");

-- CreateIndex
CREATE INDEX "data_requests_user_id_created_at_idx" ON "data_requests"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "user_reports_user_id_created_at_idx" ON "user_reports"("user_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "usage_counters_user_id_feature_day_key" ON "usage_counters"("user_id", "feature", "day");

-- CreateIndex
CREATE UNIQUE INDEX "professionals_user_id_key" ON "professionals"("user_id");

-- CreateIndex
CREATE INDEX "professionals_verification_status_idx" ON "professionals"("verification_status");

-- CreateIndex
CREATE INDEX "firms_verification_status_idx" ON "firms"("verification_status");

-- CreateIndex
CREATE UNIQUE INDEX "enquiries_reference_number_key" ON "enquiries"("reference_number");

-- CreateIndex
CREATE INDEX "enquiries_user_id_created_at_idx" ON "enquiries"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "enquiries_professional_id_status_idx" ON "enquiries"("professional_id", "status");

-- CreateIndex
CREATE INDEX "cases_user_id_updated_at_idx" ON "cases"("user_id", "updated_at");

-- CreateIndex
CREATE INDEX "case_facts_case_id_created_at_idx" ON "case_facts"("case_id", "created_at");

-- AddForeignKey
ALTER TABLE "saved_rights" ADD CONSTRAINT "saved_rights_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "data_requests" ADD CONSTRAINT "data_requests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_reports" ADD CONSTRAINT "user_reports_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usage_counters" ADD CONSTRAINT "usage_counters_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "professionals" ADD CONSTRAINT "professionals_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "firm_members" ADD CONSTRAINT "firm_members_firm_id_fkey" FOREIGN KEY ("firm_id") REFERENCES "firms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "firm_members" ADD CONSTRAINT "firm_members_professional_id_fkey" FOREIGN KEY ("professional_id") REFERENCES "professionals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enquiries" ADD CONSTRAINT "enquiries_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enquiries" ADD CONSTRAINT "enquiries_professional_id_fkey" FOREIGN KEY ("professional_id") REFERENCES "professionals"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enquiries" ADD CONSTRAINT "enquiries_firm_id_fkey" FOREIGN KEY ("firm_id") REFERENCES "firms"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cases" ADD CONSTRAINT "cases_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "case_facts" ADD CONSTRAINT "case_facts_case_id_fkey" FOREIGN KEY ("case_id") REFERENCES "cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;
