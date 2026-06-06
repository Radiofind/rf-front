import { Constants } from "../../core/constants/constants";

export function transformStringToDate(stringDate: string): Date {
  const [year, month, day]: string[] = stringDate.split(Constants.DASH);
  return new Date(Number(year), Number(month) - Constants.ONE, Number(day));
}
