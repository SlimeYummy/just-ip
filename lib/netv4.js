"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var util_1 = require("./util");
var endian_1 = require("./endian");
var ipv4_1 = require("./ipv4");
var RE_SUBNET_V4_BITS = util_1.makeRegex("^\n\\s*(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\n\\s*\\.\n\\s*(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\n\\s*\\.\n\\s*(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\n\\s*\\.\n\\s*(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\n\\s*\\/\n\\s*(3[0-2]|[1-2][0-9]|[0-9])\n\\s*$");
var RE_SUBNET_V4_MASK = util_1.makeRegex("^\n\\s*(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\n\\s*\\.\n\\s*(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\n\\s*\\.\n\\s*(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\n\\s*\\.\n\\s*(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\n\\s*\\/\n\\s*(255|254|252|248|240|224|192|128|0)\n\\s*\\.\n\\s*(255|254|252|248|240|224|192|128|0)\n\\s*\\.\n\\s*(255|254|252|248|240|224|192|128|0)\n\\s*\\.\n\\s*(255|254|252|248|240|224|192|128|0)\n\\s*$");
var RE_SUBNET_V4_RANGE = util_1.makeRegex("^\n\\s*(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\n\\s*\\.\n\\s*(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\n\\s*\\.\n\\s*(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\n\\s*\\.\n\\s*(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\n\\s*\\-\n\\s*(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\n\\s*\\.\n\\s*(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\n\\s*\\.\n\\s*(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\n\\s*\\.\n\\s*(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\n\\s*$");
function ipFromString(s1, s2, s3, s4) {
    var b1 = parseInt(s1);
    var b2 = parseInt(s2);
    var b3 = parseInt(s3);
    var b4 = parseInt(s4);
    return endian_1.bs2he(b1, b2, b3, b4);
}
function maskFromString(s1, s2, s3, s4) {
    var b1 = parseInt(s1);
    var b2 = parseInt(s2);
    var b3 = parseInt(s3);
    var b4 = parseInt(s4);
    var mask = endian_1.bs2he(b1, b2, b3, b4);
    var hostMask = 0xFFFFFFFF - mask;
    if ((hostMask & (hostMask + 1)) !== 0) {
        throw new util_1.NetV4Error();
    }
    return mask;
}
function prefix2Mask(prefix) {
    if (prefix === 0) {
        return 0;
    }
    var suffix = 32 - prefix;
    var hostMask = ((1 << suffix) >>> 0) - 1;
    return 0xFFFFFFFF - hostMask;
}
function mask2Prefix(mask) {
    if (mask === 0) {
        return 0;
    }
    var count = 0;
    var hostMask = 0xFFFFFFFF - mask;
    while (hostMask >>> count > 0) {
        count = count + 1;
    }
    return 32 - count;
}
function range2Mask(start, finish) {
    if (start > finish) {
        throw new util_1.NetV4Error();
    }
    var hostMask = finish - start;
    var mask = 0xFFFFFFFF - hostMask;
    if ((hostMask & (hostMask + 1)) !== 0) {
        throw new util_1.NetV4Error();
    }
    return mask;
}
function ip2String(int) {
    var bytes = endian_1.he2bs(int);
    return bytes[0] + "." + bytes[1] + "." + bytes[2] + "." + bytes[3];
}
var NetV4 = (function () {
    function NetV4() {
        this._base = 0;
        this._mask = 0;
        this._prefix = 0;
    }
    NetV4.fromString = function (str) {
        var match = null;
        if (match = RE_SUBNET_V4_BITS.exec(str)) {
            var net = new NetV4();
            net._prefix = parseInt(match[5]);
            net._mask = prefix2Mask(net._prefix);
            net._base = (net._mask & ipFromString(match[1], match[2], match[3], match[4])) >>> 0;
            return net;
        }
        else if (match = RE_SUBNET_V4_MASK.exec(str)) {
            var net = new NetV4();
            net._mask = maskFromString(match[5], match[6], match[7], match[8]);
            net._prefix = mask2Prefix(net._mask);
            net._base = (net._mask & ipFromString(match[1], match[2], match[3], match[4])) >>> 0;
            return net;
        }
        else if (match = RE_SUBNET_V4_RANGE.exec(str)) {
            var net = new NetV4();
            var start = ipFromString(match[1], match[2], match[3], match[4]);
            var finish = ipFromString(match[5], match[6], match[7], match[8]);
            net._mask = range2Mask(start, finish);
            net._prefix = mask2Prefix(net._mask);
            net._base = (net._mask & start) >>> 0;
            return net;
        }
        else {
            throw new util_1.NetV4Error();
        }
    };
    NetV4.fromStringPrefix = function (str) {
        var match = RE_SUBNET_V4_BITS.exec(str);
        if (!match) {
            throw new util_1.NetV4Error();
        }
        var net = new NetV4();
        net._prefix = parseInt(match[5]);
        net._mask = prefix2Mask(net._prefix);
        net._base = (net._mask & ipFromString(match[1], match[2], match[3], match[4])) >>> 0;
        return net;
    };
    NetV4.fromStringMask = function (str) {
        var match = RE_SUBNET_V4_MASK.exec(str);
        if (!match) {
            throw new util_1.NetV4Error();
        }
        var net = new NetV4();
        net._mask = maskFromString(match[5], match[6], match[7], match[8]);
        net._prefix = mask2Prefix(net._mask);
        net._base = (net._mask & ipFromString(match[1], match[2], match[3], match[4])) >>> 0;
        return net;
    };
    NetV4.fromStringRange = function (str) {
        var match = RE_SUBNET_V4_RANGE.exec(str);
        if (!match) {
            throw new util_1.NetV4Error();
        }
        var net = new NetV4();
        var start = ipFromString(match[1], match[2], match[3], match[4]);
        var finish = ipFromString(match[5], match[6], match[7], match[8]);
        net._mask = range2Mask(start, finish);
        net._prefix = mask2Prefix(net._mask);
        net._base = (start & net._mask) >>> 0;
        return net;
    };
    NetV4.fromIpPrefix = function (ip, prefix) {
        if (prefix < 0 || 32 < prefix) {
            throw new util_1.NetV4Error();
        }
        var net = new NetV4();
        net._prefix = prefix;
        net._mask = prefix2Mask(net._prefix);
        net._base = (ip.toInt() & net._mask) >>> 0;
        return net;
    };
    NetV4.fromIpMask = function (ip, mask) {
        var hostMask = 0xFFFFFFFF - mask.toInt();
        if ((hostMask & (hostMask + 1)) !== 0) {
            throw new util_1.NetV4Error();
        }
        var net = new NetV4();
        net._mask = mask.toInt();
        net._prefix = mask2Prefix(net._mask);
        net._base = (ip.toInt() & net._mask) >>> 0;
        return net;
    };
    NetV4.fromIpRange = function (start, finish) {
        var net = new NetV4();
        net._mask = range2Mask(start.toInt(), finish.toInt());
        net._prefix = mask2Prefix(net._mask);
        net._base = (start.toInt() & net._mask) >>> 0;
        return net;
    };
    NetV4.prototype.toString = function () {
        return ip2String(this._base) + "/" + this._prefix;
    };
    NetV4.prototype.toStringPrefix = function () {
        return ip2String(this._base) + "/" + this._prefix;
    };
    NetV4.prototype.toStringMask = function () {
        return ip2String(this._base) + "/" + ip2String(this._mask);
    };
    NetV4.prototype.toStringRange = function () {
        return ip2String(this._base) + "-" + ip2String(this._base + (0xFFFFFFFF - this._mask));
    };
    NetV4.prototype.getPrefixLen = function () {
        return this._prefix;
    };
    NetV4.prototype.getSize = function () {
        return 1 << (32 - this._prefix);
    };
    NetV4.prototype.getMask = function () {
        return ipv4_1.IpV4.fromInt(this._mask);
    };
    NetV4.prototype.getMaskInt = function () {
        return this._mask;
    };
    NetV4.prototype.getHostMask = function () {
        return ipv4_1.IpV4.fromInt(0xFFFFFFFF - this._mask);
    };
    NetV4.prototype.getHostMaskInt = function () {
        return 0xFFFFFFFF - this._mask;
    };
    NetV4.prototype.getStart = function () {
        return ipv4_1.IpV4.fromInt(this._base);
    };
    NetV4.prototype.getStartInt = function () {
        return this._base;
    };
    NetV4.prototype.getFinish = function () {
        return ipv4_1.IpV4.fromInt(this._base + (0xFFFFFFFF - this._mask));
    };
    NetV4.prototype.getFinishInt = function () {
        return this._base + (0xFFFFFFFF - this._mask);
    };
    NetV4.prototype.getBase = function () {
        return ipv4_1.IpV4.fromInt(this._base);
    };
    NetV4.prototype.getBaseInt = function () {
        return this._base;
    };
    NetV4.prototype.getBroadcast = function () {
        return ipv4_1.IpV4.fromInt(this._base + (0xFFFFFFFF - this._mask));
    };
    NetV4.prototype.getBroadcastInt = function () {
        return this._base + (0xFFFFFFFF - this._mask);
    };
    NetV4.prototype.isContainIP = function (ip) {
        return (ip.toInt() & this._mask) === this._base;
    };
    NetV4.prototype.isContainNet = function (net) {
        return (this._prefix <= net._prefix) &&
            (net._base & this._mask) >>> 0 === this._base;
    };
    NetV4.equal = function (net1, net2) {
        return net1._base === net2._base && net1._prefix === net2._prefix;
    };
    NetV4.prototype.equal = function (net) {
        return this._base === net._base && this._prefix === net._prefix;
    };
    NetV4.prototype.forEachIP = function (func) {
        var start = this._base;
        var finish = this._base + (0xFFFFFFFF - this._mask);
        for (var iter = start; iter <= finish; iter += 1) {
            func(ipv4_1.IpV4.fromInt(iter));
        }
    };
    NetV4.prototype.forEachInt = function (func) {
        var start = this._base;
        var finish = this._base + (0xFFFFFFFF - this._mask);
        for (var iter = start; iter <= finish; iter += 1) {
            func(iter);
        }
    };
    NetV4.prototype.isUnspecified = function () {
        return this._base === 0 && this._prefix === 32;
    };
    NetV4.prototype.isLoopback = function () {
        return (this._base >>> 8) === 0x7F0000 && this._prefix >= 24;
    };
    NetV4.prototype.isPrivate = function () {
        return (this._base >>> 24) === 0x0A && this._prefix >= 8 ||
            (this._base >>> 20) === 0xAC1 && this._prefix >= 12 ||
            (this._base >>> 16) === 0xC0A8 && this._prefix >= 16;
    };
    NetV4.prototype.isLinkLocal = function () {
        return (this._base >>> 16) === 0xA9FE && this._prefix >= 16;
    };
    NetV4.prototype.isMulticast = function () {
        return (this._base >>> 28) === 0xE && this._prefix >= 4;
    };
    NetV4.prototype.isBroadcast = function () {
        return this._base === 0xFFFFFFFF && this._prefix === 32;
    };
    NetV4.prototype.isDocumentation = function () {
        return (this._base >>> 8) === 0xC00002 && this._prefix >= 24 ||
            (this._base >>> 8) === 0xC63364 && this._prefix >= 24 ||
            (this._base >>> 8) === 0xCB0071 && this._prefix >= 24;
    };
    NetV4.prototype.isGlobal = function () {
        return !this.isPrivate() &&
            !this.isLoopback() &&
            !this.isLinkLocal() &&
            !this.isBroadcast() &&
            !this.isDocumentation() &&
            !this.isUnspecified();
    };
    return NetV4;
}());
exports.NetV4 = NetV4;
//# sourceMappingURL=netv4.js.map