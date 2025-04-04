import type { BeefyState } from '../../../redux-types.ts';
import { createListenerMiddleware, isAnyOf, isFulfilled } from '@reduxjs/toolkit';
import {
  fetchAllBalanceAction,
  fetchBalanceAction,
  recalculateDepositedVaultsAction,
} from '../actions/balance.ts';
import { reloadBalanceAndAllowanceAndGovRewardsAndBoostData } from '../actions/tokens.ts';
import { fetchAllVaults } from '../actions/vaults.ts';
import { fetchAllPricesAction } from '../actions/prices.ts';
import { fetchApyAction } from '../actions/apy.ts';
import { fetchPlatforms } from '../actions/platforms.ts';
import { fetchAllContractDataByChainAction } from '../actions/contract-data.ts';
import { calculateZapAvailabilityAction } from '../actions/zap.ts';
import { recalculateFilteredVaultsAction } from '../actions/filtered-vaults.ts';
import { filteredVaultsActions } from '../reducers/filtered-vaults.ts';
import type { RehydrateAction } from 'redux-persist/es/types';
import { REHYDRATE } from 'redux-persist/es/constants';
import { fetchChainConfigs } from '../actions/chains.ts';
import { selectIsConfigAvailable } from '../selectors/data-loader.ts';
import {
  accountHasChanged,
  chainHasChanged,
  chainHasChangedToUnsupported,
  userDidConnect,
  walletHasDisconnected,
} from '../reducers/wallet/wallet.ts';
import { selectWalletAddress } from '../selectors/wallet.ts';
import { initPromos, promosRecalculatePinned } from '../actions/promos.ts';

const filteredVaultsListener = createListenerMiddleware<BeefyState>();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isRehydrateAction(action: any): action is RehydrateAction {
  return action.type === REHYDRATE;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isRehydrateFiltersAction(action: any): action is RehydrateAction {
  return isRehydrateAction(action) && action.key === 'filters';
}

const hasDataLoaded = isFulfilled(fetchChainConfigs, fetchAllVaults, fetchPlatforms, initPromos);

const hasDataChanged = isFulfilled(
  fetchAllPricesAction,
  fetchApyAction,
  fetchAllBalanceAction,
  fetchBalanceAction,
  fetchAllContractDataByChainAction,
  reloadBalanceAndAllowanceAndGovRewardsAndBoostData,
  recalculateDepositedVaultsAction,
  calculateZapAvailabilityAction
);

const hasFiltersChanged = isAnyOf(
  filteredVaultsActions.reset,
  filteredVaultsActions.setVaultCategory,
  filteredVaultsActions.setUserCategory,
  filteredVaultsActions.setStrategyType,
  filteredVaultsActions.setAssetType,
  filteredVaultsActions.setSearchText,
  filteredVaultsActions.setChainIds,
  filteredVaultsActions.setPlatformIds,
  filteredVaultsActions.setBoolean,
  filteredVaultsActions.setBigNumber,
  isRehydrateFiltersAction
);

const hasSortChanged = isAnyOf(
  filteredVaultsActions.setSort,
  filteredVaultsActions.setSortDirection,
  filteredVaultsActions.setSortFieldAndDirection
);

const hasWalletChanged = isAnyOf(
  userDidConnect,
  accountHasChanged,
  walletHasDisconnected,
  chainHasChanged,
  chainHasChangedToUnsupported
);

/**
 * This middleware listens for when all actions that have loaded data have been fulfilled and recalculates the filtered vaults
 */
filteredVaultsListener.startListening({
  matcher: hasDataLoaded,
  effect: async (_action, { dispatch, condition, cancelActiveListeners, unsubscribe }) => {
    // Stop listening for this
    unsubscribe();
    cancelActiveListeners();

    // Wait for all data to be loaded
    await condition((_, state): boolean => selectIsConfigAvailable(state));

    // Start listening for changes
    listenForChanges();

    // Calculate
    dispatch(recalculateFilteredVaultsAction({ dataChanged: true }));
  },
});

function listenForChanges() {
  /**
   * This middleware listens for actions that affect vaults data and recalculates the filtered vaults
   */
  filteredVaultsListener.startListening({
    matcher: hasDataChanged,
    effect: async (_action, { dispatch, delay, cancelActiveListeners }) => {
      // Debounce a long time to give other chain data time to load
      cancelActiveListeners();
      await delay(500);

      // Recalculate
      await dispatch(promosRecalculatePinned());
      await dispatch(recalculateFilteredVaultsAction({ dataChanged: true }));
    },
  });

  /**
   * This middleware listens for actions that changes the connected wallet and recalculates the filtered vaults
   */
  filteredVaultsListener.startListening({
    matcher: hasWalletChanged,
    effect: async (
      _action,
      { dispatch, delay, cancelActiveListeners, getState, getOriginalState }
    ) => {
      const hasWalletChanged =
        selectWalletAddress(getState()) !== selectWalletAddress(getOriginalState());
      if (hasWalletChanged) {
        cancelActiveListeners();
        await delay(50);
        await dispatch(recalculateFilteredVaultsAction({ dataChanged: true }));
      }
    },
  });

  /**
   * This middleware listens for actions that change the filters or sort and recalculates the filtered vaults
   */
  filteredVaultsListener.startListening({
    matcher: isAnyOf(hasFiltersChanged, hasSortChanged),
    effect: async (action, { dispatch, delay, cancelActiveListeners }) => {
      // Debounce
      cancelActiveListeners();
      await delay(50);

      // Recalculate
      await dispatch(
        recalculateFilteredVaultsAction(
          hasFiltersChanged(action) ? { filtersChanged: true } : { sortChanged: true }
        )
      );
    },
  });
}

export const filteredVaultsMiddleware = filteredVaultsListener.middleware;
