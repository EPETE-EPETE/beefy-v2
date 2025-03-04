import { lazy, memo, Suspense, useCallback, useRef, useState } from 'react';
import { styled } from '@repo/styles/jsx';
import { NetworkStatus } from '../../../NetworkStatus/NetworkStatus.tsx';
import { RpcModalTrigger } from '../RpcModal/RpcModal.tsx';

// lazy load web3 related stuff, as libs are quite heavy
const WalletContainer = lazy(() => import('../WalletContainer/WalletContainer.tsx'));

export const ConnectionStatus = memo(function ConnectionStatus() {
  const anchorEl = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState<null | 'rpc' | 'status'>(null);

  const handleOpenRpc = useCallback(() => {
    setOpen('rpc');
  }, [setOpen]);

  const handleOpenStatus = useCallback(() => {
    setOpen('status');
  }, [setOpen]);

  const handleClose = useCallback(() => {
    setOpen(null);
  }, [setOpen]);

  return (
    <Holder ref={anchorEl}>
      <RpcModalTrigger
        anchorEl={anchorEl}
        isOpen={open === 'rpc'}
        onOpen={handleOpenRpc}
        onClose={handleClose}
      />
      <NetworkStatus
        anchorEl={anchorEl}
        isOpen={open === 'status'}
        isOtherOpen={open !== null}
        onOpen={handleOpenStatus}
        onClose={handleClose}
      />
      <div>
        <Suspense>
          <WalletContainer />
        </Suspense>
      </div>
    </Holder>
  );
});

const Holder = styled('div', {
  base: {
    display: 'flex',
    backgroundColor: 'background.content.dark',
    alignItems: 'center',
    borderRadius: '8px',
  },
});
