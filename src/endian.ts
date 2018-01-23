const uint32Array_1 = new Uint32Array(1);
const uint8Array_1 = new Uint8Array(uint32Array_1.buffer);

const uint32Array_2 = new Uint32Array(1);
const uint8Array_2 = new Uint8Array(uint32Array_2.buffer);

uint32Array_1[0] = 1;
export const ENDIAN = (uint8Array_1[0] === 1 ? 'le' : 'be');

export function bs2le(b1: number, b2: number, b3: number, b4: number): number {
  uint8Array_1[0] = b4;
  uint8Array_1[1] = b3;
  uint8Array_1[2] = b2;
  uint8Array_1[3] = b1;
  return uint32Array_1[0];
};

export function bs2be(b1: number, b2: number, b3: number, b4: number): number {
  uint8Array_1[0] = b1;
  uint8Array_1[1] = b2;
  uint8Array_1[2] = b3;
  uint8Array_1[3] = b4;
  return uint32Array_1[0];
};

export const bs2he = ENDIAN === 'le' ? bs2le : bs2be;

export function le2bs(int: number): Uint8Array {
  uint32Array_1[0] = int;
  uint8Array_2[0] = uint8Array_1[3];
  uint8Array_2[1] = uint8Array_1[2];
  uint8Array_2[2] = uint8Array_1[1];
  uint8Array_2[3] = uint8Array_1[0];
  return uint8Array_2;
};

export function be2bs(int: number): Uint8Array {
  uint32Array_1[0] = int;
  return uint8Array_1;
};

export const he2bs = ENDIAN === 'le' ? le2bs : be2bs;

const reverse = (int: number): number => {
  uint32Array_1[0] = int;
  uint8Array_2[0] = uint8Array_1[3];
  uint8Array_2[1] = uint8Array_1[2];
  uint8Array_2[2] = uint8Array_1[1];
  uint8Array_2[3] = uint8Array_1[0];
  return uint32Array_2[0];
}

const keep = (int: number): number => {
  return int;
}

export const le2be = reverse;
export const le2he = ENDIAN === 'le' ? keep : reverse;
export const be2le = reverse;
export const be2he = ENDIAN === 'be' ? keep : reverse;
export const he2le = ENDIAN === 'le' ? keep : reverse;
export const he2be = ENDIAN === 'be' ? keep : reverse;

const uint32Array_3 = new Uint32Array(4);
const uint16Array_3 = new Uint16Array(uint32Array_3.buffer);

const uint32Array_4 = new Uint32Array(4);
const uint16Array_4 = new Uint16Array(uint32Array_4.buffer);

export function ss2isle(
  s1: number, s2: number, s3: number, s4: number,
  s5: number, s6: number, s7: number, s8: number
): Uint32Array {
  uint16Array_3[0] = s2;
  uint16Array_3[1] = s1;
  uint16Array_3[2] = s4;
  uint16Array_3[3] = s3;
  uint16Array_3[4] = s6;
  uint16Array_3[5] = s5;
  uint16Array_3[6] = s8;
  uint16Array_3[7] = s7;
  return uint32Array_3;
}

export function ss2isbe(
  s1: number, s2: number, s3: number, s4: number,
  s5: number, s6: number, s7: number, s8: number
): Uint32Array {
  uint16Array_3[0] = s1;
  uint16Array_3[1] = s2;
  uint16Array_3[2] = s3;
  uint16Array_3[3] = s4;
  uint16Array_3[4] = s5;
  uint16Array_3[5] = s6;
  uint16Array_3[6] = s7;
  uint16Array_3[7] = s8;
  return uint32Array_3;
}

export const ss2is = ENDIAN === 'le' ? ss2isle : ss2isbe;

export function isle2ss(i1: number, i2: number, i3: number, i4: number): Uint16Array {
  uint32Array_3[0] = i1;
  uint32Array_3[1] = i2;
  uint32Array_3[2] = i3;
  uint32Array_3[3] = i4;
  uint16Array_4[0] = uint16Array_3[1];
  uint16Array_4[1] = uint16Array_3[0];
  uint16Array_4[2] = uint16Array_3[3];
  uint16Array_4[3] = uint16Array_3[2];
  uint16Array_4[4] = uint16Array_3[5];
  uint16Array_4[5] = uint16Array_3[4];
  uint16Array_4[6] = uint16Array_3[7];
  uint16Array_4[7] = uint16Array_3[6];
  return uint16Array_4;
}

export function ishe2ss(i1: number, i2: number, i3: number, i4: number): Uint16Array {
  uint32Array_3[0] = i1;
  uint32Array_3[1] = i2;
  uint32Array_3[2] = i3;
  uint32Array_3[3] = i4;
  uint16Array_4[0] = uint16Array_3[0];
  uint16Array_4[1] = uint16Array_3[1];
  uint16Array_4[2] = uint16Array_3[2];
  uint16Array_4[3] = uint16Array_3[3];
  uint16Array_4[4] = uint16Array_3[4];
  uint16Array_4[5] = uint16Array_3[5];
  uint16Array_4[6] = uint16Array_3[6];
  uint16Array_4[7] = uint16Array_3[7];
  return uint16Array_4;
}

export const is2ss = ENDIAN === 'le' ? isle2ss : ishe2ss;
