import { css } from '@repo/styles/css';

export const styles = {
  otherRewards: css.raw({
    borderTop: '1px solid {colors.background.content}',
  }),
  otherRewardsToggle: css.raw({
    textStyle: 'subline.sm',
    padding: '8px 0 0 0',
    border: '0',
    margin: '0',
    boxShadow: 'none',
    background: 'transparent',
    color: 'text.dark',
    cursor: 'pointer',
    width: '100%',
    textAlign: 'left',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  }),
  otherRewardsList: css.raw({
    paddingTop: '12px',
  }),
  otherRewardsToggleIcon: css.raw({
    width: '16.43px',
    height: '9.41px',
  }),
};
