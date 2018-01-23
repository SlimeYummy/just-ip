import 'jest';
import { equal, deepEqual, throws } from 'assert';
import { IpV6 } from '../src/ipv6';

test('IpV6.fromString()', () => {
  deepEqual(IpV6.fromString('1:2:3:4:5:6:7:8'), {
    _i1: 0x10002, _i2: 0x30004, _i3: 0x50006, _i4: 0x70008,
  });
  deepEqual(IpV6.fromString('f::e'), {
    _i1: 0xF0000, _i2: 0x0, _i3: 0x0, _i4: 0xE,
  });
  deepEqual(IpV6.fromString('::'), {
    _i1: 0x0, _i2: 0x0, _i3: 0x0, _i4: 0x0,
  });
  deepEqual(IpV6.fromString('::1:2:3:4'), {
    _i1: 0x0, _i2: 0x0, _i3: 0x10002, _i4: 0x30004,
  });
  deepEqual(IpV6.fromString('a:b:c:d::'), {
    _i1: 0xA000B, _i2: 0xC000D, _i3: 0, _i4: 0,
  });
  deepEqual(IpV6.fromString('0:0:0:0:0:ffff:1.1.1.1'), {
    _i1: 0x0, _i2: 0x0, _i3: 0xFFFF, _i4: 0x1010101,
  });
  deepEqual(IpV6.fromString('::ffff:2.2.2.2'), {
    _i1: 0x0, _i2: 0x0, _i3: 0xFFFF, _i4: 0x2020202,
  });
  throws(() => IpV6.fromString('0'));
  throws(() => IpV6.fromString('10000::'));
  throws(() => IpV6.fromString('::10000'));
  throws(() => IpV6.fromString('1::2::3'));
  throws(() => IpV6.fromString(':1:2'));
  throws(() => IpV6.fromString(':1::2'));
  throws(() => IpV6.fromString(':1::'));
  throws(() => IpV6.fromString('3:4:'));
  throws(() => IpV6.fromString('3::4:'));
  throws(() => IpV6.fromString('::3:'));
  throws(() => IpV6.fromString(':0:'));
  throws(() => IpV6.fromString(':5:6:'));
  throws(() => IpV6.fromString(':5::6:'));
  throws(() => IpV6.fromString('1:2:3:4:5:6:7:8:9'));
  throws(() => IpV6.fromString('1:2:3:4:5:6:7:8::'));
  throws(() => IpV6.fromString('::1:2:3:4:5:6:7:8'));
  throws(() => IpV6.fromString('1:2:3:4::5:6:7:8'));
  throws(() => IpV6.fromString('::0.0.0.300'));
  throws(() => IpV6.fromString('0:0:0:0:0:0:ffff:0.0.0.0'));
  throws(() => IpV6.fromString('0::0:0:0:0:ffff:0.0.0.0'));
  throws(() => IpV6.fromString('1::0.0.0.0'));
});

test('IpV6.fromSegments()', () => {
  deepEqual(IpV6.fromSegments(0, 1, 2, 3, 0, 0, 0xFFFF, 0xFFFF), {
    _i1: 0x1, _i2: 0x20003, _i3: 0x0, _i4: 0xFFFFFFFF,
  });
  throws(() => IpV6.fromSegments(0, 0, 0, 0, 0, 0, -1, 0));
  throws(() => IpV6.fromSegments(0, 0, 0, 0, 0, 0, 0, 0x10000));
});

test('IpV6.trySegments()', () => {
  deepEqual(IpV6.trySegments(0, 1, 2, 3, 0, 0, 0xFFFF, 0xFFFF), {
    _i1: 0x1, _i2: 0x20003, _i3: 0x0, _i4: 0xFFFFFFFF,
  });
  equal(IpV6.trySegments(0, 0, 0, 0, 0, 0, -1, 0), null);
  equal(IpV6.trySegments(0, 0, 0, 0, 0, 0, 0, 0x10000), null);
});

test('IpV6.fromArray()', () => {
  deepEqual(IpV6.fromArray([0, 1, 2, 3, 0, 0, 0xFFFF, 0xFFFF]), {
    _i1: 0x1, _i2: 0x20003, _i3: 0x0, _i4: 0xFFFFFFFF,
  });
  throws(() => IpV6.fromArray([0, 0, 0, 0, 0, 0, -1, 0]));
  throws(() => IpV6.fromArray([0, 0, 0, 0, 0, 0, 0, 0x10000]));
});

test('IpV6.tryArray()', () => {
  deepEqual(IpV6.tryArray([0, 1, 2, 3, 0, 0, 0xFFFF, 0xFFFF]), {
    _i1: 0x1, _i2: 0x20003, _i3: 0x0, _i4: 0xFFFFFFFF,
  });
  equal(IpV6.tryArray([0, 0, 0, 0, 0, 0, -1, 0]), null);
  equal(IpV6.tryArray([0, 0, 0, 0, 0, 0, 0, 0x10000]), null);
});

test('IpV6.toString()', () => {
  deepEqual(IpV6.fromString('1:2:3:4:5:6:7:8').toString(), '1:2:3:4:5:6:7:8');
  deepEqual(IpV6.fromString('::').toString(), '0:0:0:0:0:0:0:0');
  deepEqual(IpV6.fromString('1:2:3:4:5:6:7:8').toString('short'), '1:2:3:4:5:6:7:8');
  deepEqual(IpV6.fromString('::').toString('short'), '::');
  deepEqual(IpV6.fromString('::1:2:a:b').toString('short'), '::1:2:a:b');
  deepEqual(IpV6.fromString('3:4:c:d::').toString('short'), '3:4:c:d::');
  deepEqual(IpV6.fromString('f::f:0:0:0:0').toString('short'), 'f:0:0:f::');
  deepEqual(IpV6.fromString('::ffff:1.2.3.4').toString('mapped'), '0:0:0:0:0:ffff:1.2.3.4');
  throws(() => IpV6.fromString('::').toString('mapped'));
  deepEqual(IpV6.fromString('::ffff:1.2.3.4').toString('short-mapped'), '::ffff:1.2.3.4');
  throws(() => IpV6.fromString('::').toString('short-mapped'));
  throws(() => IpV6.fromString('::').toString(<any>'error'));
});

test('IpV6.toArray()', () => {
  deepEqual(IpV6.fromString('1:2:3:4:5:6:7:8').toArray(), [1, 2, 3, 4, 5, 6, 7, 8]);
  deepEqual(IpV6.fromString('1:2:3:4:5:6:7:8').toArray([]), [1, 2, 3, 4, 5, 6, 7, 8]);
});
