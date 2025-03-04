import { useTranslation } from 'react-i18next';
import { CardTitle } from '../../Card/CardTitle.tsx';
import type { VaultGov } from '../../../../data/entities/vault.ts';
import { selectGovVaultById } from '../../../../data/selectors/vaults.ts';
import { useAppSelector } from '../../../../../store.ts';
import { selectChainById } from '../../../../data/selectors/chains.ts';
import { explorerAddressUrl } from '../../../../../helpers/url.ts';
import { GovDescription } from '../Description/GovDescription.tsx';
import { memo, useMemo } from 'react';
import { ExplainerCard } from '../ExplainerCard/ExplainerCard.tsx';

type GovExplainerProps = {
  vaultId: VaultGov['id'];
};

const GovExplainer = memo(function GovExplainer({ vaultId }: GovExplainerProps) {
  const { t } = useTranslation();
  const vault = useAppSelector(state => selectGovVaultById(state, vaultId));
  const chain = useAppSelector(state => selectChainById(state, vault.chainId));

  const links = useMemo(() => {
    return [
      { link: explorerAddressUrl(chain, vault.contractAddress), label: t('Strat-PoolContract') },
    ];
  }, [chain, t, vault.contractAddress]);

  return (
    <ExplainerCard
      title={<CardTitle>{t('Gov-Pool')}</CardTitle>}
      links={links}
      description={<GovDescription vaultId={vaultId} />}
    />
  );
});

// eslint-disable-next-line no-restricted-syntax -- default export required for React.lazy()
export default GovExplainer;
