export interface IRelativeTime {
  value: number;
  unit: Intl.RelativeTimeFormatUnit;
}

export interface IRelativeTimeStep {
  unit: Intl.RelativeTimeFormatUnit;
  seconds: number;
}
