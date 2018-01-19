import { NetV4Error, IpV4LikeEnum } from './util';
import { bs2he, he2bs, he2be, he2le } from './endian';
import { IpV4, IpV4Like, castIpV4 } from './ipv4';

// 192.168.0.0/24
const RE_SUBNET_V4_PREFIX = /^\s*(\d{1,3})\s*\.\s*(\d{1,3})\s*\.\s*(\d{1,3})\s*\.\s*(\d{1,3})\s*\/\s*(\d{1,2})\s*$/;

// 192.168.0.0/255.255.255.0
const RE_SUBNET_V4_MASK = /^\s*(\d{1,3})\s*\.\s*(\d{1,3})\s*\.\s*(\d{1,3})\s*\.\s*(\d{1,3})\s*\/\s*(\d{1,3})\s*\.\s*(\d{1,3})\s*\.\s*(\d{1,3})\s*\.\s*(\d{1,3})\s*$/;

// 192.168.0.0-192.168.0.255
const RE_SUBNET_V4_RANGE = /^\s*(\d{1,3})\s*\.\s*(\d{1,3})\s*\.\s*(\d{1,3})\s*\.\s*(\d{1,3})\s*\-\s*(\d{1,3})\s*\.\s*(\d{1,3})\s*\.\s*(\d{1,3})\s*\.\s*(\d{1,3})\s*$/;

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

function ip2String(int: number): string {
  const bytes = he2bs(int);
  return `${bytes[0]}.${bytes[1]}.${bytes[2]}.${bytes[3]}`;
}

function ip2Array(int: number): Array<number> {
  const bytes = he2bs(int);
  return [bytes[0], bytes[1], bytes[2], bytes[3]];
}

function toIpV4Like(int: number, type: IpV4LikeEnum): IpV4Like {
  switch (type) {
    case 'ip': return IpV4.fromInt(int);
    case 'he': return int;
    case 'be': return he2be(int);
    case 'le': return he2le(int);
    case 'str': return ip2String(int);
    case 'arr': return ip2Array(int);
    default: throw new Error();
  }
}

export type NetV4Like = NetV4 | string;

export function castNetV4(net: NetV4Like): NetV4 {
  if (typeof net === 'string') {
    return NetV4.fromString(net);
  } else if (net instanceof NetV4) {
    return net;
  } else {
    throw new NetV4Error();
  }
}

export class NetV4 {
  private _base: number = 0;
  private _mask: number = 0;
  private _prefix: number = 0;

  public static fromString(str: string): NetV4 {
    let net: NetV4 | null = null;
    if (net = NetV4.tryStringPrefix(str)) {
      return net;
    } else if (net = NetV4.tryStringMask(str)) {
      return net;
    } else if (net = NetV4.tryStringRange(str)) {
      return net;
    } else {
      throw new NetV4Error();
    }
  }

  public static tryString(str: string): NetV4 | null {
    let net: NetV4 | null = null;
    if (net = NetV4.tryStringPrefix(str)) {
      return net;
    } else if (net = NetV4.tryStringMask(str)) {
      return net;
    } else if (net = NetV4.tryStringRange(str)) {
      return net;
    } else {
      return null;
    }
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

  public getMask(): IpV4;
  public getMask(type: 'ip'): IpV4;
  public getMask(type: 'he' | 'be' | 'le'): number;
  public getMask(type: 'str'): string;
  public getMask(type: 'arr'): Array<number>;
  public getMask(type: IpV4LikeEnum = 'ip'): IpV4Like {
    return toIpV4Like(this._mask, type);
  }

  public getHostMask(): IpV4;
  public getHostMask(type: 'ip'): IpV4;
  public getHostMask(type: 'he' | 'be' | 'le'): number;
  public getHostMask(type: 'str'): string;
  public getHostMask(type: 'arr'): Array<number>;
  public getHostMask(type: IpV4LikeEnum = 'ip'): IpV4Like {
    return toIpV4Like(0xFFFFFFFF - this._mask, type);
  }

  public getStart(): IpV4;
  public getStart(type: 'ip'): IpV4;
  public getStart(type: 'he' | 'be' | 'le'): number;
  public getStart(type: 'str'): string;
  public getStart(type: 'arr'): Array<number>;
  public getStart(type: IpV4LikeEnum = 'ip'): IpV4Like {
    return toIpV4Like(this._base, type);
  }

  public getFinish(): IpV4;
  public getFinish(type: 'ip'): IpV4;
  public getFinish(type: 'he' | 'be' | 'le'): number;
  public getFinish(type: 'str'): string;
  public getFinish(type: 'arr'): Array<number>;
  public getFinish(type: IpV4LikeEnum = 'ip'): IpV4Like {
    return toIpV4Like(this._base + (0xFFFFFFFF - this._mask), type);
  }

  public getBase(): IpV4;
  public getBase(type: 'ip'): IpV4;
  public getBase(type: 'he' | 'be' | 'le'): number;
  public getBase(type: 'str'): string;
  public getBase(type: 'arr'): Array<number>;
  public getBase(type: IpV4LikeEnum = 'ip'): IpV4Like {
    return toIpV4Like(this._base, type);
  }

  public getBroadcast(): IpV4;
  public getBroadcast(type: 'ip'): IpV4;
  public getBroadcast(type: 'he' | 'be' | 'le'): number;
  public getBroadcast(type: 'str'): string;
  public getBroadcast(type: 'arr'): Array<number>;
  public getBroadcast(type: IpV4LikeEnum = 'ip'): IpV4Like {
    return toIpV4Like(this._base + (0xFFFFFFFF - this._mask), type);
  }

  public isUnspecified(): boolean {
    return this._base === 0 && this._prefix === 32;
  }

  public static isUnspecified(net: NetV4Like): boolean {
    return castNetV4(net).isUnspecified();
  }

  public isLoopback(): boolean {
    return (this._base >>> 8) === 0x7F0000 && this._prefix >= 24;
  }

  public static isLoopback(net: NetV4Like): boolean {
    return castNetV4(net).isLoopback();
  }

  public isPrivate(): boolean {
    return (this._base >>> 24) === 0x0A && this._prefix >= 8 ||
      (this._base >>> 20) === 0xAC1 && this._prefix >= 12 ||
      (this._base >>> 16) === 0xC0A8 && this._prefix >= 16;
  }

  public static isPrivate(net: NetV4Like): boolean {
    return castNetV4(net).isPrivate();
  }

  public isLinkLocal(): boolean {
    return (this._base >>> 16) === 0xA9FE && this._prefix >= 16;
  }

  public static isLinkLocal(net: NetV4Like): boolean {
    return castNetV4(net).isLinkLocal();
  }

  public isMulticast(): boolean {
    return (this._base >>> 28) === 0xE && this._prefix >= 4;
  }

  public static isMulticast(net: NetV4Like): boolean {
    return castNetV4(net).isMulticast();
  }

  public isBroadcast(): boolean {
    return this._base === 0xFFFFFFFF && this._prefix === 32;
  }

  public static isBroadcast(net: NetV4Like): boolean {
    return castNetV4(net).isBroadcast();
  }

  public isDocumentation(): boolean {
    return (this._base >>> 8) === 0xC00002 && this._prefix >= 24 ||
      (this._base >>> 8) === 0xC63364 && this._prefix >= 24 ||
      (this._base >>> 8) === 0xCB0071 && this._prefix >= 24;
  }

  public static isDocumentation(net: NetV4Like): boolean {
    return castNetV4(net).isDocumentation();
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
    return castNetV4(net).isGlobal();
  }

  public containIP(ip: IpV4): boolean {
    return (ip.toInt() & this._mask) === this._base;
  }

  public static containIP(net: NetV4Like, ip: IpV4Like): boolean {
    return castNetV4(net).containIP(castIpV4(ip));
  }

  public containNet(net: NetV4): boolean {
    return (this._prefix <= net._prefix) &&
      (net._base & this._mask) >>> 0 === this._base;
  }

  public static containNet(net1: NetV4Like, net2: NetV4Like): boolean {
    return castNetV4(net1).containNet(castNetV4(net2));
  }

  public equal(net: NetV4): boolean {
    return this._base === net._base && this._prefix === net._prefix;
  }

  public static equal(net1: NetV4Like, net2: NetV4Like): boolean {
    return castNetV4(net1).equal(castNetV4(net2));
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
