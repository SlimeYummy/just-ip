const u32x1Ret = new Uint32Array(1);
const u8x4Ret = new Uint8Array(u32x1Ret.buffer);

const u32x1Tmp = new Uint32Array(1);
const u8x4Tmp = new Uint8Array(u32x1Tmp.buffer);

const u32x4Ret = new Uint32Array(4);
const u16x8Ret = new Uint16Array(u32x4Ret.buffer);

const u32x4Tmp = new Uint32Array(4);
const u16x8Tmp = new Uint16Array(u32x4Tmp.buffer);

u32x1Ret[0] = 1;
export const ENDIAN = (u8x4Ret[0] === 1 ? 'le' : 'be');

// bytes => little endian
export function bs2le(b1: number, b2: number, b3: number, b4: number): number {
  u8x4Ret[0] = b4;
  u8x4Ret[1] = b3;
  u8x4Ret[2] = b2;
  u8x4Ret[3] = b1;
  return u32x1Ret[0];
};

// bytes => big endian
export function bs2be(b1: number, b2: number, b3: number, b4: number): number {
  u8x4Ret[0] = b1;
  u8x4Ret[1] = b2;
  u8x4Ret[2] = b3;
  u8x4Ret[3] = b4;
  return u32x1Ret[0];
};

// bytes => host endian
export const bs2he = ENDIAN === 'le' ? bs2le : bs2be;

// little endian => bytes
export function le2bs(int: number): Uint8Array {
  u32x1Tmp[0] = int;
  u8x4Ret[0] = u8x4Tmp[3];
  u8x4Ret[1] = u8x4Tmp[2];
  u8x4Ret[2] = u8x4Tmp[1];
  u8x4Ret[3] = u8x4Tmp[0];
  return u8x4Ret;
};

// big endian => bytes
export function be2bs(int: number): Uint8Array {
  u32x1Ret[0] = int;
  return u8x4Ret;
};

// host endian => bytes
export const he2bs = ENDIAN === 'le' ? le2bs : be2bs;

function reverse(int: number): number {
  u32x1Tmp[0] = int;
  u8x4Ret[0] = u8x4Tmp[3];
  u8x4Ret[1] = u8x4Tmp[2];
  u8x4Ret[2] = u8x4Tmp[1];
  u8x4Ret[3] = u8x4Tmp[0];
  return u32x1Ret[0];
}

function keep(int: number): number {
  return int;
}

// little endian => big endian
export const le2be = reverse;

// host endian => host endian
export const le2he = ENDIAN === 'le' ? keep : reverse;

// big endian => little endian
export const be2le = reverse;

// big endian => host endian
export const be2he = ENDIAN === 'be' ? keep : reverse;

// host endian => littlr endian
export const he2le = ENDIAN === 'le' ? keep : reverse;

// host endian => big endian
export const he2be = ENDIAN === 'be' ? keep : reverse;

// shorts => little endian (ints)
export function ss2le(
  s1: number, s2: number, s3: number, s4: number,
  s5: number, s6: number, s7: number, s8: number
): Uint32Array {
  u16x8Ret[0] = s2;
  u16x8Ret[1] = s1;
  u16x8Ret[2] = s4;
  u16x8Ret[3] = s3;
  u16x8Ret[4] = s6;
  u16x8Ret[5] = s5;
  u16x8Ret[6] = s8;
  u16x8Ret[7] = s7;
  return u32x4Ret;
}

// shorts => big endian (ints)
export function ss2be(
  s1: number, s2: number, s3: number, s4: number,
  s5: number, s6: number, s7: number, s8: number
): Uint32Array {
  u16x8Ret[0] = s1;
  u16x8Ret[1] = s2;
  u16x8Ret[2] = s3;
  u16x8Ret[3] = s4;
  u16x8Ret[4] = s5;
  u16x8Ret[5] = s6;
  u16x8Ret[6] = s7;
  u16x8Ret[7] = s8;
  return u32x4Ret;
}

// shorts => host endian (ints)
export const ss2he = ENDIAN === 'le' ? ss2le : ss2be;

// little endian (ints) => shorts
export function le2ss(i1: number, i2: number, i3: number, i4: number): Uint16Array {
  u32x4Tmp[0] = i1;
  u32x4Tmp[1] = i2;
  u32x4Tmp[2] = i3;
  u32x4Tmp[3] = i4;
  u16x8Ret[0] = u16x8Tmp[1];
  u16x8Ret[1] = u16x8Tmp[0];
  u16x8Ret[2] = u16x8Tmp[3];
  u16x8Ret[3] = u16x8Tmp[2];
  u16x8Ret[4] = u16x8Tmp[5];
  u16x8Ret[5] = u16x8Tmp[4];
  u16x8Ret[6] = u16x8Tmp[7];
  u16x8Ret[7] = u16x8Tmp[6];
  return u16x8Ret;
}

// big endian (ints) => shorts
export function be2ss(i1: number, i2: number, i3: number, i4: number): Uint16Array {
  u32x4Tmp[0] = i1;
  u32x4Tmp[1] = i2;
  u32x4Tmp[2] = i3;
  u32x4Tmp[3] = i4;
  u16x8Ret[0] = u16x8Tmp[0];
  u16x8Ret[1] = u16x8Tmp[1];
  u16x8Ret[2] = u16x8Tmp[2];
  u16x8Ret[3] = u16x8Tmp[3];
  u16x8Ret[4] = u16x8Tmp[4];
  u16x8Ret[5] = u16x8Tmp[5];
  u16x8Ret[6] = u16x8Tmp[6];
  u16x8Ret[7] = u16x8Tmp[7];
  return u16x8Ret;
}

// host endian (ints) => shorts
export const is2ss = ENDIAN === 'le' ? le2ss : be2ss;
