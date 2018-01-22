# Just-IP

[![Build Status](https://img.shields.io/travis/NaNuNoo/just-ip/master.svg?style=flat)](https://travis-ci.org/NaNuNoo/just-ip.svg?branch=master)
[![Coverage Status](https://coveralls.io/repos/github/NaNuNoo/just-ip/badge.svg?branch=master)](https://coveralls.io/github/NaNuNoo/just-ip?branch=master)
[![NPM version](https://img.shields.io/npm/v/just-ip.svg?style=flat)](https://www.npmjs.org/package/just-ip)

## Introduction

Just-IP is an library for parsing ip address and subnet in both browser and nodejs

## Install

`npm install just-ip --save`

## Documention & Demo

```js
const ip = IpV4.fromBytes(127, 0, 0, 1);

const intIp = ip.toInt(); // => 0x7F000001
const strIp = ip.toString(); // => '127.0.0.1'

ip.isLinkLocal(); // => true
ip.isGlobal(); // => false

IpV4.equal(intIp, strIp); // => true
IpV4.isBroadcast('255.255.255.255'); // => true

const net = NetV4.fromString('172.10.1.33/24');

net.getSize(); // => 256
net.getBase('ip'); // => IpV4(172.10.1.0)
net.getBoardcase('arr'); // => [172, 10, 1, 255]

net.containIP(ip); // => false
NetV4.containNet(net, '172.10.1.0/255.255.255.252'); // => true
```

You can find more documention and demos here.

https://github.com/NaNuNoo/just-ip/tree/master/src
