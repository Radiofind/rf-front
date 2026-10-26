import type { ISelectOption } from '../../models/select-option.model';

export function hasSelectOptionChildren<T extends string, L extends string = string>(
  option: ISelectOption<T, L>,
): boolean {
  return Boolean(option.children?.length);
}

export function findSelectOption<T extends string, L extends string = string>(
  options: readonly ISelectOption<T, L>[],
  value: T | null,
): ISelectOption<T, L> | undefined {
  if (value === null) {
    return undefined;
  }

  for (const option of options) {
    if (hasSelectOptionChildren(option)) {
      const found: ISelectOption<T, L> | undefined = findSelectOption(option.children ?? [], value);

      if (found) {
        return found;
      }
    } else if (option.value === value) {
      return option;
    }
  }

  return undefined;
}

export function filterSelectOptions<T extends string>(
  options: readonly ISelectOption<T>[],
  predicate: (option: ISelectOption<T>) => boolean,
): ISelectOption<T>[] {
  return options.reduce((result: ISelectOption<T>[], option: ISelectOption<T>) => {
    if (!hasSelectOptionChildren(option)) {
      return predicate(option) ? [...result, option] : result;
    }

    const children: ISelectOption<T>[] = filterSelectOptions(option.children ?? [], predicate);

    return children.length ? [...result, { ...option, children: children }] : result;
  }, []);
}
