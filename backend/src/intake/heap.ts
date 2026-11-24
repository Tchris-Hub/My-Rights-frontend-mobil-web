// Small binary max-heap. The interview engine uses it to pick the next question:
// push every askable field with its priority, pop the best one. O(n log n) to
// drain, O(1) to peek, and no sorting of the whole list on every answer.

export class MaxHeap<T> {
  private items: Array<{ priority: number; order: number; value: T }> = [];
  private counter = 0;

  get size(): number {
    return this.items.length;
  }

  push(value: T, priority: number): void {
    // `order` breaks ties by insertion order so results are deterministic.
    this.items.push({ priority, order: this.counter++, value });
    this.siftUp(this.items.length - 1);
  }

  peek(): T | undefined {
    return this.items[0]?.value;
  }

  pop(): T | undefined {
    if (this.items.length === 0) return undefined;
    const top = this.items[0];
    const last = this.items.pop()!;
    if (this.items.length > 0) {
      this.items[0] = last;
      this.siftDown(0);
    }
    return top.value;
  }

  private before(a: number, b: number): boolean {
    const x = this.items[a];
    const y = this.items[b];
    if (x.priority !== y.priority) return x.priority > y.priority;
    return x.order < y.order;
  }

  private swap(a: number, b: number): void {
    [this.items[a], this.items[b]] = [this.items[b], this.items[a]];
  }

  private siftUp(i: number): void {
    while (i > 0) {
      const parent = (i - 1) >> 1;
      if (!this.before(i, parent)) break;
      this.swap(i, parent);
      i = parent;
    }
  }

  private siftDown(i: number): void {
    const n = this.items.length;
    for (;;) {
      const l = 2 * i + 1;
      const r = l + 1;
      let best = i;
      if (l < n && this.before(l, best)) best = l;
      if (r < n && this.before(r, best)) best = r;
      if (best === i) break;
      this.swap(i, best);
      i = best;
    }
  }
}
