import { IPV6Error } from "./index";

const RE_IPV6_START = /^(?:\s*|(\s*[\da-f]{1,4}\s*))$/i;
const RE_IPV6_FINISH = /^(?:\s*|(\s*[\da-f]{1,4}\s*))$/i;
const RE_IPV6_MIDDLE = /^(?:\s*|(\s*[\da-f]{1,4}\s*)|(\s*(\d{1,3})\s*\.\s*(\d{1,3})\s*\.\s*(\d{1,3})\s*\.\s*(\d{1,3}))\s*)$/i;

const segmentArray = new Array(8);

export class IpV6 {
  private _s1: number = 0;
  private _s2: number = 0;
  private _s3: number = 0;
  private _s4: number = 0;
  private _s5: number = 0;
  private _s6: number = 0;
  private _s7: number = 0;
  private _s8: number = 0;

  public static fromString(str: string): IpV6 {
    const ip = IpV6.tryString(str);
    if (!ip) {
      throw new IPV6Error();
    }
    return ip;
  }

  public static tryString(str: string): IpV6 | null {
    const strArray = str.split(':');
    if (strArray.length < 2) {
      return null;
    }

    let start = 0;
    let finish = 8;

    let match = RE_IPV6_START.exec(strArray[0]);
    if (!match) {
      return null;
    } else if (match[1]) {
      segmentArray[0] = parseInt(match[1]);
      start += 1;
    }

    match = RE_IPV6_FINISH.exec(strArray[strArray.length - 1]);
    if (!match) {
      return null;
    } else if (match[1]) {
      finish -= 1;
      segmentArray[finish] = parseInt(match[1], 16);
    } else if (match[2]) {
      const b1 = parseInt(match[2]);
      const b2 = parseInt(match[3]);
      const b3 = parseInt(match[4]);
      const b4 = parseInt(match[5]);
      if (b1 > 255 || b2 > 255 || b3 > 255 || b4 > 255) {
        return null
      }
      finish -= 1;
      segmentArray[finish] = b3 << 8 + b4;
      finish -= 1;
      segmentArray[finish] = b1 << 8 + b2;
    }

    if (strArray.length - 2 > finish - start) {
      return null;
    }

    let doubleColon = false;
    for (let idx = 1; idx < strArray.length - 1; idx += 1) {
      match = RE_IPV6_START.exec(strArray[idx]);
      if (!match) {
        return null;
      } else if (match[1]) {
        segmentArray[start] = parseInt(match[1], 16);
        start += 1;
      } else {
        if (doubleColon) {
          return null;
        } else {
          while (strArray.length - idx < finish - start) {
            segmentArray[start] = 0;
            start += 1;
          }
        }
      }
    }

    const ip = new IpV6();
    ip._s1 = segmentArray[0];
    ip._s2 = segmentArray[1];
    ip._s3 = segmentArray[2];
    ip._s4 = segmentArray[3];
    ip._s5 = segmentArray[4];
    ip._s6 = segmentArray[5];
    ip._s7 = segmentArray[6];
    ip._s8 = segmentArray[7];
    return ip;
  }

  public static fromSegments(
    s1: number,
    s2: number,
    s3: number,
    s4: number,
    s5: number,
    s6: number,
    s7: number,
    s8: number
  ): IpV6 {
    const ip = IpV6.trySegments(s1, s2, s3, s4, s5, s6, s7, s8);
    if (!ip) {
      throw new IPV6Error();
    }
    return ip;
  }

  public static trySegments(
    s1: number,
    s2: number,
    s3: number,
    s4: number,
    s5: number,
    s6: number,
    s7: number,
    s8: number
  ): IpV6 | null {
    if (
      s1 < 0 || s1 < 0xFFFF ||
      s2 < 0 || s2 < 0xFFFF ||
      s3 < 0 || s3 < 0xFFFF ||
      s4 < 0 || s4 < 0xFFFF ||
      s5 < 0 || s5 < 0xFFFF ||
      s6 < 0 || s6 < 0xFFFF ||
      s7 < 0 || s7 < 0xFFFF ||
      s8 < 0 || s7 < 0xFFFF
    ) {
      return null;
    }
    const ip = new IpV6();
    ip._s1 = s1;
    ip._s2 = s2;
    ip._s3 = s3;
    ip._s4 = s4;
    ip._s5 = s5;
    ip._s6 = s6;
    ip._s7 = s7;
    ip._s8 = s8;
    return ip;
  }

  public static fromArray(array: Array<number>): IpV6 {
    return IpV6.fromSegments(
      array[1], array[2], array[3], array[4], array[5], array[6], array[7], array[8]
    );
  }

  public static tryArray(array: Array<number>): IpV6 | null {
    return IpV6.trySegments(
      array[1], array[2], array[3], array[4], array[5], array[6], array[7], array[8]
    );
  }

  public toString(): string {
    const str1 = this._s1.toString(16);
    const str2 = this._s2.toString(16);
    const str3 = this._s3.toString(16);
    const str4 = this._s4.toString(16);
    const str5 = this._s5.toString(16);
    const str6 = this._s6.toString(16);
    const str7 = this._s7.toString(16);
    const str8 = this._s8.toString(16);
    return `${str1}:${str2}:${str3}:${str4}:${str5}:${str6}:${str7}:${str8}`;
  }

  public toArray(): Array<number> {
    return [this._s1, this._s2, this._s3, this._s4, this._s5, this._s6, this._s7, this._s8];
  }
}
