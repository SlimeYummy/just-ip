import { IPV6Error } from "./utilv6";
import * as u6 from "./utilv6";
import { is2ss, ss2he } from "./endian";

export class IpV6 {
  private _i1: number = 0;
  private _i2: number = 0;
  private _i3: number = 0;
  private _i4: number = 0;

  public static fromString(str: string): IpV6 {
    const ip = IpV6.tryString(str);
    if (!ip) {
      throw new IPV6Error();
    }
    return ip;
  }

  public static tryString(str: string): IpV6 | null {
    const strArray = str.split(':');
    const uint32Array = u6.parseSplit(strArray);
    if (!uint32Array) {
      return null;
    }
    const ip = new IpV6();
    ip._i1 = uint32Array[0];
    ip._i2 = uint32Array[1];
    ip._i3 = uint32Array[2];
    ip._i4 = uint32Array[3];
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
      (s1 < 0 || 0xFFFF < s1) ||
      (s2 < 0 || 0xFFFF < s2) ||
      (s3 < 0 || 0xFFFF < s3) ||
      (s4 < 0 || 0xFFFF < s4) ||
      (s5 < 0 || 0xFFFF < s5) ||
      (s6 < 0 || 0xFFFF < s6) ||
      (s7 < 0 || 0xFFFF < s7) ||
      (s8 < 0 || 0xFFFF < s8)
    ) {
      return null;
    }
    const uint32Array = ss2he(s1, s2, s3, s4, s5, s6, s7, s8);
    const ip = new IpV6();
    ip._i1 = uint32Array[0];
    ip._i2 = uint32Array[1];
    ip._i3 = uint32Array[2];
    ip._i4 = uint32Array[3];
    return ip;
  }

  public static fromArray(
    arr: Array<number>
  ): IpV6 {
    return IpV6.fromSegments(arr[0], arr[1], arr[2], arr[3], arr[4], arr[5], arr[6], arr[7]);
  }

  public static tryArray(
    arr: Array<number>
  ): IpV6 | null {
    return IpV6.trySegments(arr[0], arr[1], arr[2], arr[3], arr[4], arr[5], arr[6], arr[7]);
  }

  public toString(
    type?: 'short' | 'mapped' | 'short-mapped',
  ): string {
    switch (type) {
      case undefined:
        return u6.toString(this._i1, this._i2, this._i3, this._i4);
      case 'short':
        return u6.toStringShort(this._i1, this._i2, this._i3, this._i4);
      case 'mapped':
        return u6.toStringMapped(this._i1, this._i2, this._i3, this._i4);
      case 'short-mapped':
        return u6.toStringShortMapped(this._i1, this._i2, this._i3, this._i4);
      default:
        throw new Error();
    }
  }

  public toArray(
    fillArray?: Array<number>,
  ): Array<number> {
    const uint16Array = is2ss(this._i1, this._i2, this._i3, this._i4);
    if (!fillArray) {
      return [
        uint16Array[0], uint16Array[1], uint16Array[2], uint16Array[3],
        uint16Array[4], uint16Array[5], uint16Array[6], uint16Array[7],
      ];
    }
    fillArray[0] = uint16Array[0];
    fillArray[1] = uint16Array[1];
    fillArray[2] = uint16Array[2];
    fillArray[3] = uint16Array[3];
    fillArray[4] = uint16Array[4];
    fillArray[5] = uint16Array[5];
    fillArray[6] = uint16Array[6];
    fillArray[7] = uint16Array[7];
    return fillArray;
  }
}
