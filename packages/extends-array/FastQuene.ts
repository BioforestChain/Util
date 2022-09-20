/**快速队列
 * 提供更简单更快的push
 * 以及更快的shift：保证不会生成多余的array副本
 */
export class FastQuene<T> {
  private _size = 0;
  private _arr: Array<T | undefined> = [];
  private _firstCursor = 0;
  push(item: T) {
    this._arr[this._arr.length] = item;
    this._updateSize();
    return item;
  }
  shift() {
    const { _firstCursor, _arr } = this;
    if (_firstCursor < _arr.length) {
      const res = _arr[_firstCursor];
      _arr[_firstCursor] = undefined;
      ++this._firstCursor;
      this._updateSize();
      return res;
    }
  }
  remove(item: T) {
    const { _firstCursor, _arr } = this;
    const index = _arr.indexOf(item);
    if (index === -1) {
      return false;
    }
    /// 如果左边的比右边的多，那么右边的往左边挪动
    if (index - _firstCursor > _arr.length - 1 - index) {
      const endLen = _arr.length - 1;
      for (let i = index; i < endLen; ++i) {
        _arr[i] = _arr[i + 1];
      }
      _arr.length = endLen;
    }
    /// 否则左边的往右边挪动
    else {
      const startIndex = _firstCursor + 1;
      for (let i = index; i >= startIndex; --i) {
        _arr[i] = _arr[i - 1];
      }
      _arr[_firstCursor] = undefined;
      ++this._firstCursor;
    }
    this._updateSize();
    return true;
  }
  private _updateSize() {
    this._size = this._arr.length - this._firstCursor;
  }
  get size() {
    return this._size;
  }
}
