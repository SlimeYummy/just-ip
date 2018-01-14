import 'mocha';
import { equal, deepEqual } from 'assert';
import { he2be, he2le } from '../src/endian';
import IpV4 from '../src/ipv4';

describe('ipv4.js', () => {
  const ipString = "192.168.1.2"
  const ipIntHe = 3232235778;
  const ipIntBe = he2be(3232235778);
  const ipIntLe = he2le(3232235778);
  const ipArray = [192, 168, 1, 2];

  it('IpV4.fromString()', () => equal(IpV4.fromString(ipString).toInt(), ipIntHe));
  it('IpV4.fromInt()', () => equal(IpV4.fromInt(ipIntHe).toInt(), ipIntHe));
  it('IpV4.fromIntBe()', () => equal(IpV4.fromIntBe(ipIntBe).toInt(), ipIntHe));
  it('IpV4.fromIntLe()', () => equal(IpV4.fromIntLe(ipIntLe).toInt(), ipIntHe));
  it('IpV4.fromBytes()', () => equal(IpV4.fromBytes(192, 168, 1, 2).toInt(), ipIntHe));
  it('IpV4.fromArray()', () => equal(IpV4.fromArray(ipArray).toInt(), ipIntHe));

  it('IpV4.toString()', () => equal(IpV4.fromString(ipString).toString(), ipString));
  it('IpV4.toInt()', () => equal(IpV4.fromString(ipString).toInt(), ipIntHe));
  it('IpV4.toIntBe()', () => equal(IpV4.fromString(ipString).toIntBe(), ipIntBe));
  it('IpV4.toIntLe()', () => equal(IpV4.fromString(ipString).toIntLe(), ipIntLe));
  it('IpV4.toArray()', () => deepEqual(IpV4.fromString(ipString).toArray(), ipArray));

});
