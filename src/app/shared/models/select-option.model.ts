export interface ISelectOption<T extends string, L extends string = string> {
  value: T;
  label: L;
  imageSrc?: string;
  children?: readonly ISelectOption<T, L>[];
}
