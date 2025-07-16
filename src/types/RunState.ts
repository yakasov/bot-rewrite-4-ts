export interface RunState {
  birthdays: BirthdayStates;
  minecraft: MinecraftQueryStates;
}

export enum MinecraftQueryStates {
  NORMAL = 0,
  FIRST_RUN = 1,
  ERROR_STOP = 2,
  ERROR_RETRY = 3,
}

export enum BirthdayStates {
  NORMAL = 0,
  FIRST_RUN = 1,
  ERROR_STOP = 2,
}
