declare namespace BFChainUtil {
  namespace Lock {
    /**通用的锁的类型 */
    type AtomLockKey = string | number | symbol;
    /**可在进程/线程之间传输的锁的类型 */
    type TransferableAtomLockKey = string | number;
  }
}
