import 'mocha';
import { equal } from 'assert';
import { IpV4 } from '../src/ipv4';
import { NetV4 } from '../src/netv4';

describe('netv4.js', () => {
  const ipAddr = IpV4.fromString('192.168.1.2');
  const ipMask = IpV4.fromString('255.255.255.252');
  const ipStart = IpV4.fromString('192.168.1.0');
  const ipFinish = IpV4.fromString('192.168.1.3');

  it('NetV4.fromString() - prefix', () => {
    equal(NetV4.fromString('192.168.1.2/24').toString(), '192.168.1.0/24')
  });
  it('NetV4.fromString() - mask', () => {
    equal(NetV4.fromString('192.168.1.2/255.255.255.0').toString(), '192.168.1.0/24')
  });
  it('NetV4.fromString() - range', () => {
    equal(NetV4.fromString('192.168.1.0-192.168.1.255').toString(), '192.168.1.0/24')
  });
  it('NetV4.fromStringPrefix()', () => {
    equal(NetV4.fromStringPrefix('192.168.1.2/24').toString(), '192.168.1.0/24')
  });
  it('NetV4.fromStringMask()', () => {
    equal(NetV4.fromStringMask('192.168.1.2/255.255.255.0').toString(), '192.168.1.0/24')
  });
  it('NetV4.fromStringRange()', () => {
    equal(NetV4.fromStringRange('192.168.1.0-192.168.1.255').toString(), '192.168.1.0/24')
  });

  it('NetV4.fromStringPrefix()', () => {
    equal(NetV4.fromIpPrefix(ipAddr, 30).toString(), '192.168.1.0/30')
  });
  it('NetV4.fromIpMask()', () => {
    equal(NetV4.fromIpMask(ipAddr, ipMask).toString(), '192.168.1.0/30')
  });
  it('NetV4.fromIpRange()', () => {
    equal(NetV4.fromIpRange(ipStart, ipFinish).toString(), '192.168.1.0/30')
  });

  it('NetV4.toString()', () => {
    equal(NetV4.fromString('192.168.1.0/24').toString(), '192.168.1.0/24')
  });
  it('NetV4.toStringPrefix()', () => {
    equal(NetV4.fromString('192.168.1.0/24').toStringPrefix(), '192.168.1.0/24')
  });
  it('NetV4.toStringMask()', () => {
    equal(NetV4.fromString('192.168.1.0/24').toStringMask(), '192.168.1.0/255.255.255.0')
  });
  it('NetV4.toStringRange()', () => {
    equal(NetV4.fromString('192.168.1.0/24').toStringRange(), '192.168.1.0-192.168.1.255')
  });
});
