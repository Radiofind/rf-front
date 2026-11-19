export interface IShare<T> {
  item: T;
  value: number;
  share: number;
}

export interface ITopShare<T> {
  leaders: IShare<T>[];
  restValue: number;
  restShare: number;
}
