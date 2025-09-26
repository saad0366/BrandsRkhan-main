const Offer = require('../models/Offer');
const { sendOfferExpiryAlert } = require('./sendEmail');

// Set your admin email here or load from env
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@example.com';

// Run scheduled offer automation
async function runOfferAutomation() {
  const now = new Date();
  // 1. Auto-expire offers
  await Offer.updateMany(
    { active: true, endDate: { $lt: now } },
    { $set: { active: false } }
  );
  // 2. Auto-activate scheduled offers
  await Offer.updateMany(
    { active: false, startDate: { $lte: now }, endDate: { $gt: now } },
    { $set: { active: true } }
  );
  // 3. Send admin alerts for offers expiring within 24 hours
  const soon = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const expiringOffers = await Offer.find({
    active: true,
    endDate: { $gt: now, $lte: soon }
  });
  for (const offer of expiringOffers) {
    await sendOfferExpiryAlert(ADMIN_EMAIL, offer);
  }
}

module.exports = { runOfferAutomation }; 