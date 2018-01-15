import 'jest';
import { equal, deepEqual, throws } from 'assert';
import { he2be, he2le } from '../src/endian';
import { IpV4 } from '../src/ipv4';

const mockIp = {
  _b1: 192,
  _b2: 168,
  _b3: 1,
  _b4: 2,
  _int: 3232235778,
};
const ipString = "192.168.1.2"
const ipIntHe = 3232235778;
const ipIntBe = he2be(3232235778);
const ipIntLe = he2le(3232235778);
const ipArray = [192, 168, 1, 2];

test('IpV4.fromString()', () => {
  deepEqual(IpV4.fromString(ipString), mockIp);
  throws(() => { IpV4.fromString('1.1.1.1.0') });
});
test('IpV4.fromInt()', () => {
  deepEqual(IpV4.fromInt(ipIntHe), mockIp);
  throws(() => { IpV4.fromInt(-0x80000001) });
});
test('IpV4.fromIntBe()', () => {
  deepEqual(IpV4.fromIntBe(ipIntBe), mockIp);
  throws(() => { IpV4.fromIntBe(0x100000000) });
});
test('IpV4.fromIntLe()', () => {
  deepEqual(IpV4.fromIntLe(ipIntLe), mockIp);
  throws(() => { IpV4.fromIntLe(0x100000000) });
});
test('IpV4.fromBytes()', () => {
  deepEqual(IpV4.fromBytes(192, 168, 1, 2), mockIp);
  throws(() => { IpV4.fromBytes(192, 168, 1, 256) });
  throws(() => { IpV4.fromBytes(192, 168, 1, -1) });
});
test('IpV4.fromArray()', () => {
  deepEqual(IpV4.fromArray(ipArray), mockIp);
  throws(() => { IpV4.fromArray([192, 168, 1, 256]) });
  throws(() => { IpV4.fromArray([192, 168, 1, -1]) });
});

test('IpV4::toString()', () => {
  equal(IpV4.fromString(ipString).toString(), ipString);
  equal(IpV4.fromIntBe(ipIntBe).toString(), ipString);
  equal(IpV4.fromIntLe(ipIntLe).toString(), ipString);
});
test('IpV4::toInt()', () => {
  equal(IpV4.fromString(ipString).toInt(), ipIntHe);
  equal(IpV4.fromIntBe(ipIntBe).toInt(), ipIntHe);
  equal(IpV4.fromIntLe(ipIntLe).toInt(), ipIntHe);
});
test('IpV4::toIntBe()', () => {
  equal(IpV4.fromString(ipString).toIntBe(), ipIntBe);
  equal(IpV4.fromIntBe(ipIntBe).toIntBe(), ipIntBe);
  equal(IpV4.fromIntLe(ipIntLe).toIntBe(), ipIntBe);
});
test('IpV4::toIntLe()', () => {
  equal(IpV4.fromString(ipString).toIntLe(), ipIntLe);
  equal(IpV4.fromIntBe(ipIntBe).toIntLe(), ipIntLe);
  equal(IpV4.fromIntLe(ipIntLe).toIntLe(), ipIntLe);
});
test('IpV4::toArray()', () => {
  deepEqual(IpV4.fromString(ipString).toArray(), ipArray);
  deepEqual(IpV4.fromIntBe(ipIntBe).toArray(), ipArray);
  deepEqual(IpV4.fromIntLe(ipIntLe).toArray(), ipArray);
});

test('IpV4.equal()', () => {
  equal(true, IpV4.equal(IpV4.fromInt(0x00000000), IpV4.fromInt(0x00000000)));
  equal(false, IpV4.equal(IpV4.fromInt(0x0000FFFF), IpV4.fromInt(0xFFFF0000)));
});

test('IpV4::equal()', () => {
  equal(true, IpV4.fromInt(0xAABBCCDD).equal(IpV4.fromInt(0xAABBCCDD)));
  equal(false, IpV4.fromInt(0x44332211).equal(IpV4.fromInt(0x11223344)));
});

test('IpV4::isUnspecified()', () => {
  equal(true, IpV4.fromString('0.0.0.0').isUnspecified());
  equal(false, IpV4.fromString('255.255.255.255').isUnspecified());
});

test('IpV4::isLoopback()', () => {
  equal(false, IpV4.fromString('126.0.0.0').isLoopback());
  equal(true, IpV4.fromString('127.0.0.255').isLoopback());
  equal(true, IpV4.fromString('127.0.0.0').isLoopback());
  equal(false, IpV4.fromString('127.0.1.0').isLoopback());
});

test('IpV4::isPrivate()', () => {
  equal(false, IpV4.fromString('1.2.3.4').isPrivate());
  equal(true, IpV4.fromString('10.0.0.0').isPrivate());
  equal(true, IpV4.fromString('10.255.255.255').isPrivate());
  equal(false, IpV4.fromString('100.0.0.0').isPrivate());
  equal(true, IpV4.fromString('172.16.0.0').isPrivate());
  equal(true, IpV4.fromString('172.16.15.255').isPrivate());
  equal(false, IpV4.fromString('172.16.16.0').isPrivate());
  equal(true, IpV4.fromString('192.168.0.0').isPrivate());
  equal(true, IpV4.fromString('192.168.0.255').isPrivate());
  equal(false, IpV4.fromString('244.168.0.128').isPrivate());
});

test('IpV4::isLinkLocal()', () => {
  equal(false, IpV4.fromString('127.0.0.255').isLinkLocal());
  equal(true, IpV4.fromString('169.254.0.0').isLinkLocal());
  equal(true, IpV4.fromString('169.254.255.255').isLinkLocal());
  equal(false, IpV4.fromString('170.0.0.0').isLinkLocal());
});

test('IpV4::isMulticast()', () => {
  equal(false, IpV4.fromString('127.0.0.255').isMulticast());
  equal(true, IpV4.fromString('224.0.0.0').isMulticast());
  equal(true, IpV4.fromString('239.255.255.255').isMulticast());
  equal(false, IpV4.fromString('255.255.255.255').isMulticast());
});

test('IpV4::isBroadcast()', () => {
  equal(false, IpV4.fromString('0.0.0.0').isBroadcast());
  equal(true, IpV4.fromString('255.255.255.255').isBroadcast());
});

test('IpV4::isDocumentation()', () => {
  equal(false, IpV4.fromString('1.2.3.4').isDocumentation());
  equal(true, IpV4.fromString('192.0.2.0').isDocumentation());
  equal(true, IpV4.fromString('192.0.2.255').isDocumentation());
  equal(false, IpV4.fromString('196.196.196.196').isDocumentation());
  equal(true, IpV4.fromString('198.51.100.0').isDocumentation());
  equal(true, IpV4.fromString('198.51.100.255').isDocumentation());
  equal(false, IpV4.fromString('202.202.202.202').isDocumentation());
  equal(true, IpV4.fromString('203.0.113.0').isDocumentation());
  equal(true, IpV4.fromString('203.0.113.255').isDocumentation());
  equal(false, IpV4.fromString('210.210.210.210').isDocumentation());
});

test('IpV4::isGlobal()', () => {
  equal(false, IpV4.fromString('0.0.0.0').isGlobal());
  equal(false, IpV4.fromString('10.0.0.0').isGlobal());
  equal(false, IpV4.fromString('127.0.0.0').isGlobal());
  equal(false, IpV4.fromString('169.254.0.0').isGlobal());
  equal(false, IpV4.fromString('172.16.0.0').isGlobal());
  equal(false, IpV4.fromString('192.168.0.0').isGlobal());
  equal(false, IpV4.fromString('192.0.2.0').isGlobal());
  equal(false, IpV4.fromString('198.51.100.0').isGlobal());
  equal(false, IpV4.fromString('203.0.113.0').isGlobal());
  equal(false, IpV4.fromString('255.255.255.255').isGlobal());
  equal(true, IpV4.fromString('113.0.0.113').isGlobal());
  equal(true, IpV4.fromString('23.23.23.23').isGlobal());
  equal(true, IpV4.fromString('209.3.177.59').isGlobal());
});
