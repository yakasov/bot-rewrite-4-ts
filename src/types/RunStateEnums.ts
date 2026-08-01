export enum BirthdayStates {
  NORMAL = 0,
  FIRST_RUN = 1,
  ERROR_STOP = 2,
}

/**
 * Used for tracking what the next Minecraft query action should be.
 */
export enum MinecraftQueryStates {
  /** Normal query state - no special behaviour. */
  NORMAL = 0,

  /** Initial query state - will log to the console the state of the server. */
  FIRST_RUN = 1,

  /** Final query state - will not query further. */
  ERROR_STOP = 2,

  /** Error query state - will skip the next query, and then attempt normal behaviour again. */
  ERROR_RETRY = 3,
}