"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var util_1 = require("./util");
var endian_1 = require("./endian");
var RE_IPV4 = util_1.makeRegex("^\n\\s*(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\n\\s*\\.\n\\s*(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\n\\s*\\.\n\\s*(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\n\\s*\\.\n\\s*(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\n\\s*$");
var IpV4 = (function () {
    function IpV4() {
        this._b1 = 0;
        this._b2 = 0;
        this._b3 = 0;
        this._b4 = 0;
        this._int = 0;
    }
    IpV4.fromString = function (str) {
        var match = RE_IPV4.exec(str);
        if (!match) {
            throw new util_1.IPV4Error();
        }
        var ip = new IpV4();
        ip._b1 = parseInt(match[1]);
        ip._b2 = parseInt(match[2]);
        ip._b3 = parseInt(match[3]);
        ip._b4 = parseInt(match[4]);
        ip._int = endian_1.bs2he(ip._b1, ip._b2, ip._b3, ip._b4);
        return ip;
    };
    IpV4.fromInt = function (int) {
        int = int >>> 0;
        if (int < 0 || 0xFFFFFFFF < int) {
            throw new util_1.IPV4Error();
        }
        var ip = new IpV4();
        var bytes = endian_1.he2bs(int);
        ip._b1 = bytes[0];
        ip._b2 = bytes[1];
        ip._b3 = bytes[2];
        ip._b4 = bytes[3];
        ip._int = int;
        return ip;
    };
    IpV4.fromIntBe = function (int) {
        int = int >>> 0;
        if (int < 0 || 0xFFFFFFFF < int) {
            throw new util_1.IPV4Error();
        }
        var ip = new IpV4();
        var bytes = endian_1.be2bs(int);
        ip._b1 = bytes[0];
        ip._b2 = bytes[1];
        ip._b3 = bytes[2];
        ip._b4 = bytes[3];
        ip._int = endian_1.be2he(int);
        return ip;
    };
    IpV4.fromIntLe = function (int) {
        int = int >>> 0;
        if (int < 0 || 0xFFFFFFFF < int) {
            throw new util_1.IPV4Error();
        }
        var ip = new IpV4();
        var bytes = endian_1.le2bs(int);
        ip._b1 = bytes[3];
        ip._b2 = bytes[2];
        ip._b3 = bytes[1];
        ip._b4 = bytes[0];
        ip._int = endian_1.le2he(int);
        return ip;
    };
    IpV4.fromBytes = function (b1, b2, b3, b4) {
        if ((b1 < 0 || 255 < b1) ||
            (b2 < 0 || 255 < b2) ||
            (b3 < 0 || 255 < b3) ||
            (b4 < 0 || 255 < b4)) {
            throw new util_1.IPV4Error();
        }
        var ip = new IpV4();
        ip._b1 = b1;
        ip._b2 = b2;
        ip._b3 = b3;
        ip._b4 = b4;
        ip._int = endian_1.bs2he(b1, b2, b3, b4);
        return ip;
    };
    IpV4.fromArray = function (array) {
        return IpV4.fromBytes(array[0], array[1], array[2], array[3]);
    };
    IpV4.prototype.toString = function () {
        return this._b1 + "." + this._b2 + "." + this._b3 + "." + this._b4;
    };
    IpV4.prototype.toInt = function () {
        return this._int;
    };
    IpV4.prototype.toIntBe = function () {
        return endian_1.he2be(this._int);
    };
    IpV4.prototype.toIntLe = function () {
        return endian_1.le2he(this._int);
    };
    IpV4.prototype.toArray = function () {
        return [this._b1, this._b2, this._b3, this._b4];
    };
    IpV4.equal = function (ip1, ip2) {
        return ip1._int === ip2._int;
    };
    IpV4.prototype.equal = function (ip) {
        return this._int === ip._int;
    };
    return IpV4;
}());
exports.IpV4 = IpV4;
//# sourceMappingURL=ipv4.js.map