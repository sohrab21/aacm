CREATE TABLE "reviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_email" varchar(255) NOT NULL,
	"content_type" varchar(100) NOT NULL,
	"review_mode" varchar(50) NOT NULL,
	"draft" text NOT NULL,
	"context" text DEFAULT '',
	"review" text NOT NULL,
	"rating" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "reviews_user_email_idx" ON "reviews" USING btree ("user_email");--> statement-breakpoint
CREATE INDEX "reviews_created_at_idx" ON "reviews" USING btree ("created_at");