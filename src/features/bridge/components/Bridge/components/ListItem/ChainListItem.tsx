import { memo } from 'react';
import type { ItemInnerProps } from '../../../../../../components/SearchableList/ItemInner.tsx';
import { useAppSelector } from '../../../../../../store.ts';
import { selectChainById } from '../../../../../data/selectors/chains.ts';
import { styles } from './styles.ts';
import type { ChainEntity } from '../../../../../data/entities/chain.ts';
import { ChainIcon } from '../../../../../../components/ChainIcon/ChainIcon.tsx';

export const ChainListItem = memo(function ChainListItem({
  value,
}: ItemInnerProps<ChainEntity['id']>) {
  const chain = useAppSelector(state => selectChainById(state, value));

  return (
    <>
      <ChainIcon chainId={value} css={styles.listItemIcon} />
      {chain.name}
    </>
  );
});
