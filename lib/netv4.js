"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var util_1 = require("./util");
var endian_1 = require("./endian");
var ipv4_1 = require("./ipv4");
var RE_SUBNET_V4_PREFIX = /^\s*(\d{1,3})\s*\.\s*(\d{1,3})\s*\.\s*(\d{1,3})\s*\.\s*(\d{1,3})\s*\/\s*(\d{1,2})\s*$/;
var RE_SUBNET_V4_MASK = /^\s*(\d{1,3})\s*\.\s*(\d{1,3})\s*\.\s*(\d{1,3})\s*\.\s*(\d{1,3})\s*\/\s*(\d{1,3})\s*\.\s*(\d{1,3})\s*\.\s*(\d{1,3})\s*\.\s*(\d{1,3})\s*$/;
var RE_SUBNET_V4_RANGE = /^\s*(\d{1,3})\s*\.\s*(\d{1,3})\s*\.\s*(\d{1,3})\s*\.\s*(\d{1,3})\s*\-\s*(\d{1,3})\s*\.\s*(\d{1,3})\s*\.\s*(\d{1,3})\s*\.\s*(\d{1,3})\s*$/;
function parseIp(s1, s2, s3, s4) {
    var b1 = parseInt(s1);
    var b2 = parseInt(s2);
    var b3 = parseInt(s3);
    var b4 = parseInt(s4);
    if (b1 > 255 || b2 > 255 || b3 > 255 || b4 > 255) {
        return -1;
    }
    return endian_1.bs2he(b1, b2, b3, b4);
}
function parseMask(s1, s2, s3, s4) {
    var b1 = parseInt(s1);
    var b2 = parseInt(s2);
    var b3 = parseInt(s3);
    var b4 = parseInt(s4);
    if (b1 > 255 || b2 > 255 || b3 > 255 || b4 > 255) {
        return -1;
    }
    var mask = endian_1.bs2he(b1, b2, b3, b4);
    var hostMask = 0xFFFFFFFF - mask;
    if ((hostMask & (hostMask + 1)) !== 0) {
        return -1;
    }
    return mask;
}
function parsePrefix(s) {
    var prefix = parseInt(s);
    if (prefix < 0 || 32 < prefix) {
        return -1;
    }
    return prefix;
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
        return -1;
    }
    var hostMask = finish - start;
    var mask = 0xFFFFFFFF - hostMask;
    if ((hostMask & (hostMask + 1)) !== 0) {
        return -1;
    }
    return mask;
}
function ip2String(int) {
    var bytes = endian_1.he2bs(int);
    return bytes[0] + "." + bytes[1] + "." + bytes[2] + "." + bytes[3];
}
function ip2Array(int) {
    var bytes = endian_1.he2bs(int);
    return [bytes[0], bytes[1], bytes[2], bytes[3]];
}
function toIpV4Like(int, type) {
    switch (type) {
        case 'ip': return ipv4_1.IpV4.fromInt(int);
        case 'he': return int;
        case 'be': return endian_1.he2be(int);
        case 'le': return endian_1.he2le(int);
        case 'str': return ip2String(int);
        case 'arr': return ip2Array(int);
        default: throw new Error();
    }
}
function castNetV4(net) {
    if (typeof net === 'string') {
        return NetV4.fromString(net);
    }
    else if (net instanceof NetV4) {
        return net;
    }
    else {
        throw new util_1.NetV4Error();
    }
}
exports.castNetV4 = castNetV4;
var NetV4 = (function () {
    function NetV4() {
        this._base = 0;
        this._mask = 0;
        this._prefix = 0;
    }
    NetV4.fromString = function (str) {
        var net = null;
        if (net = NetV4.tryStringPrefix(str)) {
            return net;
        }
        else if (net = NetV4.tryStringMask(str)) {
            return net;
        }
        else if (net = NetV4.tryStringRange(str)) {
            return net;
        }
        else {
            throw new util_1.NetV4Error();
        }
    };
    NetV4.tryString = function (str) {
        var net = null;
        if (net = NetV4.tryStringPrefix(str)) {
            return net;
        }
        else if (net = NetV4.tryStringMask(str)) {
            return net;
        }
        else if (net = NetV4.tryStringRange(str)) {
            return net;
        }
        else {
            return null;
        }
    };
    NetV4.fromStringPrefix = function (str) {
        var net = NetV4.tryStringPrefix(str);
        if (!net) {
            throw new util_1.NetV4Error();
        }
        return net;
    };
    NetV4.tryStringPrefix = function (str) {
        var match = RE_SUBNET_V4_PREFIX.exec(str);
        if (!match) {
            return null;
        }
        var net = new NetV4();
        net._prefix = parsePrefix(match[5]);
        if (net._prefix < 0) {
            return null;
        }
        net._mask = prefix2Mask(net._prefix);
        net._base = parseIp(match[1], match[2], match[3], match[4]);
        if (net._base < 0) {
            return null;
        }
        net._base = (net._base & net._mask) >>> 0;
        return net;
    };
    NetV4.fromStringMask = function (str) {
        var net = NetV4.tryStringMask(str);
        if (!net) {
            throw new util_1.NetV4Error();
        }
        return net;
    };
    NetV4.tryStringMask = function (str) {
        var match = RE_SUBNET_V4_MASK.exec(str);
        if (!match) {
            return null;
        }
        var net = new NetV4();
        net._base = parseIp(match[1], match[2], match[3], match[4]);
        if (net._base < 0) {
            return null;
        }
        net._mask = parseMask(match[5], match[6], match[7], match[8]);
        if (net._mask < 0) {
            return null;
        }
        net._prefix = mask2Prefix(net._mask);
        net._base = (net._base & net._mask) >>> 0;
        return net;
    };
    NetV4.fromStringRange = function (str) {
        var net = NetV4.tryStringRange(str);
        if (!net) {
            throw new util_1.NetV4Error();
        }
        return net;
    };
    NetV4.tryStringRange = function (str) {
        var match = RE_SUBNET_V4_RANGE.exec(str);
        if (!match) {
            return null;
        }
        var net = new NetV4();
        var start = parseIp(match[1], match[2], match[3], match[4]);
        if (start < 0) {
            return null;
        }
        var finish = parseIp(match[5], match[6], match[7], match[8]);
        if (finish < 0) {
            return null;
        }
        net._mask = range2Mask(start, finish);
        if (net._mask < 0) {
            return null;
        }
        net._prefix = mask2Prefix(net._mask);
        net._base = (start & net._mask) >>> 0;
        return net;
    };
    NetV4.fromIpPrefix = function (ip, prefix) {
        var net = NetV4.tryIpPrefix(ip, prefix);
        if (!net) {
            throw new util_1.NetV4Error();
        }
        return net;
    };
    NetV4.tryIpPrefix = function (ip, prefix) {
        if (prefix < 0 || 32 < prefix) {
            return null;
        }
        var net = new NetV4();
        net._prefix = prefix;
        net._mask = prefix2Mask(net._prefix);
        net._base = (ip.toInt() & net._mask) >>> 0;
        return net;
    };
    NetV4.fromIpMask = function (ip, mask) {
        var net = NetV4.tryIpMask(ip, mask);
        if (!net) {
            throw new util_1.NetV4Error();
        }
        return net;
    };
    NetV4.tryIpMask = function (ip, mask) {
        var hostMask = 0xFFFFFFFF - mask.toInt();
        if ((hostMask & (hostMask + 1)) !== 0) {
            return null;
        }
        var net = new NetV4();
        net._mask = mask.toInt();
        net._prefix = mask2Prefix(net._mask);
        net._base = (ip.toInt() & net._mask) >>> 0;
        return net;
    };
    NetV4.fromIpRange = function (start, finish) {
        var net = NetV4.tryIpRange(start, finish);
        if (!net) {
            throw new util_1.NetV4Error();
        }
        return net;
    };
    NetV4.tryIpRange = function (start, finish) {
        var net = new NetV4();
        net._mask = range2Mask(start.toInt(), finish.toInt());
        if (net._mask < 0) {
            return null;
        }
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
    NetV4.prototype.getMask = function (type) {
        if (type === void 0) { type = 'ip'; }
        return toIpV4Like(this._mask, type);
    };
    NetV4.prototype.getHostMask = function (type) {
        if (type === void 0) { type = 'ip'; }
        return toIpV4Like(0xFFFFFFFF - this._mask, type);
    };
    NetV4.prototype.getStart = function (type) {
        if (type === void 0) { type = 'ip'; }
        return toIpV4Like(this._base, type);
    };
    NetV4.prototype.getFinish = function (type) {
        if (type === void 0) { type = 'ip'; }
        return toIpV4Like(this._base + (0xFFFFFFFF - this._mask), type);
    };
    NetV4.prototype.getBase = function (type) {
        if (type === void 0) { type = 'ip'; }
        return toIpV4Like(this._base, type);
    };
    NetV4.prototype.getBroadcast = function (type) {
        if (type === void 0) { type = 'ip'; }
        return toIpV4Like(this._base + (0xFFFFFFFF - this._mask), type);
    };
    NetV4.prototype.isUnspecified = function () {
        return this._base === 0 && this._prefix === 32;
    };
    NetV4.isUnspecified = function (net) {
        return castNetV4(net).isUnspecified();
    };
    NetV4.prototype.isLoopback = function () {
        return (this._base >>> 8) === 0x7F0000 && this._prefix >= 24;
    };
    NetV4.isLoopback = function (net) {
        return castNetV4(net).isLoopback();
    };
    NetV4.prototype.isPrivate = function () {
        return (this._base >>> 24) === 0x0A && this._prefix >= 8 ||
            (this._base >>> 20) === 0xAC1 && this._prefix >= 12 ||
            (this._base >>> 16) === 0xC0A8 && this._prefix >= 16;
    };
    NetV4.isPrivate = function (net) {
        return castNetV4(net).isPrivate();
    };
    NetV4.prototype.isLinkLocal = function () {
        return (this._base >>> 16) === 0xA9FE && this._prefix >= 16;
    };
    NetV4.isLinkLocal = function (net) {
        return castNetV4(net).isLinkLocal();
    };
    NetV4.prototype.isMulticast = function () {
        return (this._base >>> 28) === 0xE && this._prefix >= 4;
    };
    NetV4.isMulticast = function (net) {
        return castNetV4(net).isMulticast();
    };
    NetV4.prototype.isBroadcast = function () {
        return this._base === 0xFFFFFFFF && this._prefix === 32;
    };
    NetV4.isBroadcast = function (net) {
        return castNetV4(net).isBroadcast();
    };
    NetV4.prototype.isDocumentation = function () {
        return (this._base >>> 8) === 0xC00002 && this._prefix >= 24 ||
            (this._base >>> 8) === 0xC63364 && this._prefix >= 24 ||
            (this._base >>> 8) === 0xCB0071 && this._prefix >= 24;
    };
    NetV4.isDocumentation = function (net) {
        return castNetV4(net).isDocumentation();
    };
    NetV4.prototype.isGlobal = function () {
        return !this.isPrivate() &&
            !this.isLoopback() &&
            !this.isLinkLocal() &&
            !this.isBroadcast() &&
            !this.isDocumentation() &&
            !this.isUnspecified();
    };
    NetV4.isGlobal = function (net) {
        return castNetV4(net).isGlobal();
    };
    NetV4.prototype.containIP = function (ip) {
        return (ip.toInt() & this._mask) === this._base;
    };
    NetV4.containIP = function (net, ip) {
        return castNetV4(net).containIP(ipv4_1.castIpV4(ip));
    };
    NetV4.prototype.containNet = function (net) {
        return (this._prefix <= net._prefix) &&
            (net._base & this._mask) >>> 0 === this._base;
    };
    NetV4.containNet = function (net1, net2) {
        return castNetV4(net1).containNet(castNetV4(net2));
    };
    NetV4.prototype.equal = function (net) {
        return this._base === net._base && this._prefix === net._prefix;
    };
    NetV4.equal = function (net1, net2) {
        return castNetV4(net1).equal(castNetV4(net2));
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
    return NetV4;
}());
exports.NetV4 = NetV4;
//# sourceMappingURL=netv4.js.map