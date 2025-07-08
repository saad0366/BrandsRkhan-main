import axiosClient from './axiosClient';

// Get all active offers for users
export const getActiveOffers = async () => {
  return await axiosClient.get('/offers/active');
};

// Get all offers for admin
export const getAllOffers = async () => {
  return await axiosClient.get('/offers');
};

// Create new offer (admin only)
export const createOffer = async (offerData) => {
  if (offerData instanceof FormData) {
    return await axiosClient.post('/offers', offerData, {
      headers: { 'Content-Type': undefined },
    });
  }
  return await axiosClient.post('/offers', offerData);
};

// Update existing offer (admin only)
export const updateOffer = async (id, offerData) => {
  if (offerData instanceof FormData) {
    return await axiosClient.put(`/offers/${id}`, offerData, {
      headers: { 'Content-Type': undefined },
    });
  }
  return await axiosClient.put(`/offers/${id}`, offerData);
};

// Delete offer (admin only)
export const deleteOffer = async (id) => {
  return await axiosClient.delete(`/offers/${id}`);
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