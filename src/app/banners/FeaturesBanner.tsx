import { CheckCircle, LockKey, X } from '@phosphor-icons/react';

import { useTranslationContext } from 'app/i18n/provider/TranslationProvider';

interface FeaturesBannerProps {
  showBanner: boolean;
  onClose: () => void;
}

const FeaturesBanner = ({ showBanner, onClose }: FeaturesBannerProps): JSX.Element => {
  const { translate, translateList } = useTranslationContext();

  const features = translateList('featuresBanner.features');

  const handleOnClick = () => {
    window.open('https://internxt.com/lifetime', '_blank', 'noopener noreferrer');
    onClose();
  };

  return (
    //Background
    <div
      className={`${showBanner ? 'flex' : 'hidden'} fixed
         bottom-0 left-0 right-0 top-0 z-50 h-screen bg-black bg-opacity-50 px-10 lg:px-0`}
    >
      {/* Banner */}
      <div
        className={
          'fixed left-1/2 top-1/2 flex h-auto -translate-x-[50%] -translate-y-[50%] flex-col overflow-hidden rounded-[32px] border-4 border-primary/20 bg-white px-10'
        }
      >
        <button className="absolute  right-0 m-7 flex text-black hover:bg-white/5" onClick={onClose}>
          <X size={32} />
        </button>
        <div className="flex w-max max-w-[900px] flex-col space-x-10 py-14 text-black lg:flex-row">
          <div className="flex w-full flex-col  items-center justify-center space-y-3 text-center lg:items-start lg:justify-between lg:text-start">
            <div className="flex rounded-lg border-4 border-primary/7 px-3 py-1.5">
              <p className="text-2xl font-bold text-primary">{translate('featuresBanner.label')}</p>
            </div>
            <p className="w-full max-w-[400px] text-5xl font-bold leading-tight ">
              {translate('featuresBanner.title')}
            </p>
            {/* <p className="w-full max-w-[328px] text-2xl font-bold leading-tight ">
              {translate('featuresBanner.subtitle')}
            </p> */}
            <div className="flex flex-col items-center space-y-3 lg:items-start">
              <button
                onClick={handleOnClick}
                className="flex w-max items-center rounded-lg bg-primary px-5 py-3 text-lg font-medium text-white  hover:bg-primary-dark"
              >
                {translate('featuresBanner.cta')}
              </button>
              <div className="flex flex-row items-center space-x-3 pt-2 ">
                <CheckCircle size={24} className="" />
                <p className="whitespace-nowrap font-medium lg:text-lg">{translate('featuresBanner.guarantee')}</p>
              </div>
              <p className="text-sm font-medium text-gray-50">{translate('featuresBanner.lastCta')}</p>
            </div>
          </div>
          <div className="hidden w-full items-center lg:flex">
            <div className="flex flex-col">
              <div className="flex flex-col space-y-8">
                {features.map((card) => (
                  <div className="flex flex-row space-x-4" key={card}>
                    <LockKey size={32} className="text-primary" weight="fill" />
                    <p className="text-lg font-semibold ">{card}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeaturesBanner;
