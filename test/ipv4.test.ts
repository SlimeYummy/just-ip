import 'jest';
import { equal, deepEqual } from 'assert';
import { he2be, he2le } from '../src/endian';
import { IpV4 } from '../src/ipv4';

const ipString = "192.168.1.2"
const ipIntHe = 3232235778;
const ipIntBe = he2be(3232235778);
const ipIntLe = he2le(3232235778);
const ipArray = [192, 168, 1, 2];

test('IpV4.fromString()', () => equal(IpV4.fromString(ipString).toInt(), ipIntHe));
test('IpV4.fromInt()', () => equal(IpV4.fromInt(ipIntHe).toInt(), ipIntHe));
test('IpV4.fromIntBe()', () => equal(IpV4.fromIntBe(ipIntBe).toInt(), ipIntHe));
test('IpV4.fromIntLe()', () => equal(IpV4.fromIntLe(ipIntLe).toInt(), ipIntHe));
test('IpV4.fromBytes()', () => equal(IpV4.fromBytes(192, 168, 1, 2).toInt(), ipIntHe));
test('IpV4.fromArray()', () => equal(IpV4.fromArray(ipArray).toInt(), ipIntHe));

test('IpV4.toString()', () => equal(IpV4.fromString(ipString).toString(), ipString));
test('IpV4.toInt()', () => equal(IpV4.fromString(ipString).toInt(), ipIntHe));
test('IpV4.toIntBe()', () => equal(IpV4.fromString(ipString).toIntBe(), ipIntBe));
test('IpV4.toIntLe()', () => equal(IpV4.fromString(ipString).toIntLe(), ipIntLe));
test('IpV4.toArray()', () => deepEqual(IpV4.fromString(ipString).toArray(), ipArray));
