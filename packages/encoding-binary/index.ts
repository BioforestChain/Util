const BINARY_DECODE_CACHE = new WeakMap<
  Uint8Array | Uint16Array | Int8Array | Int16Array,
  string
>();
const EMPTY_UINT8_ARRAY = new Uint8Array();

export function decodeBinaryToLatin1(binary: Uint8Array | Uint16Array | Int8Array | Int16Array) {
  if (!binary) {
    return "";
  }
  let res = BINARY_DECODE_CACHE.get(binary);
  if (typeof res === "string") {
    return res;
  }
  res = String.fromCharCode(...binary);
  BINARY_DECODE_CACHE.set(binary, res);
  return res;
}
export const getBinaryFromArrayBuffer = decodeBinaryToLatin1;
export function encodeLatin1ToBinary(value?: string) {
  if (!value) {
    return EMPTY_UINT8_ARRAY;
  }
  const binary = new Uint8Array(value.length);
  for (let i = 0; i < binary.length; i += 1) {
    binary[i] = value.charCodeAt(i) & 0xff;
  }
  BINARY_DECODE_CACHE.set(binary, value);
  return binary;
}
export const parseBinaryToArrayBuffer = encodeLatin1ToBinary;

// const a = Buffer.from("123bnmdasf中文汉字🥧");
// console.log(a.toString("binary"), a.toString("binary") === getBinaryFromArrayBuffer(a));
// console.log(a.toString("binary") === getBinaryFromArrayBuffer(parseBinaryToArrayBuffer(getBinaryFromArrayBuffer(a))));
