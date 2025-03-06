import { legacyMakeStyles } from '../../helpers/mui.ts';
import { css, cx } from '@repo/styles/css';
import { isEqual, sortedUniq, uniq } from 'lodash-es';
import { memo, type RefObject, useCallback } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import type { ChainEntity } from '../../features/data/entities/chain.ts';
import { dataLoaderActions } from '../../features/data/reducers/data-loader.ts';
import type { BeefyState } from '../../redux-types.ts';
import { styles } from './styles.ts';
import { useAppDispatch, useAppSelector } from '../../store.ts';
import CloseIcon from '../../images/icons/mui/Close.svg?react';
import type {
  DataLoaderState,
  LoaderState,
} from '../../features/data/reducers/data-loader-types.ts';
import {
  selectCurrentChainId,
  selectIsWalletConnected,
  selectWalletAddressIfKnown,
} from '../../features/data/selectors/wallet.ts';
import { selectChainById, selectEolChainIds } from '../../features/data/selectors/chains.ts';
import { getNetworkSrc } from '../../helpers/networkSrc.ts';
import iconUnsupportedChain from '../../images/icons/navigation/unsuported-chain.svg';
import { entries } from '../../helpers/object.ts';
import {
  isLoaderPending,
  isLoaderRejected,
} from '../../features/data/selectors/data-loader-helpers.ts';
import { styled } from '@repo/styles/jsx';
import { DropdownTrigger } from '../Dropdown/DropdownTrigger.tsx';
import { DropdownProvider } from '../Dropdown/DropdownProvider.tsx';
import { DropdownContent } from '../Dropdown/DropdownContent.tsx';

const useStyles = legacyMakeStyles(styles);

const ActiveChain = ({ chainId }: { chainId: ChainEntity['id'] | null }) => {
  const classes = useStyles();

  return (
    <>
      <div className={classes.line} />
      <div className={classes.chain} style={{ textDecoration: 'none' }}>
        <img alt={chainId ?? ''} src={chainId ? getNetworkSrc(chainId) : iconUnsupportedChain} />
      </div>
    </>
  );
};

export const NetworkStatus = memo(function NetworkStatus({
  anchorEl,
  isOpen: isUserOpen,
  isOtherOpen,
  onOpen,
  onClose,
}: {
  anchorEl: RefObject<HTMLElement>;
  isOpen: boolean;
  isOtherOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}) {
  const classes = useStyles();
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const isAutoOpen = useAppSelector(state => state.ui.dataLoader.statusIndicator.open);
  const open = isUserOpen || (isAutoOpen && !isOtherOpen);
  const chainsById = useAppSelector(state => state.entities.chains.byId);
  const handleClose = useCallback(() => {
    if (isAutoOpen) {
      dispatch(dataLoaderActions.closeIndicator());
    }
    onClose();
  }, [dispatch, onClose, isAutoOpen]);
  const handleToggle = useCallback(() => {
    if (open) {
      handleClose();
    } else {
      onOpen();
    }
  }, [open, handleClose, onOpen]);
  const setOpen = useCallback(
    (shouldOpen: boolean) =>
      dispatch(shouldOpen ? dataLoaderActions.openIndicator() : dataLoaderActions.closeIndicator()),
    [dispatch]
  );
  const isWalletConnected = useAppSelector(selectIsWalletConnected);
  const currentChainId = useAppSelector(selectCurrentChainId);

  const rpcErrors = useNetStatus<ChainEntity['id'][]>(findChainIdMatching, isLoaderRejected);
  const rpcPending = useNetStatus<ChainEntity['id'][]>(findChainIdMatching, isLoaderPending);
  const beefyErrors = useNetStatus(findBeefyApiMatching, isLoaderRejected);
  const beefyPending = useNetStatus(findBeefyApiMatching, isLoaderPending);
  const configErrors = useNetStatus(findConfigMatching, isLoaderRejected);
  const configPending = useNetStatus(findConfigMatching, isLoaderPending);

  const hasAnyError = rpcErrors.length > 0 || beefyErrors.length > 0 || configErrors.length > 0;
  const hasAnyLoading =
    rpcPending.length > 0 || beefyPending.length > 0 || configPending.length > 0;

  const colorClasses = cx(
    !hasAnyError && !hasAnyLoading && 'success',
    hasAnyError && 'warning',
    hasAnyLoading && 'loading',
    !hasAnyLoading && 'notLoading'
  );
  const pulseClassName = cx(classes.pulseCircle, colorClasses);

  return (
    <DropdownProvider
      open={open}
      onChange={setOpen}
      variant="dark"
      placement="bottom-end"
      reference={anchorEl}
    >
      <DropdownButton onClick={handleToggle}>
        <div className={classes.circleOuter}>
          <div className={cx(classes.circle, colorClasses)}>
            <div className={pulseClassName} />
            <div className={pulseClassName} />
            <div className={pulseClassName} />
            <div className={pulseClassName} />
          </div>
        </div>
        {isWalletConnected && <ActiveChain chainId={currentChainId} />}
      </DropdownButton>
      <DropdownContent css={styles.dropdown} gap="none">
        <div className={classes.titleContainer}>
          <div className={classes.title}>
            {isWalletConnected ? (
              currentChainId ? (
                <Trans
                  t={t}
                  i18nKey="NetworkStatus-Connected-To"
                  components={{ chain: <ConnectedChain chainId={currentChainId} /> }}
                />
              ) : (
                t('Network-Unsupported')
              )
            ) : (
              t('NetworkStatus-NoWallet')
            )}
          </div>
          <CloseIcon onClick={handleClose} className={classes.cross} />
        </div>
        <div className={classes.content}>
          <div className={classes.contentTitle}>{t('NetworkStatus-Status')}</div>
          <div className={classes.contentDetail}>
            {hasAnyError ? (
              <>
                {rpcErrors.map(chainId => (
                  <div className={classes.popoverLine} key={chainId}>
                    <div className={cx(classes.circle, 'warning', 'circle')} />
                    <div>{t('NetworkStatus-RpcError', { chain: chainsById[chainId]!.name })}</div>
                  </div>
                ))}
                {(beefyErrors.length > 0 || configErrors.length > 0) && (
                  <div className={classes.popoverLine}>
                    <div className={cx(classes.circle, 'warning', 'circle')} />
                    <div>{t('NetworkStatus-BeefyError')}</div>
                  </div>
                )}
                <div className={css(styles.popoverLine, styles.popoverHelpText)}>
                  {t('NetworkStatus-HelpText-Error')}
                </div>
              </>
            ) : hasAnyLoading ? (
              <>
                <div className={classes.popoverLine}>
                  <div className={cx(classes.circle, 'loading', 'circle')} />
                  {t('NetworkStatus-Title-Loading')}
                </div>
              </>
            ) : (
              <>
                <div className={classes.popoverLine}>
                  <div className={cx(classes.circle, 'success', 'circle')} />
                  {t('NetworkStatus-Title-OK')}
                </div>
              </>
            )}
          </div>
        </div>
      </DropdownContent>
    </DropdownProvider>
  );
});

const DropdownButton = styled(DropdownTrigger.button, {
  base: {
    height: '40px',
    border: 'none',
    borderRadius: '8px',
    columnGap: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    backgroundColor: 'transparent',
  },
});

const ConnectedChain = memo(function ConnectedChain({ chainId }: { chainId: ChainEntity['id'] }) {
  const chain = useAppSelector(state => selectChainById(state, chainId));
  return (
    <>
      <img alt={chainId} src={getNetworkSrc(chainId)} />
      {chain.name}
    </>
  );
});

function useNetStatus<
  R extends string[],
  S extends (state: BeefyState, matcher: (state: LoaderState) => boolean) => R = (
    state: BeefyState,
    matcher: (state: LoaderState) => boolean
  ) => R,
  M extends (state: LoaderState) => boolean = (state: LoaderState) => boolean,
>(selector: S, matcher: M) {
  return useAppSelector<R>(
    state => selector(state, matcher),
    // since we are returning a new array each time we select
    // use a comparator to avoid useless re-renders
    stringArrCompare
  );
}

const stringArrCompare = (left: string[], right: string[]) => {
  return isEqual(sortedUniq(left), sortedUniq(right));
};

const findChainIdMatching = (state: BeefyState, matcher: (loader: LoaderState) => boolean) => {
  const chainIds: ChainEntity['id'][] = [];
  const eolChains = selectEolChainIds(state);
  const walletAddress = selectWalletAddressIfKnown(state);
  const chainsToCheck = entries(state.ui.dataLoader.byChainId).filter(
    ([chainId, _]) => !eolChains.includes(chainId)
  );

  for (const [chainId, loader] of chainsToCheck) {
    if (loader) {
      if (matcher(loader.addressBook) || matcher(loader.contractData)) {
        chainIds.push(chainId);
      }
    }
  }

  if (walletAddress && state.ui.dataLoader.byAddress[walletAddress]) {
    const userDataToCheck = entries(state.ui.dataLoader.byAddress[walletAddress].byChainId).filter(
      ([chainId, _]) => !eolChains.includes(chainId)
    );
    for (const [chainId, loader] of userDataToCheck) {
      if (loader) {
        if (matcher(loader.balance) || matcher(loader.allowance)) {
          chainIds.push(chainId);
        }
      }
    }
  }

  return uniq(chainIds);
};

const findBeefyApiMatching = (state: BeefyState, matcher: (loader: LoaderState) => boolean) => {
  const matchingKeys: (keyof DataLoaderState['global'])[] = [];
  const beefyKeys: (keyof DataLoaderState['global'])[] = ['apy', 'prices', 'analytics'];
  for (const key of beefyKeys) {
    if (matcher(state.ui.dataLoader.global[key])) {
      matchingKeys.push(key);
    }
  }
  return matchingKeys;
};

const findConfigMatching = (state: BeefyState, matcher: (loader: LoaderState) => boolean) => {
  const matchingKeys: (keyof DataLoaderState['global'])[] = [];
  const configKeys: (keyof DataLoaderState['global'])[] = ['chainConfig', 'promos', 'vaults'];
  for (const key of configKeys) {
    if (matcher(state.ui.dataLoader.global[key])) {
      matchingKeys.push(key);
    }
  }
  return matchingKeys;
};
