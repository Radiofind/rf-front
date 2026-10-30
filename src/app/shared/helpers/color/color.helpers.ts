import { ColorConstants } from '../../constants/color.constants';

function getChannel(hexColor: string, offset: number): number {
  return (
    parseInt(
      hexColor.slice(offset, offset + ColorConstants.HEX_CHANNEL_LENGTH),
      ColorConstants.HEX_RADIX,
    ) / ColorConstants.MAX_CHANNEL_VALUE
  );
}

export function getHue(hexColor: string): number {
  const red: number = getChannel(hexColor, ColorConstants.RED_OFFSET);
  const green: number = getChannel(hexColor, ColorConstants.GREEN_OFFSET);
  const blue: number = getChannel(hexColor, ColorConstants.BLUE_OFFSET);
  const max: number = Math.max(red, green, blue);
  const delta: number = max - Math.min(red, green, blue);

  if (delta === 0) {
    return 0;
  }

  let sector: number;

  if (max === red) {
    sector = ((green - blue) / delta) % ColorConstants.SECTOR_COUNT;
  } else if (max === green) {
    sector = (blue - red) / delta + ColorConstants.GREEN_SECTOR_OFFSET;
  } else {
    sector = (red - green) / delta + ColorConstants.BLUE_SECTOR_OFFSET;
  }

  return (
    (sector * ColorConstants.DEGREES_PER_SECTOR + ColorConstants.FULL_TURN) %
    ColorConstants.FULL_TURN
  );
}

export function getHueShift(fromHexColor: string, toHexColor: string): number {
  const difference: number = getHue(toHexColor) - getHue(fromHexColor);

  return Math.round(
    (((difference % ColorConstants.FULL_TURN) +
      ColorConstants.FULL_TURN +
      ColorConstants.HALF_TURN) %
      ColorConstants.FULL_TURN) -
      ColorConstants.HALF_TURN,
  );
}
