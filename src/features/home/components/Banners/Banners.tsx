import { memo } from 'react';
import { BusdBannerHome } from '../../../../components/Banners/BusdBanner/BusdBannerHome.tsx';
import { UnstakedClmBanner } from '../../../../components/Banners/UnstakedClmBanner/UnstakedClmBanner.tsx';
import { styled } from '@repo/styles/jsx';
import { FraxBannerHome } from '../../../../components/Banners/FraxBanner/FraxBannerHome.tsx';

export const Banners = memo(function Banners() {
  return (
    <BannerList>
      {/* <AnnouncementBanner /> */}
      <FraxBannerHome />
      <UnstakedClmBanner />
      <BusdBannerHome />
    </BannerList>
  );
});

const BannerList = styled('div', {
  base: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    sm: {
      gap: '24px',
    },
    '& > :last-child': {
      marginBottom: '24px',
    },
  },
});
