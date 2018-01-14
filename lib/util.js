"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var IPV4Error = (function (_super) {
    __extends(IPV4Error, _super);
    function IPV4Error() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return IPV4Error;
}(Error));
exports.IPV4Error = IPV4Error;
;
var NetV4Error = (function (_super) {
    __extends(NetV4Error, _super);
    function NetV4Error() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return NetV4Error;
}(Error));
exports.NetV4Error = NetV4Error;
;
var RE_NEW_LINE = /\r|\n/g;
function makeRegex(text) {
    return new RegExp(text.replace(RE_NEW_LINE, ''));
}
exports.makeRegex = makeRegex;
//# sourceMappingURL=util.js.map