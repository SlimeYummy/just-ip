import { bs2he, be2he, le2he, he2bs, he2be, he2le } from './endian';

export class IpV4Error extends Error { };

export type IpV4Like = IpV4 | string | number | Array<number>;

// 127.0.0.1
const RE_IPV4 = /^\s*(\d{1,3})\s*\.\s*(\d{1,3})\s*\.\s*(\d{1,3})\s*\.\s*(\d{1,3})\s*$/;

export class IpV4 {
  private _int: number = 0;

  public static from(like: IpV4Like): IpV4 {
    const ip = IpV4.try(like);
    if (!ip) {
      throw new IpV4Error();
    }
    return ip;
  }

  public static try(like: IpV4Like): IpV4 | null {
    if (like instanceof IpV4) {
      return like;
    } else if (typeof like === 'number') {
      return IpV4.fromInt(like);
    } else if (typeof like === 'string') {
      return IpV4.fromString(like);
    } else if (Array.isArray(like)) {
      return IpV4.fromArray(like);
    } else {
      return null;
    }
  }

  public static fromString(str: string): IpV4 {
    const ip = IpV4.tryString(str);
    if (!ip) {
      throw new IpV4Error();
    }
    return ip;
  }

  public static tryString(str: string): IpV4 | null {
    const match = RE_IPV4.exec(str);
    if (!match) {
      return null;
    }
    const b1 = parseInt(match[1]);
    const b2 = parseInt(match[2]);
    const b3 = parseInt(match[3]);
    const b4 = parseInt(match[4]);
    if (b1 > 255 || b2 > 255 || b3 > 255 || b4 > 255) {
      return null;
    }
    const ip = new IpV4();
    ip._int = bs2he(b1, b2, b3, b4);
    return ip;
  }

  public static fromInt(int: number): IpV4 {
    const ip = IpV4.tryInt(int);
    if (!ip) {
      throw new IpV4Error();
    }
    return ip;
  }

  public static tryInt(int: number): IpV4 | null {
    if (int < -0x80000000 || 0xFFFFFFFF < int) {
      return null;
    }
    int = int >>> 0;
    const ip = new IpV4();
    ip._int = int;
    return ip;
  }

  public static fromIntBe(int: number): IpV4 {
    const ip = IpV4.tryIntBe(int);
    if (!ip) {
      throw new IpV4Error();
    }
    return ip;
  }

  public static tryIntBe(int: number): IpV4 | null {
    if (int < -0x80000000 || 0xFFFFFFFF < int) {
      return null;
    }
    int = int >>> 0;
    const ip = new IpV4();
    ip._int = be2he(int);
    return ip;
  }

  public static fromIntLe(int: number): IpV4 {
    const ip = IpV4.tryIntLe(int);
    if (!ip) {
      throw new IpV4Error();
    }
    return ip;
  }

  public static tryIntLe(int: number): IpV4 | null {
    if (int < -0x80000000 || 0xFFFFFFFF < int) {
      return null;
    }
    int = int >>> 0;
    const ip = new IpV4();
    ip._int = le2he(int);
    return ip;
  }

  public static fromBytes(b1: number, b2: number, b3: number, b4: number): IpV4 {
    const ip = IpV4.tryBytes(b1, b2, b3, b4);
    if (!ip) {
      throw new IpV4Error();
    }
    return ip;
  }

  public static tryBytes(b1: number, b2: number, b3: number, b4: number): IpV4 | null {
    if (
      (b1 < 0 || 255 < b1) ||
      (b2 < 0 || 255 < b2) ||
      (b3 < 0 || 255 < b3) ||
      (b4 < 0 || 255 < b4)
    ) {
      return null;
    }
    const ip = new IpV4();
    ip._int = bs2he(b1, b2, b3, b4);
    return ip;
  }

  public static fromArray(arr: Array<number>): IpV4 {
    return IpV4.fromBytes(arr[0], arr[1], arr[2], arr[3]);
  }

  public static tryArray(arr: Array<number>): IpV4 | null {
    return IpV4.tryBytes(arr[0], arr[1], arr[2], arr[3]);
  }

  public toString(): string {
    const bs = he2bs(this._int);
    return `${bs[0]}.${bs[1]}.${bs[2]}.${bs[3]}`;
  }

  public toInt(): number {
    return this._int;
  }

  public toIntBe(): number {
    return he2be(this._int);
  }

  public toIntLe(): number {
    return he2le(this._int);
  }

  public toArray(): Array<number> {
    const bs = he2bs(this._int);
    return Array.from(bs);
  }

  public equal(ip: IpV4): boolean {
    return this._int === ip._int;
  }

  public static equal(ip1: IpV4Like, ip2: IpV4Like): boolean {
    return IpV4.from(ip1).equal(IpV4.from(ip2));
  }

  public isUnspecified(): boolean {
    return this._int === 0;
  }

  public static isUnspecified(ip: IpV4Like): boolean {
    return IpV4.from(ip).isUnspecified();
  }

  public isLoopback(): boolean {
    return (this._int >>> 8) === 0x7F0000;
  }

  public static isLoopback(ip: IpV4Like): boolean {
    return IpV4.from(ip).isLoopback();
  }

  public isPrivate(): boolean {
    return (this._int >>> 24) === 0x0A ||
      (this._int >>> 20) === 0xAC1 ||
      (this._int >>> 16) === 0xC0A8;
  }

  public static isPrivate(ip: IpV4Like): boolean {
    return IpV4.from(ip).isPrivate();
  }

  public isLinkLocal(): boolean {
    return (this._int >>> 16) === 0xA9FE;
  }

  public static isLinkLocal(ip: IpV4Like): boolean {
    return IpV4.from(ip).isLinkLocal();
  }

  public isMulticast(): boolean {
    return (this._int >>> 28) === 0xE;
  }

  public static isMulticast(ip: IpV4Like): boolean {
    return IpV4.from(ip).isMulticast();
  }

  public isBroadcast(): boolean {
    return this._int === 0xFFFFFFFF;
  }

  public static isBroadcast(ip: IpV4Like): boolean {
    return IpV4.from(ip).isBroadcast();
  }

  public isDocumentation(): boolean {
    return (this._int >>> 8) === 0xC00002 ||
      (this._int >>> 8) === 0xC63364 ||
      (this._int >>> 8) === 0xCB0071;
  }

  public static isDocumentation(ip: IpV4Like): boolean {
    return IpV4.from(ip).isDocumentation();
  }

  public isGlobal(): boolean {
    return !this.isPrivate() &&
      !this.isLoopback() &&
      !this.isLinkLocal() &&
      !this.isBroadcast() &&
      !this.isDocumentation() &&
      !this.isUnspecified();
  }

  public static isGlobal(ip: IpV4Like): boolean {
    return IpV4.from(ip).isGlobal();
  }
}
