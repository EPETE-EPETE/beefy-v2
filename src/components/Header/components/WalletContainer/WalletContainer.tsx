import { useTranslation } from 'react-i18next';
import { StatLoader } from '../../../StatLoader/StatLoader.tsx';
import {
  selectIsBalanceHidden,
  selectIsWalletConnected,
  selectWalletAddress,
} from '../../../../features/data/selectors/wallet.ts';
import {
  askForWalletConnection,
  doDisconnectWallet,
} from '../../../../features/data/actions/wallet.ts';
import { selectIsWalletPending } from '../../../../features/data/selectors/data-loader.ts';
import { useAppDispatch, useAppSelector } from '../../../../store.ts';
import { formatAddressShort, formatDomain } from '../../../../helpers/format.ts';
import { useResolveAddress } from '../../../../features/data/hooks/resolver.tsx';
import { isFulfilledStatus } from '../../../../features/data/reducers/wallet/resolver-types.ts';
import { styled } from '@repo/styles/jsx';
import { memo, useCallback } from 'react';

const WalletContainer = memo(function WalletContainer() {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const isWalletConnected = useAppSelector(selectIsWalletConnected);
  const walletAddress = useAppSelector(selectWalletAddress);
  const walletPending = useAppSelector(selectIsWalletPending);
  const blurred = useAppSelector(selectIsBalanceHidden);
  const resolverStatus = useResolveAddress(walletAddress);

  const handleWalletConnect = useCallback(() => {
    if (walletAddress) {
      dispatch(doDisconnectWallet());
    } else {
      dispatch(askForWalletConnection());
    }
  }, [dispatch, walletAddress]);

  return (
    <Button
      onClick={handleWalletConnect}
      status={isWalletConnected ? 'connected' : walletAddress ? 'known' : 'unknown'}
    >
      {walletPending && !walletAddress ? (
        <StatLoader foregroundColor="#68BE71" backgroundColor="#004708" />
      ) : (
        <Address blurred={blurred}>
          {walletAddress
            ? isFulfilledStatus(resolverStatus)
              ? formatDomain(resolverStatus.value)
              : formatAddressShort(walletAddress)
            : t('Network-ConnectWallet')}
        </Address>
      )}
    </Button>
  );
});

const Address = styled('div', {
  base: {},
  variants: {
    blurred: {
      true: {
        filter: 'blur(0.5rem)',
      },
    },
  },
});

const Button = styled('button', {
  base: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: '8px',
    padding: '8px 16px',
    borderStyle: 'solid',
    borderWidth: '2px',
    color: 'text.light',
    textStyle: 'body.med',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    height: '40px',
  },
  variants: {
    status: {
      unknown: {
        borderColor: 'green',
        backgroundColor: 'green',
      },
      known: {
        borderColor: 'indicators.warning',
        _hover: {
          borderColor: 'background.content.light',
        },
      },
      connected: {
        borderColor: 'green',
      },
    },
  },
  defaultVariants: {
    status: 'unknown',
  },
});

// eslint-disable-next-line no-restricted-syntax -- default export required for React.lazy()
export default WalletContainer;
