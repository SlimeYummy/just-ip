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

export class IpV4 {
  private _b1: number = 0;
  private _b2: number = 0;
  private _b3: number = 0;
  private _b4: number = 0;
  private _int: number = 0;

  public static fromString(str: string): IpV4 {
    const match = RE_IPV4.exec(str);
    if (!match) {
      throw new IPV4Error();
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
    if (int < -0x80000000 || 0xFFFFFFFF < int) {
      throw new IPV4Error();
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
    if (int < -0x80000000 || 0xFFFFFFFF < int) {
      throw new IPV4Error();
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
    if (int < -0x80000000 || 0xFFFFFFFF < int) {
      throw new IPV4Error();
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
    if (
      (b1 < 0 || 255 < b1) ||
      (b2 < 0 || 255 < b2) ||
      (b3 < 0 || 255 < b3) ||
      (b4 < 0 || 255 < b4)
    ) {
      throw new IPV4Error();
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

  public static equal(ip1: IpV4, ip2: IpV4): boolean {
    return ip1._int === ip2._int;
  }

  public equal(ip: IpV4): boolean {
    return this._int === ip._int;
  }

  public isUnspecified(): boolean {
    return this._int === 0;
  }

  public isLoopback(): boolean {
    return (this._int >>> 8) === 0x7F0000;
  }

  public isPrivate(): boolean {
    return (this._int >>> 24) === 0x0A ||
    (this._int >>> 20) === 0xAC1 ||
    (this._int >>> 16) === 0xC0A8;
  }

  public isLinkLocal(): boolean {
    return (this._int >>> 16) === 0xA9FE;
  }

  public isMulticast(): boolean {
    return (this._int >>> 28) === 0xE;
  }

  public isBroadcast(): boolean {
    return this._int === 0xFFFFFFFF;
  }

  public isDocumentation(): boolean {
    return (this._int >>> 8) === 0xC00002 ||
    (this._int >>> 8) === 0xC63364 ||
    (this._int >>> 8) === 0xCB0071;
  }

  public isGlobal(): boolean {
    return !this.isPrivate() &&
      !this.isLoopback() &&
      !this.isLinkLocal() &&
      !this.isBroadcast() &&
      !this.isDocumentation() &&
      !this.isUnspecified();
  }
}
