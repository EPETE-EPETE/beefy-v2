import type { Action } from 'redux';
import type { ChainEntity } from '../entities/chain.ts';
import { selectIsWalletKnown, selectWalletAddress } from '../selectors/wallet.ts';
import type { PollStop } from '../utils/async-utils.ts';
import { createFulfilledActionCapturer, poll } from '../utils/async-utils.ts';
import { fetchApyAction } from './apy.ts';
import { fetchChainConfigs } from './chains.ts';
import { fetchAllPricesAction } from './prices.ts';
import { fetchAllVaults, fetchVaultsLastHarvests } from './vaults.ts';
import { fetchAllBalanceAction } from './balance.ts';
import { fetchAllContractDataByChainAction } from './contract-data.ts';
import { featureFlag_noDataPolling } from '../utils/feature-flags.ts';
import type { BeefyStore, BeefyThunk } from '../../../redux-types.ts';
import { chains as chainsConfig } from '../../../config/config.ts';
import { initWallet } from './wallet.ts';
import { fetchPartnersConfig } from './partners.ts';
import { fetchAllAddressBookAction } from './tokens.ts';
import { fetchPlatforms } from './platforms.ts';
import { selectAllChainIds } from '../selectors/chains.ts';
import { fetchBridges } from './bridges.ts';
import {
  fetchZapAggregatorTokenSupportAction,
  fetchZapAmmsAction,
  fetchZapConfigsAction,
  fetchZapSwapAggregatorsAction,
} from './zap.ts';
import { fetchOffChainCampaignsAction } from './rewards.ts';
import { initPromos } from './promos.ts';
import { recalculatePromoStatuses } from '../reducers/promos.ts';

declare const window: {
  __manual_poll?: () => unknown;
} & Window &
  typeof globalThis;

type CapturedFulfilledActionGetter = Promise<() => Action>;

export interface CapturedFulfilledActions {
  contractData: CapturedFulfilledActionGetter;
  user:
    | {
        balance: CapturedFulfilledActionGetter;
      }
    | undefined;
}

let pollStopFns: PollStop[] = [];

export const chains = chainsConfig.map(id => ({ id }));

/**
 * Fetch all necessary information for the home page
 */
export async function initAppData(store: BeefyStore) {
  const captureFulfill = createFulfilledActionCapturer(store);

  // start fetching chain config
  const chainListPromise = store.dispatch(fetchChainConfigs());

  // we fetch the configuration for all chain
  const promosPromise = store.dispatch(initPromos());
  const vaultsPromise = store.dispatch(fetchAllVaults());

  // we can start fetching prices right now and await them later
  const pricesPromise = store.dispatch(fetchAllPricesAction());

  // create the wallet instance as soon as we get the chain list
  setTimeout(() => {
    // we can start fetching apy, it will arrive when it wants, nothing depends on it
    store.dispatch(fetchApyAction());

    store.dispatch(fetchPartnersConfig());

    store.dispatch(fetchPlatforms());

    store.dispatch(fetchBridges());

    store.dispatch(fetchVaultsLastHarvests());

    store.dispatch(fetchOffChainCampaignsAction());

    // Zap (we need the data to know if zap is available for each vault)
    store.dispatch(fetchZapConfigsAction());
    store.dispatch(fetchZapSwapAggregatorsAction());
    store.dispatch(fetchZapAggregatorTokenSupportAction());
    store.dispatch(fetchZapAmmsAction());
  });

  // create the wallet instance as soon as we get the chain list
  setTimeout(() => {
    chainListPromise
      .then(() => {
        store.dispatch(initWallet());
      })
      .catch(console.error);
  });

  // we need config data (for contract addresses) to start querying the rest
  await chainListPromise;
  // pre-load the addressbook
  const addressBookPromise = store.dispatch(fetchAllAddressBookAction());
  // we need the chain list to handle the vault list
  await vaultsPromise;
  await promosPromise;
  await addressBookPromise;

  // then, we work by chain

  // now we start fetching all data for all chains
  const fulfillsByNet: {
    [chainId in ChainEntity['id']]?: CapturedFulfilledActions;
  } = {};
  for (const chain of chains) {
    fulfillsByNet[chain.id] = {
      contractData: captureFulfill(fetchAllContractDataByChainAction({ chainId: chain.id })),
      user: undefined,
    };
    const walletAddress = selectWalletAddress(store.getState());
    if (walletAddress) {
      fulfillsByNet[chain.id]!.user = fetchCaptureUserData(store, chain.id, walletAddress);
    }
  }

  // ok now we started all calls, it's just a matter of ordering fulfill actions

  // before doing anything else, we need our prices
  await pricesPromise;

  for (const chain of chains) {
    // run in an async block se we don't wait for a slow chain
    (async () => {
      const chainFfs = fulfillsByNet[chain.id];
      if (chainFfs) {
        store.dispatch((await chainFfs.contractData)());
        if (chainFfs.user !== undefined) {
          return dispatchUserFfs(store, chainFfs.user);
        }
      }
    })().catch(err => {
      // as we still dispatch network errors, for reducers to handle
      // there is not much to do here, this is just to avoid
      // "unhandled promise exception" messages in the console
      console.warn(err);
    });
  }

  // ok all data is fetched, now we start the poll functions

  if (featureFlag_noDataPolling()) {
    console.debug('Polling disabled');
    try {
      window['__manual_poll'] = () => store.dispatch(manualPoll());
      console.debug('Use window.__manual_poll(); to simulate.');
    } catch {
      // ignore
    }
    return;
  }

  // cancel regular polls if we already have some
  for (const stop of pollStopFns) {
    stop();
  }
  pollStopFns = [];

  // recompute boost activity status
  let pollStop = poll(async () => {
    return store.dispatch(recalculatePromoStatuses());
  }, 15 * 1000 /* every 15s */);
  pollStopFns.push(pollStop);

  // now set regular calls to update prices
  pollStop = poll(async () => {
    return Promise.all([store.dispatch(fetchAllPricesAction()), store.dispatch(fetchApyAction())]);
  }, 45 * 1000 /* every 45s */);
  pollStopFns.push(pollStop);

  // regular calls to update last harvest
  pollStop = poll(
    async () => {
      return store.dispatch(fetchVaultsLastHarvests());
    },
    3 * 60 * 1000 /* every 3 minutes */
  );
  pollStopFns.push(pollStop);

  // now set regular calls to update contract data
  for (const chain of chains) {
    const pollStop = poll(async () => {
      // trigger all calls at the same time
      const fulfills: Omit<CapturedFulfilledActions, 'user'> = {
        contractData: captureFulfill(fetchAllContractDataByChainAction({ chainId: chain.id })),
      };

      // dispatch fulfills in order
      store.dispatch((await fulfills.contractData)());
    }, 60 * 1000 /* every 60s */);
    pollStopFns.push(pollStop);
  }

  // now set regular calls to update user data
  for (const chain of chains) {
    const pollStop = poll(async () => {
      const walletAddress = selectWalletAddress(store.getState());
      if (!walletAddress) {
        return;
      }
      // trigger all calls at the same time
      const fulfills = fetchCaptureUserData(store, chain.id, walletAddress);

      // dispatch fulfills in order
      await dispatchUserFfs(store, fulfills);
    }, 60 * 1000 /* every 60s */);
    pollStopFns.push(pollStop);
  }
}

export function manualPoll(): BeefyThunk {
  return (dispatch, getState) => {
    const state = getState();
    const chains = selectAllChainIds(state);

    dispatch(recalculatePromoStatuses());
    dispatch(fetchAllPricesAction());
    dispatch(fetchApyAction());

    for (const chainId of chains) {
      dispatch(fetchAllContractDataByChainAction({ chainId: chainId }));
    }

    if (selectIsWalletKnown(state)) {
      const walletAddress = selectWalletAddress(state);
      if (walletAddress) {
        for (const chainId of chains) {
          dispatch(fetchAllBalanceAction({ chainId, walletAddress }));
        }
      }
    }
  };
}

export function fetchCaptureUserData(
  store: BeefyStore,
  chainId: ChainEntity['id'],
  walletAddress: string
): Exclude<CapturedFulfilledActions['user'], undefined> {
  const captureFulfill = createFulfilledActionCapturer(store);

  return {
    balance: captureFulfill(fetchAllBalanceAction({ chainId, walletAddress })),
    // TODO: do we really need to fetch allowances right now?
    //allowance: captureFulfill(fetchAllAllowanceAction({ chainId, walletAddress })),
  };
}

export async function dispatchUserFfs(
  store: BeefyStore,
  userFfs: Exclude<CapturedFulfilledActions['user'], undefined>
) {
  store.dispatch((await userFfs.balance)());
  //store.dispatch((await userFfs.allowance)());
}
