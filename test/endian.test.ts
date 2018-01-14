import 'jest';
import { equal, deepEqual } from 'assert';
import {
  bs2le, bs2be, bs2he,
  le2bs, he2bs, be2bs,
  le2be, le2he, be2le, be2he, he2le, he2be
} from '../src/endian';

const intLe = new Uint32Array(new Uint8Array([0x44, 0x33, 0x22, 0x11]).buffer)[0];
const intBe = new Uint32Array(new Uint8Array([0x11, 0x22, 0x33, 0x44]).buffer)[0];
const intHe = 0x11223344;
const bytes = new Uint8Array([0x11, 0x22, 0x33, 0x44]);

test('bs2le()', () => equal(bs2le(0x11, 0x22, 0x33, 0x44), intLe));
test('bs2le()', () => equal(bs2be(0x11, 0x22, 0x33, 0x44), intBe));
test('bs2he()', () => equal(bs2he(0x11, 0x22, 0x33, 0x44), intHe));

test('le2bs()', () => deepEqual(le2bs(intLe), bytes));
test('be2bs()', () => deepEqual(be2bs(intBe), bytes));
test('he2bs()', () => deepEqual(he2bs(intHe), bytes));

test('intLe()', () => equal(le2be(intLe), intBe));
test('intLe()', () => equal(le2he(intLe), intHe));
test('intBe()', () => equal(be2le(intBe), intLe));
test('intBe()', () => equal(be2he(intBe), intHe));
test('intHe()', () => equal(he2le(intHe), intLe));
test('intHe()', () => equal(he2be(intHe), intBe));
