/* Self-contained QR Code generator (byte mode, auto version, public-domain algorithm).
   ES module port of the original window.CMQR generator.
   Usage: import { generate } from "./qr.js"; const m = generate("text", "M"); */

const ECC_CW = [
  [-1, 7, 10, 15, 20, 26, 18, 20, 24, 30, 18, 20, 24, 26, 30, 22, 24, 28, 30, 28, 28, 28, 28, 30, 30, 26, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
  [-1, 10, 16, 26, 18, 24, 16, 18, 22, 22, 26, 30, 22, 22, 24, 24, 28, 28, 26, 26, 26, 26, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28],
  [-1, 13, 22, 18, 26, 18, 24, 18, 22, 20, 24, 28, 26, 24, 20, 30, 24, 28, 28, 26, 30, 28, 30, 30, 30, 30, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
  [-1, 17, 28, 22, 16, 22, 28, 26, 26, 24, 28, 24, 28, 22, 24, 24, 30, 28, 28, 26, 28, 30, 24, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
];
const NUM_BLOCKS = [
  [-1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 4, 4, 4, 4, 4, 6, 6, 6, 6, 7, 8, 8, 9, 9, 10, 12, 12, 12, 13, 14, 15, 16, 17, 18, 19, 19, 20, 21, 22, 24, 25],
  [-1, 1, 1, 1, 2, 2, 4, 4, 4, 5, 5, 5, 8, 9, 9, 10, 10, 11, 13, 14, 16, 17, 17, 18, 20, 21, 23, 25, 26, 28, 29, 31, 33, 35, 37, 38, 40, 43, 45, 47, 49],
  [-1, 1, 1, 2, 2, 4, 4, 6, 6, 8, 8, 8, 10, 12, 16, 12, 17, 16, 18, 21, 20, 23, 23, 25, 27, 29, 34, 34, 35, 38, 40, 43, 45, 48, 51, 53, 56, 59, 62, 65, 68],
  [-1, 1, 1, 2, 4, 4, 4, 5, 6, 8, 8, 11, 11, 16, 16, 18, 16, 19, 21, 25, 25, 25, 34, 30, 32, 35, 37, 40, 42, 45, 48, 51, 54, 57, 60, 63, 66, 70, 74, 77, 81],
];
const ECL_FORMAT = { L: 1, M: 0, Q: 3, H: 2 };
const ECL_INDEX = { L: 0, M: 1, Q: 2, H: 3 };

const EXP = new Array(256);
const LOG = new Array(256);
(() => {
  let x = 1;
  for (let i = 0; i < 255; i++) {
    EXP[i] = x;
    LOG[x] = i;
    x <<= 1;
    if (x & 0x100) x ^= 0x11d;
  }
  for (let j = 255; j < 256; j++) EXP[j] = EXP[j - 255];
})();

const gmul = (a, b) => (a === 0 || b === 0 ? 0 : EXP[(LOG[a] + LOG[b]) % 255]);

function rsGenerator(degree) {
  let poly = [1];
  for (let i = 0; i < degree; i++) {
    const np = new Array(poly.length + 1).fill(0);
    for (let j = 0; j < poly.length; j++) {
      np[j] ^= gmul(poly[j], EXP[i]);
      np[j + 1] ^= poly[j];
    }
    poly = np;
  }
  return poly;
}

function rsRemainder(data, gen) {
  const res = new Array(gen.length - 1).fill(0);
  for (let i = 0; i < data.length; i++) {
    const factor = data[i] ^ res[0];
    res.shift();
    res.push(0);
    for (let j = 0; j < res.length; j++) res[j] ^= gmul(gen[j], factor);
  }
  return res;
}

function numRawDataModules(ver) {
  let result = (16 * ver + 128) * ver + 64;
  if (ver >= 2) {
    const numAlign = Math.floor(ver / 7) + 2;
    result -= (25 * numAlign - 10) * numAlign - 55;
    if (ver >= 7) result -= 36;
  }
  return result;
}

const numDataCodewords = (ver, eclIdx) =>
  Math.floor(numRawDataModules(ver) / 8) - ECC_CW[eclIdx][ver] * NUM_BLOCKS[eclIdx][ver];

function alignPositions(ver) {
  if (ver === 1) return [];
  const numAlign = Math.floor(ver / 7) + 2;
  const step = ver === 32 ? 26 : Math.ceil((ver * 4 + 4) / (numAlign * 2 - 2)) * 2;
  const result = [6];
  for (let pos = ver * 4 + 10; result.length < numAlign; pos -= step) result.splice(1, 0, pos);
  return result;
}

export function generate(text, eclName = "M") {
  const eclIdx = ECL_INDEX[eclName];
  const bytes = [];
  for (let i = 0; i < text.length; i++) {
    const c = text.charCodeAt(i);
    if (c < 128) bytes.push(c);
    else if (c < 2048) bytes.push(192 | (c >> 6), 128 | (c & 63));
    else bytes.push(224 | (c >> 12), 128 | ((c >> 6) & 63), 128 | (c & 63));
  }

  let ver = 1;
  for (; ver <= 40; ver++) {
    const cap = numDataCodewords(ver, eclIdx);
    const ccBits = ver < 10 ? 8 : 16;
    const needBits = 4 + ccBits + bytes.length * 8;
    if (needBits <= cap * 8) break;
  }
  if (ver > 40) throw new Error("Data too long");

  const dataCap = numDataCodewords(ver, eclIdx);
  const ccBits = ver < 10 ? 8 : 16;
  const bits = [];
  const put = (val, len) => {
    for (let k = len - 1; k >= 0; k--) bits.push((val >> k) & 1);
  };
  put(4, 4);
  put(bytes.length, ccBits);
  for (let b = 0; b < bytes.length; b++) put(bytes[b], 8);
  const rem = dataCap * 8 - bits.length;
  put(0, Math.min(4, rem));
  while (bits.length % 8 !== 0) bits.push(0);
  let padByte = 0xec;
  while (bits.length < dataCap * 8) {
    put(padByte, 8);
    padByte = padByte === 0xec ? 0x11 : 0xec;
  }

  const dataCw = [];
  for (let p = 0; p < bits.length; p += 8) {
    let v = 0;
    for (let q = 0; q < 8; q++) v = (v << 1) | bits[p + q];
    dataCw.push(v);
  }

  const numBlocks = NUM_BLOCKS[eclIdx][ver];
  const eccLen = ECC_CW[eclIdx][ver];
  const totalCw = Math.floor(numRawDataModules(ver) / 8);
  const numShort = numBlocks - (totalCw % numBlocks);
  const shortLen = Math.floor(totalCw / numBlocks);
  const gen = rsGenerator(eccLen);
  const blocks = [];
  let offset = 0;
  for (let bI = 0; bI < numBlocks; bI++) {
    const dlen = shortLen - eccLen + (bI < numShort ? 0 : 1);
    const dat = dataCw.slice(offset, offset + dlen);
    offset += dlen;
    blocks.push({ data: dat, ecc: rsRemainder(dat, gen) });
  }
  const result = [];
  let maxData = 0;
  blocks.forEach((bl) => {
    if (bl.data.length > maxData) maxData = bl.data.length;
  });
  for (let col = 0; col < maxData; col++)
    for (let bn = 0; bn < blocks.length; bn++)
      if (col < blocks[bn].data.length) result.push(blocks[bn].data[col]);
  for (let ec = 0; ec < eccLen; ec++)
    for (let bn2 = 0; bn2 < blocks.length; bn2++) result.push(blocks[bn2].ecc[ec]);

  const size = ver * 4 + 17;
  const modules = [];
  const isFn = [];
  for (let r = 0; r < size; r++) {
    modules.push(new Array(size).fill(false));
    isFn.push(new Array(size).fill(false));
  }
  const setFn = (x, y, dark) => {
    if (x >= 0 && x < size && y >= 0 && y < size) {
      modules[y][x] = dark;
      isFn[y][x] = true;
    }
  };

  const finder = (cx, cy) => {
    for (let dy = -4; dy <= 4; dy++)
      for (let dx = -4; dx <= 4; dx++) {
        const ax = cx + dx;
        const ay = cy + dy;
        if (ax < 0 || ax >= size || ay < 0 || ay >= size) continue;
        const d = Math.max(Math.abs(dx), Math.abs(dy));
        setFn(ax, ay, d !== 2 && d !== 4);
      }
  };
  finder(3, 3);
  finder(size - 4, 3);
  finder(3, size - 4);

  for (let t = 0; t < size; t++) {
    if (!isFn[6][t]) setFn(t, 6, t % 2 === 0);
    if (!isFn[t][6]) setFn(6, t, t % 2 === 0);
  }

  const aps = alignPositions(ver);
  for (let ai = 0; ai < aps.length; ai++)
    for (let aj = 0; aj < aps.length; aj++) {
      const ax2 = aps[ai];
      const ay2 = aps[aj];
      if (
        (ax2 === 6 && ay2 === 6) ||
        (ax2 === 6 && ay2 === size - 7) ||
        (ax2 === size - 7 && ay2 === 6)
      )
        continue;
      for (let dy2 = -2; dy2 <= 2; dy2++)
        for (let dx2 = -2; dx2 <= 2; dx2++)
          setFn(ax2 + dx2, ay2 + dy2, Math.max(Math.abs(dx2), Math.abs(dy2)) !== 1);
    }

  const reserveFormat = () => {
    for (let k = 0; k <= 5; k++) {
      isFn[8][k] = true;
      isFn[k][8] = true;
    }
    isFn[8][7] = true;
    isFn[8][8] = true;
    isFn[7][8] = true;
    for (let k2 = 0; k2 < 8; k2++) {
      isFn[8][size - 1 - k2] = true;
      isFn[size - 1 - k2][8] = true;
    }
    modules[size - 8][8] = true;
    isFn[size - 8][8] = true;
  };
  reserveFormat();
  if (ver >= 7) {
    for (let vi = 0; vi < 18; vi++) {
      const a = size - 11 + (vi % 3);
      const bb = Math.floor(vi / 3);
      isFn[a][bb] = true;
      isFn[bb][a] = true;
    }
  }

  let bitIdx = 0;
  const dataBits = [];
  for (let di = 0; di < result.length; di++)
    for (let dbit = 7; dbit >= 0; dbit--) dataBits.push((result[di] >> dbit) & 1);
  for (let rcol = size - 1; rcol >= 1; rcol -= 2) {
    if (rcol === 6) rcol = 5;
    for (let vrt = 0; vrt < size; vrt++) {
      for (let c2 = 0; c2 < 2; c2++) {
        const xx = rcol - c2;
        const upward = ((rcol + 1) & 2) === 0;
        const yy = upward ? size - 1 - vrt : vrt;
        if (!isFn[yy][xx]) {
          modules[yy][xx] = bitIdx < dataBits.length ? dataBits[bitIdx] === 1 : false;
          bitIdx++;
        }
      }
    }
  }

  const maskFn = (m, x, y) => {
    switch (m) {
      case 0: return (x + y) % 2 === 0;
      case 1: return y % 2 === 0;
      case 2: return x % 3 === 0;
      case 3: return (x + y) % 3 === 0;
      case 4: return (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0;
      case 5: return ((x * y) % 2) + ((x * y) % 3) === 0;
      case 6: return (((x * y) % 2) + ((x * y) % 3)) % 2 === 0;
      case 7: return (((x + y) % 2) + ((x * y) % 3)) % 2 === 0;
      default: return false;
    }
  };

  const drawFormat = (mask) => {
    const data = (ECL_FORMAT[eclName] << 3) | mask;
    let r2 = data;
    for (let z = 0; z < 10; z++) r2 = (r2 << 1) ^ ((r2 >> 9) * 0x537);
    const binf = ((data << 10) | r2) ^ 0x5412;
    for (let z2 = 0; z2 <= 5; z2++) modules[z2][8] = ((binf >> z2) & 1) !== 0;
    modules[7][8] = ((binf >> 6) & 1) !== 0;
    modules[8][8] = ((binf >> 7) & 1) !== 0;
    modules[8][7] = ((binf >> 8) & 1) !== 0;
    for (let z3 = 9; z3 < 15; z3++) modules[8][14 - z3] = ((binf >> z3) & 1) !== 0;
    for (let z4 = 0; z4 < 8; z4++) modules[8][size - 1 - z4] = ((binf >> z4) & 1) !== 0;
    for (let z5 = 8; z5 < 15; z5++) modules[size - 15 + z5][8] = ((binf >> z5) & 1) !== 0;
    modules[size - 8][8] = true;
  };

  if (ver >= 7) {
    let r3 = ver;
    for (let z6 = 0; z6 < 12; z6++) r3 = (r3 << 1) ^ ((r3 >> 11) * 0x1f25);
    const vinf = (ver << 12) | r3;
    for (let z7 = 0; z7 < 18; z7++) {
      const bit = ((vinf >> z7) & 1) !== 0;
      const aa = size - 11 + (z7 % 3);
      const bbb = Math.floor(z7 / 3);
      modules[aa][bbb] = bit;
      modules[bbb][aa] = bit;
    }
  }

  const penalty = () => {
    let s = 0;
    const n = size;
    for (let dir = 0; dir < 2; dir++) {
      for (let u = 0; u < n; u++) {
        let run = 1;
        let prev = null;
        for (let w = 0; w < n; w++) {
          const val = dir === 0 ? modules[u][w] : modules[w][u];
          if (val === prev) {
            run++;
            if (run === 5) s += 3;
            else if (run > 5) s++;
          } else {
            run = 1;
            prev = val;
          }
        }
      }
    }
    for (let y2 = 0; y2 < n - 1; y2++)
      for (let x2 = 0; x2 < n - 1; x2++) {
        const c = modules[y2][x2];
        if (
          c === modules[y2][x2 + 1] &&
          c === modules[y2 + 1][x2] &&
          c === modules[y2 + 1][x2 + 1]
        )
          s += 3;
      }
    let dark = 0;
    for (let y3 = 0; y3 < n; y3++) for (let x3 = 0; x3 < n; x3++) if (modules[y3][x3]) dark++;
    const total2 = n * n;
    const k3 = Math.floor(Math.abs(dark * 20 - total2 * 10) / total2);
    s += k3 * 10;
    return s;
  };

  let bestPenalty = Infinity;
  let bestMatrix = null;
  let bestMask = 0;
  for (let m = 0; m < 8; m++) {
    for (let yy2 = 0; yy2 < size; yy2++)
      for (let xx2 = 0; xx2 < size; xx2++)
        if (!isFn[yy2][xx2] && maskFn(m, xx2, yy2)) modules[yy2][xx2] = !modules[yy2][xx2];
    drawFormat(m);
    const pen = penalty();
    if (pen < bestPenalty) {
      bestPenalty = pen;
      bestMask = m;
      bestMatrix = modules.map((row) => row.slice());
    }
    for (let yy3 = 0; yy3 < size; yy3++)
      for (let xx3 = 0; xx3 < size; xx3++)
        if (!isFn[yy3][xx3] && maskFn(m, xx3, yy3)) modules[yy3][xx3] = !modules[yy3][xx3];
  }

  return { size, modules: bestMatrix, version: ver, mask: bestMask };
}
