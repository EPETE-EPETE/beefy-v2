import { memo } from 'react';
import { useAppSelector } from '../../../../../../store';
import { selectSelectedQuote } from '../../../../../data/selectors/on-ramp';
import { makeStyles } from '@material-ui/styles';
import { styles } from './styles';
import { selectWalletAddressIfKnown } from '../../../../../data/selectors/wallet';
import { useAsync } from '../../../../../../helpers/useAsync';
import { LoadingIndicator } from '../../../../../../components/LoadingIndicator';
import { PROVIDERS } from '../../providers';
import { ErrorIndicator } from '../ErrorIndicator';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';

const useStyles = makeStyles(styles);

export const ProviderFrame = memo(function ProviderFrame() {
  const classes = useStyles();
  const { t } = useTranslation();
  const quote = useAppSelector(selectSelectedQuote);
  const walletAddress = useAppSelector(selectWalletAddressIfKnown);
  const { useFetchUrl, title } = PROVIDERS[quote.provider];
  const fetchUrl = useFetchUrl(quote, walletAddress);
  const { value: url, error: urlError, status: urlStatus } = useAsync(fetchUrl, null);

  return url ? (
    quote.provider === 'transak' ? (
      <iframe
        src={url}
        width="100%"
        height="100%"
        frameBorder="0"
        title={title}
        className={classes.iframe}
        allow="payment"
      />
    ) : (
      <iframe
        src={url}
        width="100%"
        height="100%"
        frameBorder="0"
        title={title}
        className={clsx(classes.iframe, classes.iframeMtPellerin)}
        allow="usb; ethereum; clipboard-write; payment; microphone; camera"
        loading="lazy"
      />
    )
  ) : urlError || (urlStatus === 'success' && !url) ? (
    <ErrorIndicator
      className={classes.error}
      title={t('OnRamp-InjectProviderStep-Error', { provider: title })}
      content={urlError?.message || 'Unknown error'}
    />
  ) : (
    <>
      {/* TODO set back to loading... */}
      <LoadingIndicator text={urlStatus} />
    </>
  );
});
