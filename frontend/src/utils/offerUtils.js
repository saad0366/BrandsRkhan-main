// Utility functions for offer calculations

export const calculateDiscount = (price, discountPercentage, maxDiscount = null) => {
  const discount = (price * discountPercentage) / 100;
  return maxDiscount && discount > maxDiscount ? maxDiscount : discount;
};

export const getDiscountedPrice = (price, discountPercentage, maxDiscount = null) => {
  const discount = calculateDiscount(price, discountPercentage, maxDiscount);
  return price - discount;
};

export const isOfferApplicable = (offer, product = null, category = null) => {
  if (!offer || !offer.active) return false;
  
  const now = new Date();
  if (now < new Date(offer.startDate) || now > new Date(offer.endDate)) return false;
  
  // Check usage limit
  if (offer.usageLimit !== -1 && offer.usedCount >= offer.usageLimit) return false;
  
  // Check product applicability
  if (offer.applicableProducts && offer.applicableProducts.length > 0) {
    if (!product || !offer.applicableProducts.includes(product._id)) return false;
  }
  
  // Check category applicability
  if (offer.applicableCategories && offer.applicableCategories.length > 0) {
    if (!category && !product?.category) return false;
    const checkCategory = category || product.category;
    if (!offer.applicableCategories.includes(checkCategory)) return false;
  }
  
  return true;
};

export const getBestOfferForProduct = (offers, product) => {
  if (!offers || !product) return null;
  
  const applicableOffers = offers.filter(offer => 
    isOfferApplicable(offer, product, product.category)
  );
  
  if (applicableOffers.length === 0) return null;
  
  // Return offer with highest discount percentage
  return applicableOffers.reduce((best, current) => 
    current.discountPercentage > best.discountPercentage ? current : best
  );
};