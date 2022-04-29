import { Buffer } from "buffer";

export class BBuffer extends Buffer implements BFChainUtil.Buffer {
  static from(
    arrayBuffer: ArrayBuffer | SharedArrayBuffer,
    byteOffset?: number,
    length?: number
  ): BBuffer;
  static from(data: any[] | Uint8Array): BBuffer;
  static from(str: string, encoding?: string): BBuffer;
  static from(arg1: any, arg2?: any, arg3?: any): BBuffer {
    return Buffer.from(arg1, arg2, arg3) as any;
  }

  static alloc(
    size: number,
    fill?: string | Buffer | number,
    encoding?: string
  ): BBuffer;
  static alloc(arg1: any, arg2?: any, arg3?: any): BBuffer {
    return Buffer.alloc(arg1, arg2, arg3) as any;
  }

  static allocUnsafe(size: number): BBuffer;
  static allocUnsafe(size: number): BBuffer {
    return Buffer.allocUnsafe(size) as any;
  }

  static allocUnsafeSlow(size: number): BBuffer;
  static allocUnsafeSlow(size: number): BBuffer {
    return Buffer.allocUnsafeSlow(size) as any;
  }
}
// const b =  Buffer.from('1');
// b.update
