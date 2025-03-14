import { type ComponentType, lazy, memo, Suspense, useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../../../../../store.ts';
import {
  selectTransactMode,
  selectTransactShouldShowClaims,
  selectTransactShouldShowClaimsNotification,
  selectTransactVaultId,
} from '../../../../../data/selectors/transact.ts';
import { transactActions } from '../../../../../data/reducers/wallet/transact.ts';
import { CardHeaderTabs } from '../../../Card/CardHeaderTabs.tsx';
import { transactFetchOptions } from '../../../../../data/actions/transact.ts';
import { TransactMode } from '../../../../../data/reducers/wallet/transact-types.ts';
import { LoadingIndicator } from '../../../../../../components/LoadingIndicator/LoadingIndicator.tsx';

const DepositFormLoader = lazy(() => import('../DepositForm/DepositForm.tsx'));
const ClaimFormLoader = lazy(() => import('../ClaimForm/ClaimForm.tsx'));
const WithdrawFormLoader = lazy(() => import('../WithdrawForm/WithdrawForm.tsx'));

const modeToComponent: Record<TransactMode, ComponentType> = {
  [TransactMode.Deposit]: DepositFormLoader,
  [TransactMode.Claim]: ClaimFormLoader,
  [TransactMode.Withdraw]: WithdrawFormLoader,
};

export const FormStep = memo(function FormStep() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const mode = useAppSelector(selectTransactMode);
  const vaultId = useAppSelector(selectTransactVaultId);
  const showClaim = useAppSelector(state => selectTransactShouldShowClaims(state, vaultId));
  const highlightClaim = useAppSelector(state =>
    selectTransactShouldShowClaimsNotification(state, vaultId)
  );
  const Component = modeToComponent[mode];
  const handleModeChange = useCallback(
    (newMode: string) => {
      dispatch(transactActions.switchMode(parseInt(newMode)));
    },
    [dispatch]
  );
  const modeOptions = useMemo(
    () => [
      { value: TransactMode.Deposit.toString(), label: t('Transact-Deposit') },
      ...(showClaim ? [{ value: TransactMode.Claim.toString(), label: t('Transact-Claim') }] : []),
      { value: TransactMode.Withdraw.toString(), label: t('Transact-Withdraw') },
    ],
    [t, showClaim]
  );

  useEffect(() => {
    // only dispatches if vaultId or mode changes
    dispatch(transactFetchOptions({ vaultId, mode }));
  }, [dispatch, mode, vaultId]);

  return (
    <div>
      <CardHeaderTabs
        selected={mode.toString()}
        options={modeOptions}
        onChange={handleModeChange}
        highlight={highlightClaim ? TransactMode.Claim.toString() : undefined}
      />
      <Suspense fallback={<LoadingIndicator text={t('Transact-Loading')} />}>
        <Component />
      </Suspense>
    </div>
  );
});
