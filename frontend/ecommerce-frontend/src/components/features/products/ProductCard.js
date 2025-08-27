import { getApplicableOffer, getDiscountedPrice } from '../../../../src/utils/discounts';
import { useSelector } from 'react-redux';
import CountdownTimer from '../../../../src/components/common/CountdownTimer';

const ProductCard = ({ product }) => {
  const { available: offers } = useSelector(state => state.offers);
  const offer = getApplicableOffer(product, offers);
  const discountedPrice = getDiscountedPrice(product, offers);

  return (
    <div>
      <h3>{product.name}</h3>
      {offer ? (
        <>
          <span style={{ textDecoration: 'line-through', color: '#888', marginRight: 8 }}>{product.price}</span>
          <span style={{ color: 'green', fontWeight: 600 }}>{discountedPrice}</span>
          <span style={{ color: 'green', fontWeight: 500, marginLeft: 8 }}>
            -{offer.discountPercentage}% {offer.name || ''}
          </span>
          {/* You saved X% message */}
          <span style={{ color: 'green', fontWeight: 500, marginLeft: 8 }}>
            You saved {Math.round(offer.discountPercentage)}%!
          </span>
          {/* Countdown timer */}
          {offer.endDate && (
            <div style={{ marginTop: 4 }}>
              <CountdownTimer endDate={offer.endDate} />
            </div>
          )}
        </>
      ) : (
        <span>{product.price}</span>
      )}
    </div>
  );
}; 