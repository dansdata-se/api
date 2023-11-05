-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "logs";

-- CreateTable
CREATE TABLE "logs"."requests" (
    "id" TEXT NOT NULL,
    "ip" TEXT NOT NULL,
    "ip_country" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "status" INTEGER NOT NULL,
    "user_agent" TEXT NOT NULL,
    "host" TEXT NOT NULL,
    "referer" TEXT NOT NULL,
    "from" TEXT NOT NULL,
    "server_version" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT "requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "logs"."errors" (
    "id" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "stack_trace" TEXT NOT NULL,
    "server_version" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT "errors_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "requests_ip_idx" ON "logs"."requests"("ip");

-- CreateIndex
CREATE INDEX "requests_ip_country_idx" ON "logs"."requests"("ip_country");

-- CreateIndex
CREATE INDEX "requests_url_idx" ON "logs"."requests"("url");

-- CreateIndex
CREATE INDEX "requests_method_idx" ON "logs"."requests"("method");

-- CreateIndex
CREATE INDEX "requests_url_method_idx" ON "logs"."requests"("url", "method");

-- CreateIndex
CREATE INDEX "requests_status_idx" ON "logs"."requests"("status");

-- CreateIndex
CREATE INDEX "requests_user_agent_idx" ON "logs"."requests" USING GIN ("user_agent" gin_trgm_ops);

-- CreateIndex
CREATE INDEX "requests_from_idx" ON "logs"."requests" USING GIN ("from" gin_trgm_ops);

-- CreateIndex
CREATE INDEX "requests_created_at_idx" ON "logs"."requests"("created_at");

-- CreateIndex
CREATE INDEX "requests_server_version_idx" ON "logs"."requests"("server_version");

-- CreateIndex
CREATE INDEX "errors_created_at_idx" ON "logs"."errors"("created_at");
