import 'jest';
import { equal, deepEqual, throws } from 'assert';
import { IpV4 } from '../src/ipv4';
import { NetV4 } from '../src/netv4';

const mockNet1 = {
  _base: IpV4.fromString('192.168.1.0').toInt(),
  _mask: IpV4.fromString('255.255.255.0').toInt(),
  _prefix: 24,
}
const mockNet2 = {
  _base: IpV4.fromString('19.19.19.19').toInt(),
  _mask: IpV4.fromString('255.255.255.255').toInt(),
  _prefix: 32,
}
const mockNet3 = {
  _base: IpV4.fromString('0.0.0.0').toInt(),
  _mask: IpV4.fromString('0.0.0.0').toInt(),
  _prefix: 0,
}
const ipAddr = IpV4.fromString('192.168.1.2');
const ipMask = IpV4.fromString('255.255.255.0');
const ipStart = IpV4.fromString('192.168.1.0');
const ipFinish = IpV4.fromString('192.168.1.255');

test('NetV4.fromString()', () => {
  deepEqual(NetV4.fromString('192.168.1.2/24'), mockNet1);
  deepEqual(NetV4.fromString('19.19.19.19/32'), mockNet2);
  deepEqual(NetV4.fromString('18.18.18.18/0'), mockNet3);
  deepEqual(NetV4.fromString('192.168.1.2/255.255.255.0'), mockNet1);
  deepEqual(NetV4.fromString('19.19.19.19/255.255.255.255'), mockNet2);
  deepEqual(NetV4.fromString('18.18.18.18/0.0.0.0'), mockNet3);
  deepEqual(NetV4.fromString('192.168.1.0-192.168.1.255'), mockNet1);
  deepEqual(NetV4.fromString('19.19.19.19-19.19.19.19'), mockNet2);
  deepEqual(NetV4.fromString('0.0.0.0-255.255.255.255'), mockNet3);
  throws(() => NetV4.fromString('192.168.1../24'));
  throws(() => NetV4.fromString('192.168.1.2/255.254.255.0'));
  throws(() => NetV4.fromString('192.168.1.255-192.168.1.0'));
  throws(() => NetV4.fromString('192.168.1.0-192.168.1.117'));
});

test('NetV4.fromStringPrefix()', () => {
  deepEqual(NetV4.fromStringPrefix('192.168.1.2/24'), mockNet1);
  deepEqual(NetV4.fromStringPrefix('19.19.19.19/32'), mockNet2);
  deepEqual(NetV4.fromStringPrefix('18.18.18.18/0'), mockNet3);
  throws(() => NetV4.fromStringPrefix('192.168.1../24'));
});

test('NetV4.fromStringMask()', () => {
  deepEqual(NetV4.fromStringMask('192.168.1.2/255.255.255.0'), mockNet1);
  deepEqual(NetV4.fromStringMask('19.19.19.19/255.255.255.255'), mockNet2);
  deepEqual(NetV4.fromStringMask('18.18.18.18/0.0.0.0'), mockNet3);
  throws(() => NetV4.fromStringMask('192.168.1.2//255.255.255.0'));
  throws(() => NetV4.fromStringMask('192.168.1.2/255.254.255.0'));
});

test('NetV4.fromStringRange()', () => {
  deepEqual(NetV4.fromStringRange('192.168.1.0-192.168.1.255'), mockNet1);
  deepEqual(NetV4.fromStringRange('19.19.19.19-19.19.19.19'), mockNet2);
  deepEqual(NetV4.fromStringRange('0.0.0.0-255.255.255.255'), mockNet3);
  throws(() => NetV4.fromStringRange('192.168.1..-192.168.1.255'));
  throws(() => NetV4.fromStringRange('192.168.1.255-192.168.1.0'));
  throws(() => NetV4.fromStringRange('192.168.1.0-192.168.1.117'));
});

test('NetV4.fromStringPrefix()', () => {
  deepEqual(NetV4.fromIpPrefix(ipAddr, 24), mockNet1);
  throws(() => NetV4.fromIpPrefix(ipAddr, 33));
});

test('NetV4.fromIpMask()', () => {
  deepEqual(NetV4.fromIpMask(ipAddr, ipMask), mockNet1);
  throws(() => NetV4.fromIpMask(ipAddr, ipStart));
});

test('NetV4.fromIpRange()', () => {
  deepEqual(NetV4.fromIpRange(ipStart, ipFinish), mockNet1);
  throws(() => NetV4.fromIpRange(ipFinish, ipStart));
});

test('NetV4::toString()', () => {
  equal(NetV4.fromString('192.168.1.0/24').toString(), '192.168.1.0/24');
});

test('NetV4::toStringPrefix()', () => {
  equal(NetV4.fromString('192.168.1.0/24').toStringPrefix(), '192.168.1.0/24');
});

test('NetV4::toStringMask()', () => {
  equal(NetV4.fromString('192.168.1.0/24').toStringMask(), '192.168.1.0/255.255.255.0');
});

test('NetV4::toStringRange()', () => {
  equal(NetV4.fromString('192.168.1.0/24').toStringRange(), '192.168.1.0-192.168.1.255');
});

test('NetV4::getPrefixLen()', () => {
  equal(NetV4.fromString('0.0.0.0/20').getPrefixLen(), 20);
});

test('NetV4::getSize()', () => {
  equal(NetV4.fromString('255.255.255.255/20').getSize(), 1 << 12);
});

test('NetV4::getMask()', () => {
  deepEqual(
    NetV4.fromString('255.255.255.255/20').getMask(),
    IpV4.fromString('255.255.240.0')
  );
});

test('NetV4::getMaskInt()', () => {
  equal(
    NetV4.fromString('255.255.255.255/20').getMaskInt(),
    IpV4.fromString('255.255.240.0').toInt()
  );
});

test('NetV4::getHostMask()', () => {
  deepEqual(
    NetV4.fromString('255.255.255.255/28').getHostMask(),
    IpV4.fromString('0.0.0.15')
  );
});

test('NetV4::getHostMaskInt()', () => {
  equal(
    NetV4.fromString('255.255.255.255/28').getHostMaskInt(),
    IpV4.fromString('0.0.0.15').toInt()
  );
});

test('NetV4::getStart()', () => {
  deepEqual(
    NetV4.fromString('10.10.10.10/24').getStart(),
    IpV4.fromString('10.10.10.0')
  );
});

test('NetV4::getStartInt()', () => {
  equal(
    NetV4.fromString('10.10.10.10/24').getStartInt(),
    IpV4.fromString('10.10.10.0').toInt()
  );
});

test('NetV4::getFinish()', () => {
  deepEqual(
    NetV4.fromString('10.10.10.10/24').getFinish(),
    IpV4.fromString('10.10.10.255')
  );
});

test('NetV4::getFinishInt()', () => {
  equal(
    NetV4.fromString('10.10.10.10/24').getFinishInt(),
    IpV4.fromString('10.10.10.255').toInt()
  );
});

test('NetV4::getBase()', () => {
  deepEqual(
    NetV4.fromString('10.10.10.10/24').getBase(),
    IpV4.fromString('10.10.10.0')
  );
});

test('NetV4::getBaseInt()', () => {
  equal(
    NetV4.fromString('10.10.10.10/24').getBaseInt(),
    IpV4.fromString('10.10.10.0').toInt()
  );
});

test('NetV4::getBroadcast()', () => {
  deepEqual(
    NetV4.fromString('10.10.10.10/24').getBroadcast(),
    IpV4.fromString('10.10.10.255')
  );
});

test('NetV4::getBroadcastInt()', () => {
  equal(
    NetV4.fromString('10.10.10.10/24').getBroadcastInt(),
    IpV4.fromString('10.10.10.255').toInt()
  );
});

test('NetV4::isContainIP()', () => {
  equal(false, NetV4.fromString('10.10.10.10/24').isContainIP(IpV4.fromString('0.0.0.0')));
  equal(true, NetV4.fromString('10.10.10.10/24').isContainIP(IpV4.fromString('10.10.10.0')));
  equal(true, NetV4.fromString('10.10.10.10/24').isContainIP(IpV4.fromString('10.10.10.255')));
  equal(false, NetV4.fromString('10.10.10.10/24').isContainIP(IpV4.fromString('10.10.11.0')));
});

test('NetV4::isContainNet()', () => {
  equal(false, NetV4.fromString('10.10.10.10/24').isContainNet(NetV4.fromString('10.10.10.10/23')));
  equal(true, NetV4.fromString('10.10.10.10/24').isContainNet(NetV4.fromString('10.10.10.10/24')));
  equal(true, NetV4.fromString('10.10.10.10/24').isContainNet(NetV4.fromString('10.10.10.10/25')));
});

test('NetV4.equal()', () => {
  equal(true, NetV4.equal(
    NetV4.fromString('10.10.10.10/24'),
    NetV4.fromString('10.10.10.10/255.255.255.0')
  ));
  equal(false, NetV4.equal(
    NetV4.fromString('10.10.10.10/30'),
    NetV4.fromString('10.10.10.10/255.255.255.0')
  ));
});

test('NetV4::equal()', () => {
  equal(true, NetV4.fromString('10.10.10.10/24').equal(
    NetV4.fromString('10.10.10.10/255.255.255.0')
  ));
  equal(false, NetV4.fromString('10.10.10.10/28').equal(
    NetV4.fromString('10.10.10.10/255.255.255.0')
  ));
});

test('NetV4::forEachIP()', () => {
  let counter = 0;
  NetV4.fromString('0.0.0.0/30').forEachIP((iterIp) => {
    deepEqual(iterIp, IpV4.fromInt(counter++));
  });
});

test('NetV4::forEachInt()', () => {
  let counter = 0;
  NetV4.fromString('0.0.0.0/30').forEachInt((iterIp) => {
    equal(iterIp, counter++);
  });
});

test('NetV4::isUnspecified()', () => {
  equal(true, NetV4.fromString('0.0.0.0/32').isUnspecified());
  equal(false, NetV4.fromString('1.1.1.1/32').isUnspecified());
});

test('NetV4::isLoopback()', () => {
  equal(true, NetV4.fromString('127.0.0.111/25').isLoopback());
  equal(true, NetV4.fromString('127.0.0.111/24').isLoopback());
  equal(false, NetV4.fromString('127.0.0.111/23').isLoopback());
});

test('NetV4::isPrivate()', () => {
  equal(true, NetV4.fromString('10.0.0.111/9').isPrivate());
  equal(true, NetV4.fromString('10.0.0.111/8').isPrivate());
  equal(false, NetV4.fromString('10.0.0.111/7').isPrivate());
  equal(true, NetV4.fromString('172.16.0.111/13').isPrivate());
  equal(true, NetV4.fromString('172.16.0.111/12').isPrivate());
  equal(false, NetV4.fromString('172.16.0.111/11').isPrivate());
  equal(true, NetV4.fromString('192.168.0.111/17').isPrivate());
  equal(true, NetV4.fromString('192.168.0.111/16').isPrivate());
  equal(false, NetV4.fromString('192.168.0.111/15').isPrivate());
});

test('NetV4::isLinkLocal()', () => {
  equal(true, NetV4.fromString('169.254.0.111/17').isLinkLocal());
  equal(true, NetV4.fromString('169.254.0.111/16').isLinkLocal());
  equal(false, NetV4.fromString('169.254.0.111/15').isLinkLocal());
});

test('NetV4::isMulticast()', () => {
  equal(true, NetV4.fromString('224.0.0.111/5').isMulticast());
  equal(true, NetV4.fromString('224.0.0.111/4').isMulticast());
  equal(false, NetV4.fromString('224.0.0.111/3').isMulticast());
});

test('NetV4::isBroadcast()', () => {
  equal(true, NetV4.fromString('255.255.255.255/32').isBroadcast());
  equal(false, NetV4.fromString('1.1.1.1/32').isBroadcast());
});

test('NetV4::isDocumentation()', () => {
  equal(true, NetV4.fromString('192.0.2.111/25').isDocumentation());
  equal(true, NetV4.fromString('192.0.2.111/24').isDocumentation());
  equal(false, NetV4.fromString('192.0.2.111/23').isDocumentation());
  equal(true, NetV4.fromString('198.51.100.111/25').isDocumentation());
  equal(true, NetV4.fromString('198.51.100.111/24').isDocumentation());
  equal(false, NetV4.fromString('198.51.100.111/23').isDocumentation());
  equal(true, NetV4.fromString('203.0.113.111/25').isDocumentation());
  equal(true, NetV4.fromString('203.0.113.111/24').isDocumentation());
  equal(false, NetV4.fromString('203.0.113.111/23').isDocumentation());
});

test('NetV4::isGlobal()', () => {
  equal(false, NetV4.fromString('0.0.0.0/32').isGlobal());
  equal(false, NetV4.fromString('10.0.0.0/8').isGlobal());
  equal(false, NetV4.fromString('127.0.0.0/24').isGlobal());
  equal(false, NetV4.fromString('169.254.0.0/16').isGlobal());
  equal(false, NetV4.fromString('172.16.0.0/12').isGlobal());
  equal(false, NetV4.fromString('192.168.0.0/16').isGlobal());
  equal(false, NetV4.fromString('192.0.2.0/24').isGlobal());
  equal(false, NetV4.fromString('198.51.100.0/24').isGlobal());
  equal(false, NetV4.fromString('203.0.113.0/24').isGlobal());
  equal(false, NetV4.fromString('255.255.255.255/32').isGlobal());
  equal(true, NetV4.fromString('113.0.0.113/31').isGlobal());
  equal(true, NetV4.fromString('23.23.23.23/16').isGlobal());
  equal(true, NetV4.fromString('209.3.177.59/8').isGlobal());
});
