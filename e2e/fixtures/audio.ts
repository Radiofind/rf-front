const NOTE_SECONDS: number = 0.25;

const AMPLITUDE: number = 0.3 * 0x7fff;

const randomFrom = (seed: number): (() => number) => {
  let state: number = seed >>> 0;

  return (): number => {
    state = (state + 0x6d2b79f5) >>> 0;
    let value: number = Math.imul(state ^ (state >>> 15), 1 | state);
    value ^= value + Math.imul(value ^ (value >>> 7), 61 | value);
    return ((value ^ (value >>> 14)) >>> 0) / 0x100000000;
  };
};

const wavHeader = (sampleRate: number, dataBytes: number): Buffer => {
  const header: Buffer = Buffer.alloc(44);
  header.write('RIFF', 0);
  header.writeUInt32LE(36 + dataBytes, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(1, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(sampleRate * 2, 28);
  header.writeUInt16LE(2, 32);
  header.writeUInt16LE(16, 34);
  header.write('data', 36);
  header.writeUInt32LE(dataBytes, 40);
  return header;
};

export const randomSeed = (): number => Math.floor(Math.random() * 0x7fffffff);

export const melodyWav = (
  seed: number,
  sampleRate: number = 22050,
  seconds: number = 20,
): Buffer => {
  const random: () => number = randomFrom(seed);
  const samplesPerNote: number = Math.round(NOTE_SECONDS * sampleRate);
  const noteCount: number = Math.round(seconds / NOTE_SECONDS);
  const frequencies: number[] = Array.from(
    { length: noteCount },
    () => 220 * 2 ** (Math.floor(random() * 24) / 12),
  );
  const data: Buffer = Buffer.alloc(noteCount * samplesPerNote * 2);

  frequencies.forEach((frequency: number, note: number) => {
    for (let i = 0; i < samplesPerNote; i++) {
      const time: number = i / sampleRate;
      const envelope: number = Math.min(1, i / 200, (samplesPerNote - i) / 200);
      const sample: number =
        Math.sin(2 * Math.PI * frequency * time) + 0.5 * Math.sin(4 * Math.PI * frequency * time);
      data.writeInt16LE(
        Math.round((AMPLITUDE * envelope * sample) / 1.5),
        (note * samplesPerNote + i) * 2,
      );
    }
  });

  return Buffer.concat([wavHeader(sampleRate, data.length), data]);
};
