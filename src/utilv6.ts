import { ss2is, is2ss } from "./endian";
import { toStringV4 } from "./utilv4";

export class IPV6Error extends Error { };
export class NetV6Error extends Error { };

const helperArray = new Uint16Array(8);

const RE_IPV6 = /^(?:\s*|\s*([\da-f]{1,4})\s*|\s*(\d{1,3})\s*\.\s*(\d{1,3})\s*\.\s*(\d{1,3})\s*\.\s*(\d{1,3})\s*)$/i;
const RE_SPACE = /^\s*$/;

export function parseSplit(
  strArray: Array<string>,
): Uint32Array | null {
  let strCount = 0;
  const numArray = helperArray;
  let numCount = 0;
  let colon = -1;
  let mapped = false;

  while (strCount < strArray.length) {
    const match = RE_IPV6.exec(strArray[strCount]);
    if (!match) {
      return null;

    } else if (match[1]) {
      if (numCount >= 8) {
        return null;
      }
      numArray[numCount++] = parseInt(match[1], 16);
      strCount += 1;

    } else if (match[2]) {
      if (numCount >= 7) {
        return null;
      }
      const b1 = parseInt(match[2]);
      const b2 = parseInt(match[3]);
      const b3 = parseInt(match[4]);
      const b4 = parseInt(match[5]);
      if (b1 > 255 || b2 > 255 || b3 > 255 || b4 > 255) {
        return null;
      }
      numArray[numCount++] = (b1 << 8) + b2; // error
      numArray[numCount++] = (b3 << 8) + b4; // error
      strCount += 1;
      mapped = true;

    } else {
      if (strCount === 0) {
        strCount += 1;
        if (!RE_SPACE.test(strArray[strCount])) {
          return null;
        }
        colon = 0;
      } else if (strCount === strArray.length - 1) {
        if (colon !== numCount) {
          return null;
        }
      } else {
        if (colon !== -1) {
          return null;
        }
        colon = numCount;
      }
      strCount += 1;
    }
  }

  if (colon === -1) {
    if (numCount !== 8) {
      return null;
    }

  } else {
    if (numCount > 7) {
      return null;
    }

    let idx2 = 7;
    for (let idx = numCount - 1; idx >= colon; --idx) {
      numArray[idx2--] = numArray[idx];
    }
    const zeroCount = 8 - numCount;
    for (let idx = colon; idx < colon + zeroCount; ++idx) {
      numArray[idx] = 0;
    }
  }

  const uint32Array = ss2is(
    numArray[0], numArray[1], numArray[2], numArray[3],
    numArray[4], numArray[5], numArray[6], numArray[7]
  );
  if (
    mapped &&
    (uint32Array[0] !== 0 || uint32Array[1] !== 0 || uint32Array[2] !== 0xFFFF)
  ) {
    return null;
  }
  return uint32Array;
}

export function toString(
  i1: number,
  i2: number,
  i3: number,
  i4: number,
): string {
  const uint16Array = is2ss(i1, i2, i3, i4);
  const str1 = uint16Array[0].toString(16);
  const str2 = uint16Array[1].toString(16);
  const str3 = uint16Array[2].toString(16);
  const str4 = uint16Array[3].toString(16);
  const str5 = uint16Array[4].toString(16);
  const str6 = uint16Array[5].toString(16);
  const str7 = uint16Array[6].toString(16);
  const str8 = uint16Array[7].toString(16);
  const str = `${str1}:${str2}:${str3}:${str4}:${str5}:${str6}:${str7}:${str8}`;
  return str;
}

export function toStringMapped(
  i1: number,
  i2: number,
  i3: number,
  i4: number,
): string {
  if (i1 !== 0 || i2 !== 0 || i3 !== 0xFFFF) {
    throw new IPV6Error();
  }
  const uint16Array = is2ss(i1, i2, i3, i4);
  const str1 = uint16Array[0].toString(16);
  const str2 = uint16Array[1].toString(16);
  const str3 = uint16Array[2].toString(16);
  const str4 = uint16Array[3].toString(16);
  const str5 = uint16Array[4].toString(16);
  const str6 = uint16Array[5].toString(16);
  const strIp = toStringV4(i4);
  const str = `${str1}:${str2}:${str3}:${str4}:${str5}:${str6}:${strIp}`;
  return str;
}

function _toStringShort(
  i1: number,
  i2: number,
  i3: number,
  i4: number,
  len: number,
): Array<string> {
  const uint16Array = is2ss(i1, i2, i3, i4);
  let zeroStart = 0;
  let zeroCount = 0;
  let counter = 0;
  for (let idx = 0; idx < len; ++idx) {
    if (uint16Array[idx] === 0) {
      counter += 1;
      if (counter > zeroCount) {
        zeroCount = counter;
        zeroStart = (idx + 1) - zeroCount;
      }
    } else {
      counter = 0;
    }
  }
  let strArray = [];
  for (let idx = 0; idx < zeroStart; ++idx) {
    strArray.push(uint16Array[idx].toString(16));
  }
  if (zeroCount > 0) {
    if (strArray.length === 0) {
      strArray.push('');
    }
    if (zeroStart + zeroCount === 8) {
      strArray.push('');
    }
    strArray.push('');
  }
  for (let idx = zeroStart + zeroCount; idx < len; ++idx) {
    strArray.push(uint16Array[idx].toString(16));
  }
  return strArray;
}

export function toStringShort(
  i1: number,
  i2: number,
  i3: number,
  i4: number,
): string {
  const strArray = _toStringShort(i1, i2, i3, i4, 8);
  return strArray.join(':');
}

export function toStringShortMapped(
  i1: number,
  i2: number,
  i3: number,
  i4: number,
): string {
  if (i1 !== 0 || i2 !== 0 || i3 !== 0xFFFF) {
    throw new IPV6Error();
  }
  const strArray = _toStringShort(i1, i2, i3, i4, 6);
  strArray.push(toStringV4(i4));
  return strArray.join(':');
}
