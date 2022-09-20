export class BlizzardHash {
  static InitCryptTable() {
    const cryptTable: number[] = new Array(0x500);
    let seed = 0x00100001;
    let index1 = 0;
    let index2 = 0;
    let i: number;
    let temp1: number;
    let temp2: number;
    for (index1 = 0; index1 < 0x100; index1++) {
      for (index2 = index1, i = 0; i < 5; i++, index2 += 0x100) {
        seed = (seed * 125 + 3) % 0x2aaaab;
        temp1 = (seed & 0xffff) << 0x10;
        seed = (seed * 125 + 3) % 0x2aaaab;
        temp2 = seed & 0xffff;
        cryptTable[index2] = temp1 | temp2;
      }
    }
    return cryptTable;
  }
  static cryptTable = Object.freeze(BlizzardHash.InitCryptTable());
  static cryptTable_length = BlizzardHash.cryptTable.length;

  static hashString(lpszString: string, dwHashType: number) {
    const { cryptTable, cryptTable_length } = BlizzardHash;
    let seed1 = 0x7fed7fed;
    let seed2 = 0xeeeeeeee;
    let ch: number;
    for (let i = 0; i < lpszString.length; i += 1) {
      ch = ((dwHashType << 8) + lpszString.charCodeAt(i)) % cryptTable_length;
      seed1 = cryptTable[ch] ^ (seed1 + seed2);
      seed2 = ch + seed1 + seed2 + (seed2 << 5) + 3;
    }
    return seed1;
  }

  static hashRange = Object.freeze({
    min: -2147483648,
    max: 2147483647,
    dis: Math.pow(2, 32),
  });
  static inRangePosition(v: number) {
    const { hashRange } = BlizzardHash;
    return ((v - hashRange.min) / hashRange.dis) % 1;
  }

  static hashToRandom(
    lpszString: string,
    dwHashType: number,
    min = 0,
    max = 1,
    parseToInt?: boolean,
  ) {
    const num_hash = BlizzardHash.hashString(lpszString, dwHashType);
    const num_rate = (num_hash - BlizzardHash.hashRange.min) / BlizzardHash.hashRange.dis;
    const num_random = num_rate * (max - min) + min;
    if (parseToInt) {
      return Math.floor(num_random);
    } else {
      return num_random;
    }
  }
}
