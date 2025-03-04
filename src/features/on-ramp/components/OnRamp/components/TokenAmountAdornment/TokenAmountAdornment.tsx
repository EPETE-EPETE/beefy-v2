import { memo, useCallback } from 'react';
import { ButtonAdornment } from '../ButtonAdornment/ButtonAdornment.tsx';
import { useAppDispatch } from '../../../../../../store.ts';
import { onRampFormActions } from '../../../../../data/reducers/on-ramp.ts';
import { AssetsImage } from '../../../../../../components/AssetsImage/AssetsImage.tsx';
import { FormStep } from '../../../../../data/reducers/on-ramp-types.ts';
import { styles } from './styles.ts';

export type TokenAmountAdornmentProps = {
  token: string;
};
export const TokenAmountAdornment = memo(function TokenAmountAdornment({
  token,
}: TokenAmountAdornmentProps) {
  const dispatch = useAppDispatch();
  const handleClick = useCallback(() => {
    dispatch(onRampFormActions.setStep({ step: FormStep.SelectToken }));
  }, [dispatch]);

  return (
    <ButtonAdornment onClick={handleClick}>
      <AssetsImage chainId={undefined} assetSymbols={[token]} size={24} css={styles.icon} />
      {token}
    </ButtonAdornment>
  );
});
