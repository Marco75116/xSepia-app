ALTER TABLE "vaults" ADD COLUMN "chain_id" integer DEFAULT 57073 NOT NULL;--> statement-breakpoint
ALTER TABLE "vaults" ADD COLUMN "salt_index" integer DEFAULT 0 NOT NULL;