export namespace $Lock {
  /**通用的锁的类型 */
  export type AtomLockKey = string | number | symbol;
  /**可在进程/线程之间传输的锁的类型 */
  export type TransferableAtomLockKey = string | number;
}
