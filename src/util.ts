export class IPV4Error extends Error { };
export class NetV4Error extends Error { };

const RE_NEW_LINE = /\r|\n/g;

export function makeRegex(text: string): RegExp {
  return new RegExp(text.replace(RE_NEW_LINE, ''));
}
