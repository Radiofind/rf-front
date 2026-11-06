export interface IPage<T> {
  items: T[];
  page: number;
  size: number;
  totalElements: number;
  hasNext: boolean;
}
