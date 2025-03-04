import { memo } from 'react';
import { useAppSelector } from '../../../../../../store.ts';
import { selectTransactSelectedQuoteOrUndefined } from '../../../../../data/selectors/transact.ts';
import type { ZapQuote } from '../../../../../data/apis/transact/transact-types.ts';
import {
  isZapFeeDiscounted,
  isZapQuote,
} from '../../../../../data/apis/transact/transact-types.ts';
import { Value } from './Value.tsx';
import { Label } from './Label.tsx';
import { useTranslation } from 'react-i18next';
import { LabelTooltip } from './LabelTooltip.tsx';
import { formatPercent } from '../../../../../../helpers/format.ts';
import { legacyMakeStyles } from '../../../../../../helpers/mui.ts';
import { css } from '@repo/styles/css';

const useStyles = legacyMakeStyles({
  original: css.raw({
    color: 'text.dark',
    textDecoration: 'line-through',
  }),
  discounted: css.raw({
    color: 'text.light',
    background: 'extracted1431',
    padding: '0 4px',
    borderRadius: '4px',
    marginRight: '10px',
  }),
});

export const MaybeZapFees = memo(function MaybeZapFees() {
  const quote = useAppSelector(selectTransactSelectedQuoteOrUndefined);
  const isZap = quote && isZapQuote(quote);

  if (!isZap) {
    return null;
  }

  return <ZapFees quote={quote} />;
});

type ZapFeesProps = {
  quote: ZapQuote;
};
const ZapFees = memo(function ZapFees({ quote }: ZapFeesProps) {
  const { t } = useTranslation();
  const classes = useStyles();
  const { fee } = quote;
  const hasDiscountFee = isZapFeeDiscounted(fee);

  return (
    <>
      <Label>
        {t('Transact-Fee-Zap')} <LabelTooltip title={t('Transact-Fee-Zap-Explainer')} />
      </Label>
      <Value>
        {hasDiscountFee ? (
          <>
            <span className={classes.discounted}>{formatPercent(fee.value, 2)}</span>
            <span className={classes.original}>{formatPercent(fee.original, 2)}</span>
          </>
        ) : (
          formatPercent(fee.value)
        )}
      </Value>
    </>
  );
});
