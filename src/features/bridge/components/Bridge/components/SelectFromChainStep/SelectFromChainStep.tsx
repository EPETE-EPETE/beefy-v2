import { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { bridgeActions, FormStep } from '../../../../../data/reducers/wallet/bridge.ts';
import { SearchableList } from '../../../../../../components/SearchableList/SearchableList.tsx';
import { Step } from '../../../../../../components/Step/Step.tsx';
import { useAppDispatch, useAppSelector } from '../../../../../../store.ts';
import { selectBridgeSupportedChainIds } from '../../../../../data/selectors/bridge.ts';
import { ChainListItem } from '../ListItem/ChainListItem.tsx';
import { BalanceEndAdornment } from '../BalanceEndAdornment/BalanceEndAdornment.tsx';
import type { ChainEntity } from '../../../../../data/entities/chain.ts';

const ChainSelector = memo(function ChainSelector() {
  const dispatch = useAppDispatch();
  const options = useAppSelector(selectBridgeSupportedChainIds);

  const handleSelect = useCallback(
    (chainId: ChainEntity['id']) => {
      dispatch(bridgeActions.setFromChain({ chainId }));
    },
    [dispatch]
  );

  return (
    <SearchableList
      options={options}
      onSelect={handleSelect}
      ItemInnerComponent={ChainListItem}
      EndComponent={BalanceEndAdornment}
    />
  );
});

export const SelectFromChainStep = memo(function SelectFromChainStep() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const handleBack = useCallback(() => {
    dispatch(bridgeActions.setStep({ step: FormStep.Preview }));
  }, [dispatch]);

  return (
    <Step stepType="bridge" onBack={handleBack} title={t('Bridge-FromChainStep-Title')}>
      <ChainSelector />
    </Step>
  );
});
