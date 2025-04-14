/*
  Warnings:

  - The values [SCHEDULED,BOOKED] on the enum `RideStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "RideStatus_new" AS ENUM ('IN_PROGRESS', 'COMPLETED', 'ACCEPTED', 'REJECTED', 'PENDING', 'CANCELLED');
ALTER TABLE "RideGiven" ALTER COLUMN "status" TYPE "RideStatus_new" USING ("status"::text::"RideStatus_new");
ALTER TABLE "Booking" ALTER COLUMN "status" TYPE "RideStatus_new" USING ("status"::text::"RideStatus_new");
ALTER TYPE "RideStatus" RENAME TO "RideStatus_old";
ALTER TYPE "RideStatus_new" RENAME TO "RideStatus";
DROP TYPE "RideStatus_old";
COMMIT;
