const intBuf_1 = new Uint32Array(1);
const byteBuf_1 = new Uint8Array(intBuf_1.buffer);

const intBuf_2 = new Uint32Array(1);
const byteBuf_2 = new Uint8Array(intBuf_2.buffer);

intBuf_1[0] = 1;
export const ENDIAN = (byteBuf_1[0] === 1 ? 'le' : 'be');

export function bs2le(b1: number, b2: number, b3: number, b4: number): number {
  byteBuf_1[0] = b4;
  byteBuf_1[1] = b3;
  byteBuf_1[2] = b2;
  byteBuf_1[3] = b1;
  return intBuf_1[0];
};

export function bs2be(b1: number, b2: number, b3: number, b4: number): number {
  byteBuf_1[0] = b1;
  byteBuf_1[1] = b2;
  byteBuf_1[2] = b3;
  byteBuf_1[3] = b4;
  return intBuf_1[0];
};

export const bs2he = ENDIAN === 'le' ? bs2le : bs2be;

export function le2bs(int: number): Uint8Array {
  intBuf_1[0] = int;
  byteBuf_2[0] = byteBuf_1[3];
  byteBuf_2[1] = byteBuf_1[2];
  byteBuf_2[2] = byteBuf_1[1];
  byteBuf_2[3] = byteBuf_1[0];
  return byteBuf_2;
};

export function be2bs(int: number): Uint8Array {
  intBuf_1[0] = int;
  return byteBuf_1;
};

export const he2bs = ENDIAN === 'le' ? le2bs : be2bs;

function reverse(int: number): number {
  intBuf_1[0] = int;
  byteBuf_2[0] = byteBuf_1[3];
  byteBuf_2[1] = byteBuf_1[2];
  byteBuf_2[2] = byteBuf_1[1];
  byteBuf_2[3] = byteBuf_1[0];
  return intBuf_2[0];
}

function keep(int: number): number {
  return int;
}

export const le2be = reverse;
export const le2he = ENDIAN === 'le' ? keep : reverse;
export const be2le = reverse;
export const be2he = ENDIAN === 'be' ? keep : reverse;
export const he2le = ENDIAN === 'le' ? keep : reverse;
export const he2be = ENDIAN === 'be' ? keep : reverse;
