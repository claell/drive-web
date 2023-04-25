import { useEffect, useState } from 'react';
import Banner from './Banner';

const BannerWrapper = () => {
  const [showBanner, setShowBanner] = useState(false);

  const onClose = () => {
    setShowBanner(false);
    localStorage.setItem('showLifetimeBanner', 'false');
  };

  useEffect(() => {
    if (!localStorage.getItem('showLifetimeBanner')) {
      setTimeout(() => {
        setShowBanner(true);
      }, 10000);
    }
  }, []);

  return <Banner showBanner={showBanner} onClose={onClose} />;
};

export default BannerWrapper;
