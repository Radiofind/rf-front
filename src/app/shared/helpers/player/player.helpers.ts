import { Constants } from '../../../core/constants/constants';

export function formatPlaybackTime(totalSeconds: number): string {
  const seconds: number =
    Number.isFinite(totalSeconds) && totalSeconds > Constants.ZERO ? Math.floor(totalSeconds) : 0;
  const minutes: number = Math.floor(seconds / Constants.SECONDS_IN_MINUTE);
  const restSeconds: string = String(seconds % Constants.SECONDS_IN_MINUTE).padStart(
    Constants.TIME_PAD_LENGTH,
    Constants.ZERO_STRING,
  );

  return `${String(minutes)}${Constants.TIME_SEPARATOR}${restSeconds}`;
}

export function sequentialOrder(length: number): number[] {
  return Array.from({ length: length }, (_: unknown, index: number) => index);
}

export function shuffledOrder(
  length: number,
  firstIndex: number,
  random: () => number = Math.random,
): number[] {
  const rest: number[] = sequentialOrder(length).filter((index: number) => index !== firstIndex);

  for (let i: number = rest.length - Constants.ONE; i > Constants.ZERO; i--) {
    const j: number = Math.floor(random() * (i + Constants.ONE));
    const swapped: number = rest[i] ?? Constants.ZERO;
    rest[i] = rest[j] ?? Constants.ZERO;
    rest[j] = swapped;
  }

  return [firstIndex, ...rest];
}
