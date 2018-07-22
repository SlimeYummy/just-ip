import { bs2he, he2bs, he2be, he2le } from './endian';
import { IpV4, IpV4Like } from './ipv4';

export class NetV4Error extends Error { };

export type NetV4Like = NetV4 | string;

// 192.168.0.0/24
const RE_SUBNET_V4_PREFIX = /^\s*(\d{1,3})\s*\.\s*(\d{1,3})\s*\.\s*(\d{1,3})\s*\.\s*(\d{1,3})\s*\/\s*(\d{1,2})\s*$/;

// 192.168.0.0/255.255.255.0
const RE_SUBNET_V4_MASK = /^\s*(\d{1,3})\s*\.\s*(\d{1,3})\s*\.\s*(\d{1,3})\s*\.\s*(\d{1,3})\s*\/\s*(\d{1,3})\s*\.\s*(\d{1,3})\s*\.\s*(\d{1,3})\s*\.\s*(\d{1,3})\s*$/;

// 192.168.0.0-192.168.0.255
const RE_SUBNET_V4_RANGE = /^\s*(\d{1,3})\s*\.\s*(\d{1,3})\s*\.\s*(\d{1,3})\s*\.\s*(\d{1,3})\s*\-\s*(\d{1,3})\s*\.\s*(\d{1,3})\s*\.\s*(\d{1,3})\s*\.\s*(\d{1,3})\s*$/;

export class NetV4 {
  private _base: number = 0;
  private _mask: number = 0;
  private _prefix: number = 0;

  public static from(like: NetV4Like): NetV4 {
    const net = NetV4.try(like);
    if (!net) {
      throw new NetV4Error();
    }
    return net;
  }

  public static try(like: NetV4Like): NetV4 | null {
    if (like instanceof NetV4) {
      return like;
    } else if (typeof like === 'string') {
      return NetV4.fromString(like);
    } else {
      return null;
    }
  }

  public static fromString(str: string): NetV4 {
    const net = NetV4.tryString(str);
    if (!net) {
      throw new NetV4Error();
    }
    return net;
  }

  public static tryString(str: string): NetV4 | null {
    return NetV4.tryStringPrefix(str) || NetV4.tryStringMask(str) || NetV4.tryStringRange(str);
  }

  public static fromStringPrefix(str: string): NetV4 {
    const net = NetV4.tryStringPrefix(str);
    if (!net) {
      throw new NetV4Error();
    }
    return net;
  }

  public static tryStringPrefix(str: string): NetV4 | null {
    const match = RE_SUBNET_V4_PREFIX.exec(str);
    if (!match) {
      return null;
    }
    const net = new NetV4();
    net._prefix = parsePrefix(match[5]);
    if (net._prefix < 0) {
      return null;
    }
    net._mask = prefix2Mask(net._prefix);
    net._base = parseIp(match[1], match[2], match[3], match[4]);
    if (net._base < 0) {
      return null;
    }
    net._base = (net._base & net._mask) >>> 0;
    return net;
  }

  public static fromStringMask(str: string): NetV4 {
    const net = NetV4.tryStringMask(str);
    if (!net) {
      throw new NetV4Error();
    }
    return net;
  }

  public static tryStringMask(str: string): NetV4 | null {
    const match = RE_SUBNET_V4_MASK.exec(str);
    if (!match) {
      return null;
    }
    const net = new NetV4();
    net._base = parseIp(match[1], match[2], match[3], match[4]);
    if (net._base < 0) {
      return null;
    }
    net._mask = parseMask(match[5], match[6], match[7], match[8]);
    if (net._mask < 0) {
      return null;
    }
    net._prefix = mask2Prefix(net._mask);
    net._base = (net._base & net._mask) >>> 0;
    return net;
  }

  public static fromStringRange(str: string): NetV4 {
    const net = NetV4.tryStringRange(str);
    if (!net) {
      throw new NetV4Error();
    }
    return net;
  }

  public static tryStringRange(str: string): NetV4 | null {
    const match = RE_SUBNET_V4_RANGE.exec(str);
    if (!match) {
      return null;
    }
    const net = new NetV4();
    const start = parseIp(match[1], match[2], match[3], match[4]);
    if (start < 0) {
      return null;
    }
    const finish = parseIp(match[5], match[6], match[7], match[8]);
    if (finish < 0) {
      return null;
    }
    net._mask = range2Mask(start, finish);
    if (net._mask < 0) {
      return null;
    }
    net._prefix = mask2Prefix(net._mask);
    net._base = (start & net._mask) >>> 0;
    return net;
  }

  public static fromIpPrefix(ip: IpV4, prefix: number): NetV4 {
    const net = NetV4.tryIpPrefix(ip, prefix);
    if (!net) {
      throw new NetV4Error();
    }
    return net;
  }

  public static tryIpPrefix(ip: IpV4, prefix: number): NetV4 | null {
    if (prefix < 0 || 32 < prefix) {
      return null;
    }
    const net = new NetV4();
    net._prefix = prefix;
    net._mask = prefix2Mask(net._prefix);
    net._base = (ip.toInt() & net._mask) >>> 0;
    return net;
  }

  public static fromIpMask(ip: IpV4, mask: IpV4): NetV4 {
    const net = NetV4.tryIpMask(ip, mask);
    if (!net) {
      throw new NetV4Error();
    }
    return net;
  }

  public static tryIpMask(ip: IpV4, mask: IpV4): NetV4 | null {
    const hostMask = 0xFFFFFFFF - mask.toInt();
    if ((hostMask & (hostMask + 1)) !== 0) {
      return null;
    }
    const net = new NetV4();
    net._mask = mask.toInt();
    net._prefix = mask2Prefix(net._mask);
    net._base = (ip.toInt() & net._mask) >>> 0;
    return net;
  }

  public static fromIpRange(start: IpV4, finish: IpV4): NetV4 {
    const net = NetV4.tryIpRange(start, finish);
    if (!net) {
      throw new NetV4Error();
    }
    return net;
  }

  public static tryIpRange(start: IpV4, finish: IpV4): NetV4 | null {
    const net = new NetV4();
    net._mask = range2Mask(start.toInt(), finish.toInt());
    if (net._mask < 0) {
      return null;
    }
    net._prefix = mask2Prefix(net._mask);
    net._base = (start.toInt() & net._mask) >>> 0;
    return net;
  }

  public toString() {
    const a = he2bs(this._base);
    return `${a[0]}.${a[1]}.${a[2]}.${a[3]}/${this._prefix}`;
  }

  public toStringPrefix() {
    const a = he2bs(this._base);
    return `${a[0]}.${a[1]}.${a[2]}.${a[3]}/${this._prefix}`;
  }

  public toStringMask() {
    const a = he2bs(this._base);
    const base = `${a[0]}.${a[1]}.${a[2]}.${a[3]}`;
    const b = he2bs(this._mask);
    const mask = `${b[0]}.${b[1]}.${b[2]}.${b[3]}`;
    return `${base}/${mask}`;
  }

  public toStringRange() {
    const a = he2bs(this._base);
    const start = `${a[0]}.${a[1]}.${a[2]}.${a[3]}`;
    const b = he2bs(this._base + (0xFFFFFFFF - this._mask));
    const finish = `${b[0]}.${b[1]}.${b[2]}.${b[3]}`;
    return `${start}-${finish}`;
  }

  public getPrefixLen(): number {
    return this._prefix;
  }

  public getSize(): number {
    return 1 << (32 - this._prefix);
  }

  public getMask(): IpV4 {
    return IpV4.from(this._mask);
  }

  public getMaskInt(): number {
    return this._mask;
  }

  public getHostMask(): IpV4 {
    return IpV4.from(0xFFFFFFFF - this._mask);
  }

  public getHostMaskInt(): number {
    return 0xFFFFFFFF - this._mask;
  }

  public getStart(): IpV4 {
    return IpV4.from(this._base);
  }

  public getStartInt(): number {
    return this._base;
  }

  public getFinish(): IpV4 {
    return IpV4.from(this._base + (0xFFFFFFFF - this._mask));
  }

  public getBase(): IpV4 {
    return IpV4.from(this._base);
  }

  public getBaseInt(): number {
    return this._base;
  }

  public getFinishInt(): number {
    return this._base + (0xFFFFFFFF - this._mask);
  }

  public getBroadcast(): IpV4 {
    return IpV4.from(this._base + (0xFFFFFFFF - this._mask));
  }

  public getBroadcastInt(): number {
    return this._base + (0xFFFFFFFF - this._mask);
  }

  public isUnspecified(): boolean {
    return this._base === 0 && this._prefix === 32;
  }

  public static isUnspecified(net: NetV4Like): boolean {
    return NetV4.from(net).isUnspecified();
  }

  public isLoopback(): boolean {
    return (this._base >>> 8) === 0x7F0000 && this._prefix >= 24;
  }

  public static isLoopback(net: NetV4Like): boolean {
    return NetV4.from(net).isLoopback();
  }

  public isPrivate(): boolean {
    return (this._base >>> 24) === 0x0A && this._prefix >= 8 ||
      (this._base >>> 20) === 0xAC1 && this._prefix >= 12 ||
      (this._base >>> 16) === 0xC0A8 && this._prefix >= 16;
  }

  public static isPrivate(net: NetV4Like): boolean {
    return NetV4.from(net).isPrivate();
  }

  public isLinkLocal(): boolean {
    return (this._base >>> 16) === 0xA9FE && this._prefix >= 16;
  }

  public static isLinkLocal(net: NetV4Like): boolean {
    return NetV4.from(net).isLinkLocal();
  }

  public isMulticast(): boolean {
    return (this._base >>> 28) === 0xE && this._prefix >= 4;
  }

  public static isMulticast(net: NetV4Like): boolean {
    return NetV4.from(net).isMulticast();
  }

  public isBroadcast(): boolean {
    return this._base === 0xFFFFFFFF && this._prefix === 32;
  }

  public static isBroadcast(net: NetV4Like): boolean {
    return NetV4.from(net).isBroadcast();
  }

  public isDocumentation(): boolean {
    return (this._base >>> 8) === 0xC00002 && this._prefix >= 24 ||
      (this._base >>> 8) === 0xC63364 && this._prefix >= 24 ||
      (this._base >>> 8) === 0xCB0071 && this._prefix >= 24;
  }

  public static isDocumentation(net: NetV4Like): boolean {
    return NetV4.from(net).isDocumentation();
  }

  public isGlobal(): boolean {
    return !this.isPrivate() &&
      !this.isLoopback() &&
      !this.isLinkLocal() &&
      !this.isBroadcast() &&
      !this.isDocumentation() &&
      !this.isUnspecified();
  }

  public static isGlobal(net: NetV4Like): boolean {
    return NetV4.from(net).isGlobal();
  }

  public containIP(ip: IpV4): boolean {
    return (ip.toInt() & this._mask) === this._base;
  }

  public static containIP(net: NetV4Like, ip: IpV4Like): boolean {
    return NetV4.from(net).containIP(IpV4.from(ip));
  }

  public containNet(net: NetV4): boolean {
    return (this._prefix <= net._prefix) &&
      (net._base & this._mask) >>> 0 === this._base;
  }

  public static containNet(net1: NetV4Like, net2: NetV4Like): boolean {
    return NetV4.from(net1).containNet(NetV4.from(net2));
  }

  public equal(net: NetV4): boolean {
    return this._base === net._base && this._prefix === net._prefix;
  }

  public static equal(net1: NetV4Like, net2: NetV4Like): boolean {
    return NetV4.from(net1).equal(NetV4.from(net2));
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

function parseIp(s1: string, s2: string, s3: string, s4: string): number {
  const b1 = parseInt(s1);
  const b2 = parseInt(s2);
  const b3 = parseInt(s3);
  const b4 = parseInt(s4);
  if (b1 > 255 || b2 > 255 || b3 > 255 || b4 > 255) {
    return -1;
  }
  return bs2he(b1, b2, b3, b4);
}

function parseMask(s1: string, s2: string, s3: string, s4: string): number {
  const b1 = parseInt(s1);
  const b2 = parseInt(s2);
  const b3 = parseInt(s3);
  const b4 = parseInt(s4);
  if (b1 > 255 || b2 > 255 || b3 > 255 || b4 > 255) {
    return -1;
  }
  const mask = bs2he(b1, b2, b3, b4);
  const hostMask = 0xFFFFFFFF - mask;
  if ((hostMask & (hostMask + 1)) !== 0) {
    return -1;
  }
  return mask;
}

function parsePrefix(s: string): number {
  const prefix = parseInt(s);
  if (prefix < 0 || 32 < prefix) {
    return -1;
  }
  return prefix;
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
    return -1;
  }
  const hostMask = finish - start;
  const mask = 0xFFFFFFFF - hostMask;
  if ((hostMask & (hostMask + 1)) !== 0) {
    return -1;
  }
  return mask;
}
