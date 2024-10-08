import type { Abi } from 'viem';

export const stellaswapRewarderAbi = [
  { inputs: [], name: 'InvalidLengths', type: 'error' },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: 'token', type: 'address' },
      { indexed: false, internalType: 'bool', name: 'isNative', type: 'bool' },
      { indexed: false, internalType: 'uint256', name: 'startTimestamp', type: 'uint256' },
      { indexed: false, internalType: 'uint256', name: 'endTimestamp', type: 'uint256' },
      { indexed: false, internalType: 'uint256', name: 'rewardPerSec', type: 'uint256' },
    ],
    name: 'AddRewardInfo',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, internalType: 'address', name: 'user', type: 'address' },
      { indexed: false, internalType: 'uint256', name: 'positionId', type: 'uint256' },
      { indexed: false, internalType: 'address', name: 'token', type: 'address' },
      { indexed: false, internalType: 'uint256', name: 'amount', type: 'uint256' },
    ],
    name: 'Claimed',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [{ indexed: false, internalType: 'uint8', name: 'version', type: 'uint8' }],
    name: 'Initialized',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: 'token', type: 'address' },
      { indexed: true, internalType: 'address', name: 'to', type: 'address' },
      { indexed: false, internalType: 'uint256', name: 'amount', type: 'uint256' },
    ],
    name: 'Recovered',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, internalType: 'bytes32', name: 'merkleRoot', type: 'bytes32' },
      { indexed: false, internalType: 'string', name: 'ipfsHash', type: 'string' },
      { indexed: false, internalType: 'uint256', name: 'rewardTime', type: 'uint256' },
    ],
    name: 'TreeUpdated',
    type: 'event',
  },
  {
    inputs: [],
    name: 'EPOCH_DURATION',
    outputs: [{ internalType: 'uint32', name: '', type: 'uint32' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'REWARD_REGISTRY',
    outputs: [{ internalType: 'contract IRewardRegistry', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint32', name: 'startTimestamp', type: 'uint32' },
      { internalType: 'uint32', name: 'endTimestamp', type: 'uint32' },
    ],
    name: '_getRewardsBetweenTimestamps',
    outputs: [
      {
        components: [
          { internalType: 'contract IERC20', name: 'token', type: 'address' },
          { internalType: 'bool', name: 'isNative', type: 'bool' },
          { internalType: 'uint32', name: 'startTimestamp', type: 'uint32' },
          { internalType: 'uint32', name: 'endTimestamp', type: 'uint32' },
          { internalType: 'uint256', name: 'rewardPerSec', type: 'uint256' },
        ],
        internalType: 'struct RewarderV4.RewardInfo[]',
        name: '',
        type: 'tuple[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'contract IERC20', name: 'token', type: 'address' },
      { internalType: 'bool', name: '_isNative', type: 'bool' },
      { internalType: 'uint32', name: '_startTimestamp', type: 'uint32' },
      { internalType: 'uint32', name: '_endTimestamp', type: 'uint32' },
      { internalType: 'uint256', name: '_rewardPerSec', type: 'uint256' },
    ],
    name: 'addRewardInfo',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      {
        components: [
          { internalType: 'address', name: 'user', type: 'address' },
          { internalType: 'uint256', name: 'position', type: 'uint256' },
          { internalType: 'address', name: 'token', type: 'address' },
          { internalType: 'uint256', name: 'amount', type: 'uint256' },
          { internalType: 'bool', name: 'isNative', type: 'bool' },
          { internalType: 'bytes32[]', name: 'proof', type: 'bytes32[]' },
        ],
        internalType: 'struct RewarderV4.ClaimData[]',
        name: 'claims',
        type: 'tuple[]',
      },
    ],
    name: 'claim',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: '', type: 'address' },
      { internalType: 'uint256', name: '', type: 'uint256' },
      { internalType: 'address', name: '', type: 'address' },
    ],
    name: 'claimed',
    outputs: [
      { internalType: 'uint256', name: 'amount', type: 'uint256' },
      { internalType: 'uint48', name: 'timestamp', type: 'uint48' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getActiveRewards',
    outputs: [
      {
        components: [
          { internalType: 'contract IERC20', name: 'token', type: 'address' },
          { internalType: 'bool', name: 'isNative', type: 'bool' },
          { internalType: 'uint32', name: 'startTimestamp', type: 'uint32' },
          { internalType: 'uint32', name: 'endTimestamp', type: 'uint32' },
          { internalType: 'uint256', name: 'rewardPerSec', type: 'uint256' },
        ],
        internalType: 'struct RewarderV4.RewardInfo[]',
        name: '',
        type: 'tuple[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getMerkleRoot',
    outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getRewardForNextEpoch',
    outputs: [
      {
        components: [
          { internalType: 'contract IERC20', name: 'token', type: 'address' },
          { internalType: 'bool', name: 'isNative', type: 'bool' },
          { internalType: 'uint32', name: 'startTimestamp', type: 'uint32' },
          { internalType: 'uint32', name: 'endTimestamp', type: 'uint32' },
          { internalType: 'uint256', name: 'rewardPerSec', type: 'uint256' },
        ],
        internalType: 'struct RewarderV4.RewardInfo[]',
        name: '',
        type: 'tuple[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint32', name: 'epoch', type: 'uint32' }],
    name: 'getRewardForTimestamp',
    outputs: [
      {
        components: [
          { internalType: 'contract IERC20', name: 'token', type: 'address' },
          { internalType: 'bool', name: 'isNative', type: 'bool' },
          { internalType: 'uint32', name: 'startTimestamp', type: 'uint32' },
          { internalType: 'uint32', name: 'endTimestamp', type: 'uint32' },
          { internalType: 'uint256', name: 'rewardPerSec', type: 'uint256' },
        ],
        internalType: 'struct RewarderV4.RewardInfo[]',
        name: '',
        type: 'tuple[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint32', name: 'startTimestamp', type: 'uint32' }],
    name: 'getRewardsAfterEpoch',
    outputs: [
      {
        components: [
          { internalType: 'contract IERC20', name: 'token', type: 'address' },
          { internalType: 'bool', name: 'isNative', type: 'bool' },
          { internalType: 'uint32', name: 'startTimestamp', type: 'uint32' },
          { internalType: 'uint32', name: 'endTimestamp', type: 'uint32' },
          { internalType: 'uint256', name: 'rewardPerSec', type: 'uint256' },
        ],
        internalType: 'struct RewarderV4.RewardInfo[]',
        name: '',
        type: 'tuple[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint32', name: 'startTimestamp', type: 'uint32' },
      { internalType: 'uint32', name: 'endTimestamp', type: 'uint32' },
    ],
    name: 'getRewardsBetweenEpochs',
    outputs: [
      {
        components: [
          { internalType: 'contract IERC20', name: 'token', type: 'address' },
          { internalType: 'bool', name: 'isNative', type: 'bool' },
          { internalType: 'uint32', name: 'startTimestamp', type: 'uint32' },
          { internalType: 'uint32', name: 'endTimestamp', type: 'uint32' },
          { internalType: 'uint256', name: 'rewardPerSec', type: 'uint256' },
        ],
        internalType: 'struct RewarderV4.RewardInfo[]',
        name: '',
        type: 'tuple[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint32', name: 'timestamp', type: 'uint32' }],
    name: 'getRoundedTimestamp',
    outputs: [{ internalType: 'uint32', name: '', type: 'uint32' }],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'contract IRewardRegistry', name: '_registry', type: 'address' }],
    name: 'initialize',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'lastRewardTimestamp',
    outputs: [{ internalType: 'uint32', name: '', type: 'uint32' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'lastRewardUpdateTime',
    outputs: [{ internalType: 'uint32', name: '', type: 'uint32' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'lastTree',
    outputs: [
      { internalType: 'bytes32', name: 'merkleRoot', type: 'bytes32' },
      { internalType: 'string', name: 'ipfsHash', type: 'string' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'lastTreeUpdate',
    outputs: [{ internalType: 'uint48', name: '', type: 'uint48' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: '_token', type: 'address' },
      { internalType: 'address', name: '_to', type: 'address' },
      { internalType: 'uint256', name: '_amount', type: 'uint256' },
      { internalType: 'bool', name: 'isNative', type: 'bool' },
    ],
    name: 'recover',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'reportPeriodElapsed',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    name: 'rewardInfo',
    outputs: [
      { internalType: 'contract IERC20', name: 'token', type: 'address' },
      { internalType: 'bool', name: 'isNative', type: 'bool' },
      { internalType: 'uint32', name: 'startTimestamp', type: 'uint32' },
      { internalType: 'uint32', name: 'endTimestamp', type: 'uint32' },
      { internalType: 'uint256', name: 'rewardPerSec', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'rewardInfoLength',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'rewardStartTime',
    outputs: [{ internalType: 'uint32', name: '', type: 'uint32' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint32', name: '_newLastReportedTimestamp', type: 'uint32' }],
    name: 'setLastReportedTimestamp',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'tree',
    outputs: [
      { internalType: 'bytes32', name: 'merkleRoot', type: 'bytes32' },
      { internalType: 'string', name: 'ipfsHash', type: 'string' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'bytes32', name: '_merkleRoot', type: 'bytes32' },
      { internalType: 'string', name: '_ipfsHash', type: 'string' },
    ],
    name: 'updateTree',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'version',
    outputs: [{ internalType: 'uint8', name: '', type: 'uint8' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const satisfies Abi;
