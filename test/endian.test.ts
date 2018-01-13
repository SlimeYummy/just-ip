import 'mocha';
import * as assert from 'assert';
import {
  bs2le, bs2be, bs2he,
  le2bs, he2bs, be2bs,
  le2be, le2he, be2le, be2he, he2le, he2be
} from '../src/endian';

describe('endian.js', () => {
  const intLe = new Uint32Array(new Uint8Array([0x44, 0x33, 0x22, 0x11]).buffer)[0];
  const intBe = new Uint32Array(new Uint8Array([0x11, 0x22, 0x33, 0x44]).buffer)[0];
  const intHe = 0x11223344;
  const bytes = new Uint8Array([0x11, 0x22, 0x33, 0x44]);

  describe('bytes => int', () => {
    it('bs2le()', () => assert.equal(bs2le(0x11, 0x22, 0x33, 0x44), intLe));
    it('bs2le()', () => assert.equal(bs2be(0x11, 0x22, 0x33, 0x44), intBe));
    it('bs2he()', () => assert.equal(bs2he(0x11, 0x22, 0x33, 0x44), intHe));
  });

  describe('int => bytes', () => {
    it('le2bs()', () => assert.deepEqual(le2bs(intLe), bytes));
    it('be2bs()', () => assert.deepEqual(be2bs(intBe), bytes));
    it('he2bs()', () => assert.deepEqual(he2bs(intHe), bytes));
  });

  describe('int => int', () => {
    it('intLe()', () => assert.deepEqual(le2be(intLe), intBe));
    it('intLe()', () => assert.deepEqual(le2he(intLe), intHe));
    it('intBe()', () => assert.deepEqual(be2le(intBe), intLe));
    it('intBe()', () => assert.deepEqual(be2he(intBe), intHe));
    it('intHe()', () => assert.deepEqual(he2le(intHe), intLe));
    it('intHe()', () => assert.deepEqual(he2be(intHe), intBe));
  });

});
