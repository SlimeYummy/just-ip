import { he2bs } from "./endian";

export class IPV4Error extends Error { };
export class NetV4Error extends Error { };

export type IpV4LikeEnum = 'ip' | 'he' | 'be' | 'le' | 'str' | 'arr';

export function toStringV4(int: number): string {
  const bytes = he2bs(int);
  return `${bytes[0]}.${bytes[1]}.${bytes[2]}.${bytes[3]}`;
}
