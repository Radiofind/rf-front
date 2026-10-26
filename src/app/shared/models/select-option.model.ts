export interface ISelectOption<T extends string> {
  value: T;
  label: string;
  children?: readonly ISelectOption<T>[];
}
