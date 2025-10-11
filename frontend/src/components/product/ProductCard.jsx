import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Typography,
  Button,
  Rating,
  Box,
  IconButton,
  Chip,
} from '@mui/material';
import { ShoppingCart, Favorite, FavoriteBorder, Watch, LocalOffer } from '@mui/icons-material';
import { addItemToCart, fetchCart } from '../../redux/slices/cartSlice';
import { formatCurrency, getStockStatus } from '../../utils/formatters';
import { toast } from 'react-toastify';
import CountdownTimer from '../common/CountdownTimer';

const ProductCard = ({ product }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector(state => state.auth);
  const { available: offers } = useSelector(state => state.offers);
  const [isFavorite, setIsFavorite] = useState(false);
  const [imageError, setImageError] = useState(false);

  const stockStatus = getStockStatus(product.stock);



  // Find the best applicable offer for this product
  const applicableOffer = React.useMemo(() => {
    try {
      if (!offers || !Array.isArray(offers) || offers.length === 0) {
        return null;
      }
      
      console.log('Product ID:', product._id, 'Product Name:', product.name);
      console.log('Available offers:', offers.map(o => ({ name: o.name, products: o.applicableProducts })));
      
      const validOffers = offers.filter(offer => {
        try {
          if (!offer || !offer.active) return false;
          const now = new Date();
          if (now < new Date(offer.startDate) || now > new Date(offer.endDate)) return false;
          
          // Check if product is specifically included
          if (offer.applicableProducts && Array.isArray(offer.applicableProducts) && offer.applicableProducts.length > 0) {
            console.log('Checking product match:', {
              productId: product._id,
              offerProducts: offer.applicableProducts,
              offerProductsDetailed: offer.applicableProducts.map(p => ({ id: p, type: typeof p })),
              includes: offer.applicableProducts.includes(product._id)
            });
            return offer.applicableProducts.includes(product._id);
          }
          
          // Check if category is included
          if (offer.applicableCategories && Array.isArray(offer.applicableCategories) && offer.applicableCategories.length > 0) {
            return offer.applicableCategories.includes(product.category);
          }
          
          // Only apply to all products if BOTH arrays are explicitly empty (not just undefined)
          const hasNoProducts = !offer.applicableProducts || offer.applicableProducts.length === 0;
          const hasNoCategories = !offer.applicableCategories || offer.applicableCategories.length === 0;
          
          // Only show on all products if it's a general offer (no specific targeting)
          return hasNoProducts && hasNoCategories;
        } catch (error) {
          console.warn('Error processing offer:', error);
          return false;
        }
      });
      
      console.log('Valid offers for product:', validOffers);
      
      if (validOffers.length === 0) return null;
      
      return validOffers.sort((a, b) => (b.discountPercentage || 0) - (a.discountPercentage || 0))[0];
    } catch (error) {
      console.warn('Error finding applicable offer:', error);
      return null;
    }
  }, [offers, product._id, product.category]);

  const handleAddToCart = async (e) => {
    console.log('Add to Cart clicked', product);
    e.stopPropagation();
    
    if (!isAuthenticated) {
      toast.info('Please log in to add items to cart');
      navigate('/login', { state: { from: { pathname: `/products/${product._id}` } } });
      return;
    }

    if (product.stock > 0) {
      try {
        await dispatch(addItemToCart({ productId: product._id, quantity: 1 })).unwrap();
        await dispatch(fetchCart());
      toast.success(`${product.name} added to cart!`);
      } catch (error) {
        toast.error(error || 'Failed to add item to cart');
      }
    }
  };

  const handleCardClick = () => {
    navigate(`/products/${product._id}`);
  };

  const handleFavoriteToggle = (e) => {
    e.stopPropagation();
    setIsFavorite(!isFavorite);
    toast.info(isFavorite ? 'Removed from wishlist' : 'Added to wishlist');
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const getProductImage = () => {
    if (imageError || !product.images || product.images.length === 0) {
      return null; // Will show placeholder
    }
    return product.images[0];
  };

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: 3,
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          transform: 'translateY(-8px)',
          boxShadow: '0 12px 40px rgba(0, 0, 0, 0.4), 0 0 20px rgba(0, 255, 255, 0.1)',
          borderColor: 'rgba(0, 255, 255, 0.2)',
        },
      }}
      onClick={handleCardClick}
    >
      <Box sx={{ position: 'relative' }}>
        {getProductImage() ? (
        <CardMedia
          component="img"
          height="240"
            image={getProductImage()}
          alt={product.name}
          sx={{ 
            objectFit: 'cover',
            borderTopLeftRadius: 12,
            borderTopRightRadius: 12,
          }}
            onError={handleImageError}
          />
        ) : (
          <Box
            sx={{
              height: 240,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(255, 255, 255, 0.05)',
              borderTopLeftRadius: 12,
              borderTopRightRadius: 12,
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <Watch sx={{ 
              fontSize: 80, 
              color: '#00FFFF',
              filter: 'drop-shadow(0 0 10px rgba(0, 255, 255, 0.5))'
            }} />
          </Box>
        )}
        <IconButton
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            color: '#FF0066',
            '&:hover': { 
              background: 'rgba(255, 0, 102, 0.2)',
              boxShadow: '0 0 15px rgba(255, 0, 102, 0.4)',
            },
          }}
          onClick={handleFavoriteToggle}
        >
          {isFavorite ? (
            <Favorite sx={{ color: '#FF0066' }} />
          ) : (
            <FavoriteBorder />
          )}
        </IconButton>
        
        {/* Offer Tag - Most Prominent */}
        {applicableOffer && (
          <Chip
            label={`${applicableOffer.discountPercentage}% OFF`}
            size="small"
            icon={<LocalOffer />}
            sx={{
              position: 'absolute',
              top: 8,
              left: 8,
              background: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)',
              color: 'white',
              fontWeight: 700,
              fontSize: '0.8rem',
              boxShadow: '0 4px 12px rgba(255, 107, 107, 0.4)',
              border: 'none',
              zIndex: 2,
              animation: 'pulse 2s infinite',
              '@keyframes pulse': {
                '0%': { transform: 'scale(1)' },
                '50%': { transform: 'scale(1.05)' },
                '100%': { transform: 'scale(1)' },
              },
            }}
          />
        )}
        
        {product.stock === 0 && (
          <Chip
            label="Out of Stock"
            size="small"
            sx={{
              position: 'absolute',
              top: applicableOffer ? 48 : 8,
              left: 8,
              background: 'rgba(255, 0, 102, 0.2)',
              borderColor: 'rgba(255, 0, 102, 0.4)',
              color: '#FF0066',
              border: '1px solid rgba(255, 0, 102, 0.4)',
            }}
          />
        )}
      </Box>

      <CardContent sx={{ flexGrow: 1, pb: 1 }}>
        <Typography 
          gutterBottom 
          variant="h6" 
          component="h3" 
          noWrap
          sx={{
            color: '#ffffff',
            fontFamily: 'Rajdhani, sans-serif',
            fontWeight: 600,
          }}
        >
          {product.name}
        </Typography>
        
        <Typography 
          variant="body2" 
          sx={{ 
            color: 'rgba(255, 255, 255, 0.7)',
            mb: 1,
          }} 
          gutterBottom
        >
          {product.brand}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Rating
            value={product.averageRating || 0}
            precision={0.1}
            size="small"
            readOnly
            sx={{
              '& .MuiRating-iconFilled': {
                color: '#FFD700',
              },
              '& .MuiRating-iconEmpty': {
                color: 'rgba(255, 255, 255, 0.3)',
              },
            }}
          />
          <Typography 
            variant="body2" 
            sx={{ 
              ml: 1,
              color: 'rgba(255, 255, 255, 0.7)',
            }}
          >
            ({product.averageRating?.toFixed(1) || '0.0'})
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Box>
            {applicableOffer ? (
              <Box>
                <Typography 
                  variant="body2" 
                  component="span" 
                  sx={{
                    color: 'rgba(255, 255, 255, 0.6)',
                    textDecoration: 'line-through',
                    display: 'block',
                  }}
                >
                  {formatCurrency(product.price)}
                </Typography>
                <Typography 
                  variant="h6" 
                  component="span" 
                  sx={{
                    color: '#00FFFF',
                    fontWeight: 700,
                    textShadow: '0 0 10px rgba(0, 255, 255, 0.5)',
                  }}
                >
                  {formatCurrency(product.price * (1 - applicableOffer.discountPercentage / 100))}
                </Typography>
                {/* You saved X% message */}
                <Typography variant="caption" color="success.main" sx={{ ml: 1 }}>
                  You saved {Math.round(applicableOffer.discountPercentage)}%!
                </Typography>
                {/* Countdown timer */}
                {applicableOffer.endDate && (
                  <Box sx={{ mt: 0.5 }}>
                    <CountdownTimer endDate={applicableOffer.endDate} />
                  </Box>
                )}
              </Box>
            ) : (
              <Typography 
                variant="h6" 
                component="span" 
                sx={{
                  color: '#00FFFF',
                  fontWeight: 700,
                  textShadow: '0 0 10px rgba(0, 255, 255, 0.5)',
                }}
              >
                {formatCurrency(product.price)}
              </Typography>
            )}
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.5 }}>
            {applicableOffer && (
              <Chip
                label={`${applicableOffer.discountPercentage}% OFF`}
                size="small"
                icon={<LocalOffer />}
                sx={{
                  background: 'rgba(255, 0, 255, 0.2)',
                  borderColor: 'rgba(255, 0, 255, 0.4)',
                  color: '#FF00FF',
                  border: '1px solid rgba(255, 0, 255, 0.4)',
                  fontSize: '0.7rem',
                  height: 20,
                }}
              />
            )}
          <Chip
            label={stockStatus.text}
            size="small"
            sx={{
              background: stockStatus.color === 'success' ? 'rgba(0, 255, 136, 0.2)' : 
                         stockStatus.color === 'warning' ? 'rgba(255, 215, 0, 0.2)' : 
                         'rgba(255, 0, 102, 0.2)',
              borderColor: stockStatus.color === 'success' ? 'rgba(0, 255, 136, 0.4)' : 
                          stockStatus.color === 'warning' ? 'rgba(255, 215, 0, 0.4)' : 
                          'rgba(255, 0, 102, 0.4)',
              color: stockStatus.color === 'success' ? '#00FF88' : 
                     stockStatus.color === 'warning' ? '#FFD700' : '#FF0066',
              border: '1px solid',
              fontSize: '0.75rem',
            }}
          />
          </Box>
        </Box>

        <Typography
          variant="body2"
          sx={{
            color: 'rgba(255, 255, 255, 0.7)',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {product.description}
        </Typography>
      </CardContent>

      <CardActions sx={{ pt: 0, px: 2, pb: 2 }}>
        <Button
          variant="contained"
          fullWidth
          startIcon={<ShoppingCart />}
          onClick={handleAddToCart}
          disabled={product.stock === 0}
          sx={{
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: 2,
            background: product.stock === 0 ? 
              'rgba(255, 255, 255, 0.1)' : 
              'linear-gradient(135deg, #00FFFF 0%, #a020f0 100%)',
            color: product.stock === 0 ? 'rgba(255, 255, 255, 0.5)' : '#0e0e10',
            border: '1px solid rgba(0, 255, 255, 0.3)',
            boxShadow: product.stock === 0 ? 'none' : '0 0 20px rgba(0, 255, 255, 0.3)',
            '&:hover': {
              background: product.stock === 0 ? 
                'rgba(255, 255, 255, 0.1)' : 
                'linear-gradient(135deg, #4DFFFF 0%, #b44df0 100%)',
              boxShadow: product.stock === 0 ? 'none' : '0 0 30px rgba(0, 255, 255, 0.6), 0 0 60px rgba(0, 255, 255, 0.3)',
              transform: product.stock === 0 ? 'none' : 'translateY(-2px) scale(1.02)',
            },
          }}
        >
          {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
        </Button>
      </CardActions>
    </Card>
  );
};

export default ProductCard;