export enum ComposableStablePoolJoinKind {
  INIT = 0,
  EXACT_TOKENS_IN_FOR_BPT_OUT,
  TOKEN_IN_FOR_EXACT_BPT_OUT,
  ALL_TOKENS_IN_FOR_EXACT_BPT_OUT,
}

export enum ComposableStablePoolExitKind {
  EXACT_BPT_IN_FOR_ONE_TOKEN_OUT = 0,
  BPT_IN_FOR_EXACT_TOKENS_OUT,
  EXACT_BPT_IN_FOR_ALL_TOKENS_OUT,
}