export interface FirstRun {
  birthdays: BirthdayStates;
  minecraft: MinecraftQueryStates;
}

enum MinecraftQueryStates {
  NORMAL = 0,
  FIRST_RUN = 1,
  ERROR_STOP = 2,
  ERROR_RETRY = 3
}

enum BirthdayStates {
  NORMAL = 0,
  FIRST_RUN = 1
}