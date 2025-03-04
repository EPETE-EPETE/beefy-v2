import { Fragment, memo, useMemo } from 'react';
import { legacyMakeStyles } from '../../../../../helpers/mui.ts';
import { styles } from './styles.ts';
import { formatTotalApy } from '../../../../../helpers/format.ts';
import { StatLoader } from '../../../../../components/StatLoader/StatLoader.tsx';
import { useTranslation } from 'react-i18next';
import { css, type CssStyles } from '@repo/styles/css';
import {
  type ApyLabelsType,
  getApyComponents,
  getApyLabelsForType,
} from '../../../../../helpers/apy.ts';
import type { TotalApy } from '../../../../data/reducers/apy.ts';

const useStyles = legacyMakeStyles(styles);

export type ApyDetailsProps = {
  values: TotalApy;
  type: ApyLabelsType;
  css?: CssStyles;
};

export const ApyDetails = memo(function ApyDetails({
  values,
  type,
  css: cssProp,
}: ApyDetailsProps) {
  const { t } = useTranslation();
  const classes = useStyles();
  const formatted = useMemo(() => formatTotalApy(values, <StatLoader />), [values]);
  const { yearly } = getApyComponents();
  const hasComponents = useMemo(() => yearly.some(key => !!values[key]), [yearly, values]);
  const isBoosted = !!values.boostedTotalDaily;

  if (!hasComponents && !isBoosted) {
    return null;
  }

  const labels = getApyLabelsForType(type);

  return (
    <div className={css(styles.apysContainer, cssProp)}>
      <div className={classes.apyTitle}>{t(labels.breakdown)}</div>
      <div className={classes.apys}>
        <div className={classes.apy}>
          <div className={classes.apyLabel}>
            {t(isBoosted ? labels.boostedTotalApy : labels.totalApy)}
          </div>
          <div className={classes.apyValue}>
            {isBoosted ? formatted.boostedTotalApy : formatted.totalApy}
          </div>
        </div>
        {yearly.map(key => (
          <Fragment key={key}>
            {values[key] ? (
              <div className={classes.apy}>
                <div className={classes.apyLabel}>{t(labels[key])}</div>
                <div className={classes.apyValue}>{formatted[key]}</div>
              </div>
            ) : null}
          </Fragment>
        ))}
      </div>
    </div>
  );
});
