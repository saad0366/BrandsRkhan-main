// Get the best applicable offer for a product or cart item
export function getApplicableOffer(item, offers) {
  if (!offers || !Array.isArray(offers) || offers.length === 0) return null;
  return offers
    .filter(offer =>
      (Array.isArray(offer.applicableProducts) && offer.applicableProducts.includes(item._id || item.product)) ||
      (Array.isArray(offer.applicableCategories) && offer.applicableCategories.includes(item.category))
    )
    .sort((a, b) => b.discountPercentage - a.discountPercentage)[0] || null;
}

// Get the discounted price for a product or cart item
export function getDiscountedPrice(item, offers) {
  const offer = getApplicableOffer(item, offers);
  if (!offer) return item.price;
  const discounted = item.price * (1 - offer.discountPercentage / 100);
  return Math.max(0, discounted);
} 