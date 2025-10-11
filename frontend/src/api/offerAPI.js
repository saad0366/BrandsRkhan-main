import axiosClient from './axiosClient';

// Get all active offers for users
export const getActiveOffers = async () => {
  return await axiosClient.get('/offers/active');
};

// Get all offers for admin
export const getAllOffers = async () => {
  const response = await axiosClient.get('/admin/offers');
  return response;
};

// Create new offer (admin only)
export const createOffer = async (offerData) => {
  const config = offerData instanceof FormData ? {
    headers: { 'Content-Type': 'multipart/form-data' },
  } : {};
  
  const response = await axiosClient.post('/admin/offers', offerData, config);
  return response;
};

// Update existing offer (admin only)
export const updateOffer = async (id, offerData) => {
  const config = offerData instanceof FormData ? {
    headers: { 'Content-Type': 'multipart/form-data' },
  } : {};
  
  const response = await axiosClient.put(`/admin/offers/${id}`, offerData, config);
  return response;
};

// Delete offer (admin only)
export const deleteOffer = async (id) => {
  return await axiosClient.delete(`/admin/offers/${id}`);
};

// Apply offer to cart
export const applyOfferToCart = async (offerData) => {
  return await axiosClient.post('/offers/apply', offerData);
};

// Validate offer
export const validateOffer = async (offerData) => {
  return await axiosClient.post('/offers/validate', offerData);
};

// Search for specific offer by ID (admin only)
export const searchOffer = async (id) => {
  return await axiosClient.get(`/offers/${id}`);
};

// Legacy functions for backward compatibility
export const fetchOffers = async () => {
  return await getActiveOffers();
};

export const applyOfferCode = async (code) => {
  // This function can be used for applying offer codes if needed
  const offers = await getActiveOffers();
  const offer = offers.find(o => o.code === code && o.isActive);
  if (!offer) {
    throw new Error('Invalid or expired offer code');
  }
  return offer;
};

export const getOfferUsage = async (id) => {
  return await axiosClient.get(`/offers/${id}/usage`);
};