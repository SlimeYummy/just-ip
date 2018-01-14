"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var intBuf_1 = new Uint32Array(1);
var byteBuf_1 = new Uint8Array(intBuf_1.buffer);
var intBuf_2 = new Uint32Array(1);
var byteBuf_2 = new Uint8Array(intBuf_2.buffer);
intBuf_1[0] = 1;
exports.ENDIAN = (byteBuf_1[0] === 1 ? 'le' : 'be');
function bs2le(b1, b2, b3, b4) {
    byteBuf_1[0] = b4;
    byteBuf_1[1] = b3;
    byteBuf_1[2] = b2;
    byteBuf_1[3] = b1;
    return intBuf_1[0];
}
exports.bs2le = bs2le;
;
function bs2be(b1, b2, b3, b4) {
    byteBuf_1[0] = b1;
    byteBuf_1[1] = b2;
    byteBuf_1[2] = b3;
    byteBuf_1[3] = b4;
    return intBuf_1[0];
}
exports.bs2be = bs2be;
;
exports.bs2he = exports.ENDIAN === 'le' ? bs2le : bs2be;
function le2bs(int) {
    intBuf_1[0] = int;
    byteBuf_2[0] = byteBuf_1[3];
    byteBuf_2[1] = byteBuf_1[2];
    byteBuf_2[2] = byteBuf_1[1];
    byteBuf_2[3] = byteBuf_1[0];
    return byteBuf_2;
}
exports.le2bs = le2bs;
;
function be2bs(int) {
    intBuf_1[0] = int;
    return byteBuf_1;
}
exports.be2bs = be2bs;
;
exports.he2bs = exports.ENDIAN === 'le' ? le2bs : be2bs;
var reverse = function (int) {
    intBuf_1[0] = int;
    byteBuf_2[0] = byteBuf_1[3];
    byteBuf_2[1] = byteBuf_1[2];
    byteBuf_2[2] = byteBuf_1[1];
    byteBuf_2[3] = byteBuf_1[0];
    return intBuf_2[0];
};
var keep = function (int) {
    return int;
};
exports.le2be = reverse;
exports.le2he = exports.ENDIAN === 'le' ? keep : reverse;
exports.be2le = reverse;
exports.be2he = exports.ENDIAN === 'be' ? keep : reverse;
exports.he2le = exports.ENDIAN === 'le' ? keep : reverse;
exports.he2be = exports.ENDIAN === 'be' ? keep : reverse;
//# sourceMappingURL=endian.js.map