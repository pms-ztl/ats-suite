-- Module E — offer-letter PDF storage key + candidate accept timestamp on Offer.
-- offerLetterKey holds the object-storage key of the rendered offer-letter PDF
-- (set on approve when storage is configured; NULL otherwise — never fabricated).
-- acceptedAt records when the candidate accepted the offer.
ALTER TABLE "Offer" ADD COLUMN "offerLetterKey" TEXT;
ALTER TABLE "Offer" ADD COLUMN "acceptedAt" TIMESTAMP(3);
