class Node {
  constructor (val) {
    this.value = val;
    this.next = null;
    this.prev = null;
  }
}

class DoublyLinkedList {
  constructor (list = []) {
    this.head = new Node();
    this.tail = new Node();
    this.head.next = this.tail;
    this.tail.next = this.head;
    this.length = 0;

    this.loadToHead(list);
  }

  loadToTail (list) {
    this._load(list, this.tail.next);
  }

  loadToHead (list) {
    this._load(list, this.head);
  }

  _load (list, startingNode) {
    let next, prev;
    if (startingNode === this.head) [next, prev] = ['next', 'prev'];
    else [prev, next] = ['next', 'prev'];
    console.log(list.length);
    list.map(item => new Node(item))
      .reduce((prevNode, currentNode) => {
        currentNode[next] = prevNode[next];
        prevNode[next][prev] = currentNode;
        prevNode[next] = currentNode;
        ++this.length;
        return currentNode;
      }, startingNode);
  }

  unloadFromHead () {
    return this._unload(this.head);
  }

  unloadFromTail () {
    return this._unload(this.tail);
  }

  _unload (from) {
    if (this.isEmpty()) return null;
    const node = from.next;
    from.next = node.next;
    node.next.prev = from;
    --this.length;
    return node.value;
  }

  isEmpty () {
    return this.head.next === this.tail;
  }

  peekAtHead () {
    return this._peek(this.head);
  }

  peekAtTail () {
    return this._peek(this.tail);
  }

  _peek (at) {
    const next = at === this.head ? 'next' : 'prev';
    return at[next].value;
  }
}

module.exports = class Queue extends DoublyLinkedList {
  load (list) {
    this.loadToTail(list);
  }

  add (item) {
    this.loadToTail([item]);
  }

  peek () {
    return this.peekAtHead();
  }

  pop () {
    return this.unloadFromHead();
  }
};
