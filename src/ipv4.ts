import { IPV4Error, makeRegex } from './util';
import { bs2he, he2bs, be2bs, be2he, le2bs, le2he, he2be } from './endian';

// 127.0.0.1
const RE_IPV4 = makeRegex(`^
\\s*(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])
\\s*\\.
\\s*(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])
\\s*\\.
\\s*(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])
\\s*\\.
\\s*(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])
\\s*$`);

export type IpV4Like = IpV4 | string | number | Array<number>;

function castIpV4(ip: IpV4Like): IpV4 {
  if (typeof ip === 'string') {
    return IpV4.fromString(ip);
  } else if (typeof ip === 'number') {
    return IpV4.fromInt(ip);
  } else if (ip instanceof IpV4) {
    return ip;
  } else if (Array.isArray(ip)) {
    return IpV4.fromArray(ip);
  } else {
    throw new IPV4Error();
  }
}

export class IpV4 {
  private _b1: number = 0;
  private _b2: number = 0;
  private _b3: number = 0;
  private _b4: number = 0;
  private _int: number = 0;

  public static fromString(str: string): IpV4 {
    const ip = IpV4.tryFromString(str);
    if (!ip) {
      throw new IPV4Error();
    }
    return ip;
  }

  public static tryFromString(str: string): IpV4 | null {
    const match = RE_IPV4.exec(str);
    if (!match) {
      return null;
    }
    const ip = new IpV4();
    ip._b1 = parseInt(match[1]);
    ip._b2 = parseInt(match[2]);
    ip._b3 = parseInt(match[3]);
    ip._b4 = parseInt(match[4]);
    ip._int = bs2he(ip._b1, ip._b2, ip._b3, ip._b4);
    return ip;
  }

  public static fromInt(int: number): IpV4 {
    const ip = IpV4.tryFromInt(int);
    if (!ip) {
      throw new IPV4Error();
    }
    return ip;
  }

  public static tryFromInt(int: number): IpV4 | null {
    if (int < -0x80000000 || 0xFFFFFFFF < int) {
      return null;
    }
    int = int >>> 0;
    const ip = new IpV4();
    const bytes = he2bs(int);
    ip._b1 = bytes[0];
    ip._b2 = bytes[1];
    ip._b3 = bytes[2];
    ip._b4 = bytes[3];
    ip._int = int;
    return ip;
  }

  public static fromIntBe(int: number): IpV4 {
    const ip = IpV4.tryFromIntBe(int);
    if (!ip) {
      throw new IPV4Error();
    }
    return ip;
  }

  public static tryFromIntBe(int: number): IpV4 | null {
    if (int < -0x80000000 || 0xFFFFFFFF < int) {
      return null;
    }
    int = int >>> 0;
    const ip = new IpV4();
    const bytes = be2bs(int);
    ip._b1 = bytes[0];
    ip._b2 = bytes[1];
    ip._b3 = bytes[2];
    ip._b4 = bytes[3];
    ip._int = be2he(int);
    return ip;
  }

  public static fromIntLe(int: number): IpV4 {
    const ip = IpV4.tryFromIntLe(int);
    if (!ip) {
      throw new IPV4Error();
    }
    return ip;
  }

  public static tryFromIntLe(int: number): IpV4 | null {
    if (int < -0x80000000 || 0xFFFFFFFF < int) {
      return null;
    }
    int = int >>> 0;
    const ip = new IpV4();
    const bytes = le2bs(int);
    ip._b1 = bytes[0];
    ip._b2 = bytes[1];
    ip._b3 = bytes[2];
    ip._b4 = bytes[3];
    ip._int = le2he(int);
    return ip;
  }

  public static fromBytes(b1: number, b2: number, b3: number, b4: number): IpV4 {
    const ip = IpV4.tryFromBytes(b1, b2, b3, b4);
    if (!ip) {
      throw new IPV4Error();
    }
    return ip;
  }

  public static tryFromBytes(b1: number, b2: number, b3: number, b4: number): IpV4 | null {
    if (
      (b1 < 0 || 255 < b1) ||
      (b2 < 0 || 255 < b2) ||
      (b3 < 0 || 255 < b3) ||
      (b4 < 0 || 255 < b4)
    ) {
      return null;
    }
    const ip = new IpV4();
    ip._b1 = b1;
    ip._b2 = b2;
    ip._b3 = b3;
    ip._b4 = b4;
    ip._int = bs2he(b1, b2, b3, b4);
    return ip;
  }

  public static fromArray(array: Array<number>): IpV4 {
    return IpV4.fromBytes(array[0], array[1], array[2], array[3]);
  }

  public static tryFromArray(array: Array<number>): IpV4 | null {
    return IpV4.tryFromBytes(array[0], array[1], array[2], array[3]);
  }

  public toString(): string {
    return `${this._b1}.${this._b2}.${this._b3}.${this._b4}`;
  }

  public toInt(): number {
    return this._int;
  }

  public toIntBe(): number {
    return he2be(this._int);
  }

  public toIntLe(): number {
    return le2he(this._int);
  }

  public toArray(): Array<number> {
    return [this._b1, this._b2, this._b3, this._b4];
  }

  public equal(ip: IpV4): boolean {
    return this._int === ip._int;
  }

  public static equal(ip1: IpV4Like, ip2: IpV4Like): boolean {
    return castIpV4(ip1).equal(castIpV4(ip2));
  }

  public isUnspecified(): boolean {
    return this._int === 0;
  }

  public static isUnspecified(ip: IpV4Like): boolean {
    return castIpV4(ip).isUnspecified();
  }

  public isLoopback(): boolean {
    return (this._int >>> 8) === 0x7F0000;
  }

  public static isLoopback(ip: IpV4Like): boolean {
    return castIpV4(ip).isLoopback();
  }

  public isPrivate(): boolean {
    return (this._int >>> 24) === 0x0A ||
      (this._int >>> 20) === 0xAC1 ||
      (this._int >>> 16) === 0xC0A8;
  }

  public static isPrivate(ip: IpV4Like): boolean {
    return castIpV4(ip).isPrivate();
  }

  public isLinkLocal(): boolean {
    return (this._int >>> 16) === 0xA9FE;
  }

  public static isLinkLocal(ip: IpV4Like): boolean {
    return castIpV4(ip).isLinkLocal();
  }

  public isMulticast(): boolean {
    return (this._int >>> 28) === 0xE;
  }

  public static isMulticast(ip: IpV4Like): boolean {
    return castIpV4(ip).isMulticast();
  }

  public isBroadcast(): boolean {
    return this._int === 0xFFFFFFFF;
  }

  public static isBroadcast(ip: IpV4Like): boolean {
    return castIpV4(ip).isBroadcast();
  }

  public isDocumentation(): boolean {
    return (this._int >>> 8) === 0xC00002 ||
      (this._int >>> 8) === 0xC63364 ||
      (this._int >>> 8) === 0xCB0071;
  }

  public static isDocumentation(ip: IpV4Like): boolean {
    return castIpV4(ip).isDocumentation();
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
    return castIpV4(ip).isGlobal();
  }
}
