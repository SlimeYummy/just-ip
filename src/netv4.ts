import { NetV4Error, makeRegex } from './util';
import { bs2he, he2bs, he2be, he2le } from './endian';
import { IpV4 } from './ipv4';

// 192.168.0.0/24
const RE_SUBNET_V4_BITS = makeRegex(`^
\\s*(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])
\\s*\\.
\\s*(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])
\\s*\\.
\\s*(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])
\\s*\\.
\\s*(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])
\\s*\\/
\\s*(3[0-2]|[1-2][0-9]|[0-9])
\\s*$`);

// 192.168.0.0/255.255.255.0
const RE_SUBNET_V4_MASK = makeRegex(`^
\\s*(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])
\\s*\\.
\\s*(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])
\\s*\\.
\\s*(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])
\\s*\\.
\\s*(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])
\\s*\\/
\\s*(255|254|252|248|240|224|192|128|0)
\\s*\\.
\\s*(255|254|252|248|240|224|192|128|0)
\\s*\\.
\\s*(255|254|252|248|240|224|192|128|0)
\\s*\\.
\\s*(255|254|252|248|240|224|192|128|0)
\\s*$`);

// 192.168.0.0-192.168.0.255
const RE_SUBNET_V4_RANGE = makeRegex(`^
\\s*(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])
\\s*\\.
\\s*(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])
\\s*\\.
\\s*(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])
\\s*\\.
\\s*(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])
\\s*\\-
\\s*(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])
\\s*\\.
\\s*(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])
\\s*\\.
\\s*(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])
\\s*\\.
\\s*(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])
\\s*$`);

function ipFromString(s1: string, s2: string, s3: string, s4: string): number {
  const b1 = parseInt(s1);
  const b2 = parseInt(s2);
  const b3 = parseInt(s3);
  const b4 = parseInt(s4);
  return bs2he(b1, b2, b3, b4);
}

function maskFromString(s1: string, s2: string, s3: string, s4: string): number {
  const b1 = parseInt(s1);
  const b2 = parseInt(s2);
  const b3 = parseInt(s3);
  const b4 = parseInt(s4);
  const mask = bs2he(b1, b2, b3, b4);
  const hostMask = 0xFFFFFFFF - mask;
  if ((hostMask & (hostMask + 1)) !== 0) {
    throw new NetV4Error();
  }
  return mask;
}

function prefix2Mask(prefix: number): number {
  if (prefix === 0) {
    return 0;
  }
  const suffix = 32 - prefix;
  const hostMask = ((1 << suffix) >>> 0) - 1;
  return 0xFFFFFFFF - hostMask;
}

function mask2Prefix(mask: number): number {
  if (mask === 0) {
    return 0;
  }
  let count = 0;
  const hostMask = 0xFFFFFFFF - mask;
  while (hostMask >>> count > 0) {
    count = count + 1;
  }
  return 32 - count;
}

function range2Mask(start: number, finish: number): number {
  if (start > finish) {
    throw new NetV4Error();
  }
  const hostMask = finish - start;
  const mask = 0xFFFFFFFF - hostMask;
  if ((hostMask & (hostMask + 1)) !== 0) {
    throw new NetV4Error();
  }
  return mask;
}

function ip2String(int: number): string {
  const bytes = he2bs(int);
  return `${bytes[0]}.${bytes[1]}.${bytes[2]}.${bytes[3]}`;
}

export class NetV4 {
  private _base: number = 0;
  private _mask: number = 0;
  private _prefix: number = 0;

  public static fromString(str: string): NetV4 {
    let match: RegExpExecArray | null = null;
    if (match = RE_SUBNET_V4_BITS.exec(str)) {
      const net = new NetV4();
      net._prefix = parseInt(match[5]);
      net._mask = prefix2Mask(net._prefix);
      net._base = (net._mask & ipFromString(match[1], match[2], match[3], match[4])) >>> 0;
      return net;

    } else if (match = RE_SUBNET_V4_MASK.exec(str)) {
      const net = new NetV4();
      net._mask = maskFromString(match[5], match[6], match[7], match[8]);
      net._prefix = mask2Prefix(net._mask);
      net._base = (net._mask & ipFromString(match[1], match[2], match[3], match[4])) >>> 0;
      return net;

    } else if (match = RE_SUBNET_V4_RANGE.exec(str)) {
      const net = new NetV4();
      const start = ipFromString(match[1], match[2], match[3], match[4]);
      const finish = ipFromString(match[5], match[6], match[7], match[8]);
      net._mask = range2Mask(start, finish);
      net._prefix = mask2Prefix(net._mask);
      net._base = (net._mask & start) >>> 0;
      return net;

    } else {
      throw new NetV4Error();
    }
  }

  public static fromStringPrefix(str: string): NetV4 {
    const match = RE_SUBNET_V4_BITS.exec(str);
    if (!match) {
      throw new NetV4Error();
    }
    const net = new NetV4();
    net._prefix = parseInt(match[5]);
    net._mask = prefix2Mask(net._prefix);
    net._base = (net._mask & ipFromString(match[1], match[2], match[3], match[4])) >>> 0;
    return net;
  }

  public static fromStringMask(str: string): NetV4 {
    const match = RE_SUBNET_V4_MASK.exec(str);
    if (!match) {
      throw new NetV4Error();
    }
    const net = new NetV4();
    net._mask = maskFromString(match[5], match[6], match[7], match[8]);
    net._prefix = mask2Prefix(net._mask);
    net._base = (net._mask & ipFromString(match[1], match[2], match[3], match[4])) >>> 0;
    return net;
  }

  public static fromStringRange(str: string): NetV4 {
    const match = RE_SUBNET_V4_RANGE.exec(str);
    if (!match) {
      throw new NetV4Error();
    }
    const net = new NetV4();
    const start = ipFromString(match[1], match[2], match[3], match[4]);
    const finish = ipFromString(match[5], match[6], match[7], match[8]);
    net._mask = range2Mask(start, finish);
    net._prefix = mask2Prefix(net._mask);
    net._base = (start & net._mask) >>> 0;
    return net;
  }

  public static fromIpPrefix(ip: IpV4, prefix: number): NetV4 {
    if (prefix < 0 || 32 < prefix) {
      throw new NetV4Error();
    }
    const net = new NetV4();
    net._prefix = prefix;
    net._mask = prefix2Mask(net._prefix);
    net._base = (ip.toInt() & net._mask) >>> 0;
    return net;
  }

  public static fromIpMask(ip: IpV4, mask: IpV4): NetV4 {
    const hostMask = 0xFFFFFFFF - mask.toInt();
    if ((hostMask & (hostMask + 1)) !== 0) {
      throw new NetV4Error();
    }
    const net = new NetV4();
    net._mask = mask.toInt();
    net._prefix = mask2Prefix(net._mask);
    net._base = (ip.toInt() & net._mask) >>> 0;
    return net;
  }

  public static fromIpRange(start: IpV4, finish: IpV4): NetV4 {
    const net = new NetV4();
    net._mask = range2Mask(start.toInt(), finish.toInt());
    net._prefix = mask2Prefix(net._mask);
    net._base = (start.toInt() & net._mask) >>> 0;
    return net;
  }

  public toString() {
    return `${ip2String(this._base)}/${this._prefix}`;
  }

  public toStringPrefix() {
    return `${ip2String(this._base)}/${this._prefix}`;
  }

  public toStringMask() {
    return `${ip2String(this._base)}/${ip2String(this._mask)}`;
  }

  public toStringRange() {
    return `${ip2String(this._base)}-${ip2String(this._base + (0xFFFFFFFF - this._mask))}`;
  }

  public getPrefixLen(): number {
    return this._prefix;
  }

  public getSize(): number {
    return 1 << (32 - this._prefix);
  }

  public getMask(): IpV4 {
    return IpV4.fromInt(this._mask);
  }

  public getMaskInt(): number {
    return this._mask;
  }

  public getHostMask(): IpV4 {
    return IpV4.fromInt(0xFFFFFFFF - this._mask);
  }

  public getHostMaskInt(): number {
    return 0xFFFFFFFF - this._mask;
  }

  public getStart(): IpV4 {
    return IpV4.fromInt(this._base);
  }

  public getStartInt(): number {
    return this._base;
  }

  public getFinish(): IpV4 {
    return IpV4.fromInt(this._base + (0xFFFFFFFF - this._mask));
  }

  public getFinishInt(): number {
    return this._base + (0xFFFFFFFF - this._mask);
  }

  public getBase(): IpV4 {
    return IpV4.fromInt(this._base);
  }

  public getBaseInt(): number {
    return this._base;
  }

  public getBroadcast(): IpV4 {
    return IpV4.fromInt(this._base + (0xFFFFFFFF - this._mask));
  }

  public getBroadcastInt(): number {
    return this._base + (0xFFFFFFFF - this._mask);
  }

  public isContainIP(ip: IpV4): boolean {
    return (ip.toInt() & this._mask) === this._base;
  }

  public isContainNet(net: NetV4): boolean {
    return (this._prefix <= net._prefix) &&
      (net._base & this._mask) >>> 0 === this._base;
  }

  public static equal(net1: NetV4, net2: NetV4): boolean {
    return net1._base === net2._base && net1._prefix === net2._prefix;
  }

  public equal(net: NetV4): boolean {
    return this._base === net._base && this._prefix === net._prefix;
  }

  public forEachIP(func: (ip: IpV4) => void): void {
    const start = this._base;
    const finish = this._base + (0xFFFFFFFF - this._mask);
    for (let iter = start; iter <= finish; iter += 1) {
      func(IpV4.fromInt(iter));
    }
  }

  public forEachInt(func: (int: number) => void): void {
    const start = this._base;
    const finish = this._base + (0xFFFFFFFF - this._mask);
    for (let iter = start; iter <= finish; iter += 1) {
      func(iter);
    }
  }
}
