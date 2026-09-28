import { Constants } from '../../../core/constants/constants';

export function transformStringToDate(stringDate: string): Date {
  const [year, month, day]: string[] = stringDate.split(Constants.DASH);
  return new Date(Number(year), Number(month) - Constants.ONE, Number(day));
}

export function transformDateToString(date: Date): string {
  const year: string = String(date.getFullYear());
  const month: string = String(date.getMonth() + Constants.ONE).padStart(
    Constants.DATE_PAD_LENGTH,
    Constants.ZERO_STRING,
  );
  const day: string = String(date.getDate()).padStart(
    Constants.DATE_PAD_LENGTH,
    Constants.ZERO_STRING,
  );

  return [year, month, day].join(Constants.DASH);
}
