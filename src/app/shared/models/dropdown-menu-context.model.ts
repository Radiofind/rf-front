import type { ISelectOption } from './select-option.model';

export interface IDropdownMenuContext<T extends string> {
  $implicit: readonly ISelectOption<T>[] | null;
  isNested: boolean;
}
