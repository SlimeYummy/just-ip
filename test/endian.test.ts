import 'mocha';
import { equal, deepEqual } from 'assert';
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

  it('bs2le()', () => equal(bs2le(0x11, 0x22, 0x33, 0x44), intLe));
  it('bs2le()', () => equal(bs2be(0x11, 0x22, 0x33, 0x44), intBe));
  it('bs2he()', () => equal(bs2he(0x11, 0x22, 0x33, 0x44), intHe));

  it('le2bs()', () => deepEqual(le2bs(intLe), bytes));
  it('be2bs()', () => deepEqual(be2bs(intBe), bytes));
  it('he2bs()', () => deepEqual(he2bs(intHe), bytes));

  it('intLe()', () => equal(le2be(intLe), intBe));
  it('intLe()', () => equal(le2he(intLe), intHe));
  it('intBe()', () => equal(be2le(intBe), intLe));
  it('intBe()', () => equal(be2he(intBe), intHe));
  it('intHe()', () => equal(he2le(intHe), intLe));
  it('intHe()', () => equal(he2be(intHe), intBe));

});
