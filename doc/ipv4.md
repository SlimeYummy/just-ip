# IpV4

Create IpV4 object, throw an error if failed.

```js
const ip = IpV4.fromString('127.0.0.11'); // => IpV4(127.0.0.11)

const ip = IpV4.fromInt(0x7F00000B); // => IpV4(11.0.0.127)

const intBe = new Buffer([127, 0, 0, 11]).readUint32BE();
const ip = IpV4.fromIntBe(intBe); // => IpV4(127.0.0.11)

const intLe = new Buffer([11, 0, 0, 127]).readUint32LE();
const ip = IpV4.fromIntLe(intLe); // => IpV4(127.0.0.11)

const ip = IpV4.fromBytes(127, 0, 0, 11); // => IpV4(127.0.0.11)

const ip = IpV4.fromArray([127, 0, 0, 11]); // => IpV4(127.0.0.11)

const ip = IpV4.fromString('127.0.0.300'); // throw new IpV4Error()
```

Create IpV4 object, return null if failed.

```js
const ip = IpV4.tryString('127.0.0.11'); // => IpV4(127.0.0.11)

const ip = IpV4.tryInt(0x7F00000B); // => IpV4(11.0.0.127)

const intBe = new Buffer([127, 0, 0, 11]).readUint32BE();
const ip = IpV4.tryIntBe(intBe); // => IpV4(127.0.0.11)

const intLe = new Buffer([11, 0, 0, 127]).readUint32LE();
const ip = IpV4.tryIntLe(intLe); // => IpV4(127.0.0.11)

const ip = IpV4.tryBytes(127, 0, 0, 11); // => IpV4(127.0.0.11)

const ip = IpV4.tryArray([127, 0, 0, 11]); // => IpV4(127.0.0.11)

const ip = IpV4.fromString('127.0.0.300'); // => null
```

Convert IpV4 object to other type.

```js
const ip = IpV4.fromString('127.0.0.11');

const str = ip.toString(); // => '127.0.0.11'

const int = ip.toInt(); // => 0x7F00000B

const intBe = ip.toIntBe(); // => new Buffer([127, 0, 0, 11]).readUint32BE()

const intLe = ip.toIntLe(); // => new Buffer([127, 0, 0, 11]).readUint32LE()

const array = ip.toArray(); // => [127, 0, 0, 11]
```

IpV4 mothods.

```js
IpV4.fromString('1.1.1.1').equal(IpV4.fromBytes(1, 1, 1, 1)); // => true

IpV4.fromString('0.0.0.0').isUnspecified(); // => true

IpV4.fromString('127.0.0.1').isLoopback(); // => true

IpV4.fromString('10.0.0.1').isPrivate(); // => true

IpV4.fromString('169.254.0.1').isLinkLocal(); // => true

IpV4.fromString('224.0.0.1').isMulticast(); // => true

IpV4.fromString('255.255.255.255').isBroadcast(); // => true

IpV4.fromString('192.0.2.1').isDocumentation(); // => true

IpV4.fromString('132.16.4.16').isGlobal(); // => true
```

IpV4 static methods.

```js
IpV4.equal('1.1.1.1', [1, 1, 1, 1]); // => true
IpV4.equal(0x01010101, IpV4.fromString('1.1.1.1')); // => true
IpV4.equal('1.1.1.1', [1, 1, 10, 10]); // => false

IpV4.isUnspecified(0x00000000); // => true

IpV4.isLoopback('127.0.0.1'); // => true

IpV4.isPrivate([10, 0, 0, 1]); // => true

IpV4.isLinkLocal(IpV4.fromString('169.254.0.1')); // => true

IpV4.isMulticast(0xE0000001); // => true

IpV4.isBroadcast('255.255.255.255'); // => true

IpV4.isDocumentation([192, 0, 2, 1]); // => true

IpV4.isGlobal(IpV4.fromString('132.16.4.13')); // => true
```