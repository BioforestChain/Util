const HEX_DECODE_CACHE = new WeakMap<Uint8Array, string>();

const EMPTY_UINT8_ARRAY = new Uint8Array();

const BINARY_HEX_CACHE: string[] = [];
const HEX_BINARY_CACHE: { [hex: string]: number } = Object.create({});
for (let byte = 0; byte < 256; byte++) {
  const hex = byte.toString(16).padStart(2, "0");
  BINARY_HEX_CACHE[byte] = hex;
  HEX_BINARY_CACHE[hex] = byte;
  HEX_BINARY_CACHE[hex.toUpperCase()] = byte;
}
const BINARY_HEX16_CACHE: string[] = [];
{
  const u16 = new Uint16Array(1);
  const u8 = new Uint8Array(u16.buffer);
  for (const leftHex of BINARY_HEX_CACHE) {
    for (const rightHex of BINARY_HEX_CACHE) {
      // const byte = (HEX_BINARY_CACHE[rightHex] << 8) + HEX_BINARY_CACHE[leftHex];
      u8[0] = HEX_BINARY_CACHE[leftHex];
      u8[1] = HEX_BINARY_CACHE[rightHex];
      BINARY_HEX16_CACHE[u16[0]] = leftHex + rightHex;
    }
  }
}

const encode_hex_u8 = new Uint8Array(40);
const encode_hex_u16 = new Uint16Array(encode_hex_u8.buffer);
/**解码ArrayBuffer成hex字符串 */
export function encodeHex(binary: Uint8Array) {
  const totalU16Len = binary.length >> 1;
  let res = "";
  if (encode_hex_u8.length >= binary.length) {
    encode_hex_u8.set(binary, 0);
    for (let i = 0; i < totalU16Len; i++) {
      res += BINARY_HEX16_CACHE[encode_hex_u16[i]];
    }
  } else {
    let pos = 0;
    do {
      const maxU8Len = Math.min(encode_hex_u8.length, binary.length - pos);
      for (let i = 0; i < maxU8Len; ++i) {
        encode_hex_u8[i] = binary[i + pos];
      }

      const u16Len = maxU8Len >> 1;
      for (let i = 0; i < u16Len; i++) {
        res += BINARY_HEX16_CACHE[encode_hex_u16[i]];
      }
      pos += maxU8Len;
    } while (pos < binary.length);
  }
  if (totalU16Len << 1 !== binary.length) {
    res += BINARY_HEX_CACHE[binary[binary.length - 1]];
  }
  return res;
}

/**编码hex字符串写成ArrayBuffer */
export function decodeHex(value: string) {
  const binary = new Uint8Array(value.length >> 1);
  let i = 0,
    j = 0;
  while (j < binary.length) {
    let height = value.charCodeAt(i++);
    if (height <= 57) {
      height = (height - 48) << 4; // 0~9
    } else if (height <= 70) {
      height = (height - 55) << 4; // A~F
    } else if (height <= 102) {
      height = (height - 87) << 4; // a~f
    }
    let low = value.charCodeAt(i++);
    if (low <= 57) {
      low -= 48; // 0~9
    } else if (low <= 70) {
      low -= 55; // A~F
    } else if (low <= 102) {
      low -= 87; // a~f
    }

    binary[j++] = height + low;
  }
  return binary;
}

/**解码ArrayBuffer成hex字符串 */
export function decodeBinaryToHex(binary?: Uint8Array) {
  if (!binary) {
    return "";
  }
  let res: string | undefined;
  if (binary.length === binary.byteLength) {
    res = HEX_DECODE_CACHE.get(binary);
    if (typeof res === "string") {
      return res;
    }
  }
  res = encodeHex(binary);
  HEX_DECODE_CACHE.set(binary, res);
  return res;
}

/**解码ArrayBuffer成hex字符串 */
export const getHexFromArrayBuffer = decodeBinaryToHex;

/**编码hex字符串写成ArrayBuffer */
export function encodeHexToBinary(value?: string) {
  if (!value) {
    return EMPTY_UINT8_ARRAY;
  }
  const binary = decodeHex(value);
  HEX_DECODE_CACHE.set(binary, value);
  return binary;
}
/**编码hex字符串写成ArrayBuffer */
export const parseHexToArrayBuffer = encodeHexToBinary;
