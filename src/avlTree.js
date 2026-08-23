/**
 * datastructures-js/binary-search-tree
 * @copyright 2020 Eyas Ranjous <eyas.ranjous@gmail.com>
 * @license MIT
 */

const { BinarySearchTree } = require('./binarySearchTree');
const { AvlTreeNode } = require('./avlTreeNode');

/**
 * @class AvlTree
 * @extends BinarySearchTree
 */
class AvlTree extends BinarySearchTree {
  constructor(compare, options) {
    if (compare && typeof compare !== 'function') {
      throw new Error('AvlTree constructor expects a compare function');
    }

    super(compare, options);
  }

  /**
   * Get the node's height
   * @private
   * @param {AvlTreeNode} node
   * @return {number}
   */
  _getNodeHeight(node) {
    if (!(node instanceof AvlTreeNode)) return 0;
    return node.getHeight();
  }

  /**
   * Applies the proper rotation on a node
   * @private
   * @param {AvlTreeNode} node
   */
  _balanceNode(node) {
    if (!node) return;

    node.updateHeight();
    const balance = node.getBalance();
    if (balance > 1) {
      const leftLeft = node.getLeft().getLeft();
      const leftRight = node.getLeft().getRight();
      if (this._getNodeHeight(leftLeft) >= this._getNodeHeight(leftRight)) {
        node.rotateRight();
      } else if (node.getLeft().hasRight()) {
        node.rotateLeftRight();
      }
    } else if (balance < -1) {
      const rightRight = node.getRight().getRight();
      const rightLeft = node.getRight().getLeft();
      if (this._getNodeHeight(rightRight) >= this._getNodeHeight(rightLeft)) {
        node.rotateLeft();
      } else if (node.getRight().hasLeft()) {
        node.rotateRightLeft();
      }
    }

    // check if root was rotated
    if ((balance < -1 || balance > 1) && node === this._root) {
      // replace root when rotated with the child (now parent of root)
      this._root = node.getParent();
    }
  }

  /**
   * Inserts a value into the tree and maintains
   * the tree balanced by making the necessary rotations
   *
   * @public
   * @param {number|string|object} value
   * @return {AvlTree}
   */
  insert(value) {
    const newNode = new AvlTreeNode(value, this._compare);
    if (this._root === null) {
      this._root = newNode;
      this._count += 1;
    } else {
      let current = this._root;
      let inserted = false;
      /** @type {AvlTreeNode<any>[]} */
      const visited = [];
      while (true) {
        const compare = this._compare(value, current.getValue());
        if (compare === 0) {
          current.setValue(value);
          break;
        }

        visited.push(current);
        if (compare < 0) {
          if (current.hasLeft()) {
            current = current.getLeft();
          } else {
            current.setLeft(newNode.setParent(current)).updateHeight();
            this._count += 1;
            inserted = true;
            break;
          }
        } else {
          // for symmetry
          // eslint-disable-next-line no-lonely-if
          if (current.hasRight()) {
            current = current.getRight();
          } else {
            current.setRight(newNode.setParent(current)).updateHeight();
            this._count += 1;
            inserted = true;
            break;
          }
        }
      }
      if (inserted) {
        for (let i = visited.length - 1; i >= 0; i -= 1) {
          this._balanceNode(visited[i]);
        }
      }
    }

    return this;
  }

  /**
   * Removes a node from the tree and maintains
   * the tree balanced by making the necessary rotations
   *
   * @public
   * @param {number|string|object} value
   * @return {boolean}
   */
  remove(value) {
    let current = this._root;
    let found = false;
    /** @type {AvlTreeNode<any>[]} */
    const visited = [];
    while (current !== null) {
      const compare = this._compare(value, current.getValue());
      if (compare === 0) {
        found = true;
        this.removeNode(current);
        break;
      }
      visited.push(current);
      if (compare < 0) {
        current = current.getLeft();
      } else {
        current = current.getRight();
      }
    }

    if (found) {
      // rebalance
      for (let i = visited.length - 1; i >= 0; i -= 1) {
        this._balanceNode(visited[i]);
      }
    }
    return found;
  }

  /**
   * Removes a node from the tree
   * @public
   * @param {AvlTreeNode} node
   * @return {boolean}
   */
  removeNode(node) {
    if (node === null || !(node instanceof AvlTreeNode)) {
      return false;
    }

    // case 1: node has no children
    if (node.isLeaf()) {
      if (node.isRoot()) {
        this._root = null;
      } else if (this._compare(node.getValue(), node.getParent().getValue()) < 0) {
        node.getParent().setLeft(null).updateHeight();
      } else {
        node.getParent().setRight(null).updateHeight();
      }
      this._count -= 1;
      return true;
    }

    // case 2: node has a left child and no right child
    if (!node.hasRight()) {
      if (node.isRoot()) {
        this._root = node.getLeft();
      } else if (this._compare(node.getValue(), node.getParent().getValue()) < 0) {
        node.getParent().setLeft(node.getLeft()).updateHeight();
      } else {
        node.getParent().setRight(node.getLeft()).updateHeight();
      }
      node.getLeft().setParent(node.getParent());
      this._count -= 1;
      return true;
    }

    // case 3: node has a right child and no left child
    if (!node.hasLeft()) {
      if (node.isRoot()) {
        this._root = node.getRight();
      } else if (this._compare(node.getValue(), node.getParent().getValue()) < 0) {
        node.getParent().setLeft(node.getRight()).updateHeight();
      } else {
        node.getParent().setRight(node.getRight()).updateHeight();
      }
      node.getRight().setParent(node.getParent());
      this._count -= 1;
      return true;
    }

    // case 4: node has left and right children
    const minRight = this.min(node.getRight());
    const removed = this.removeNode(minRight);
    node.setValue(minRight.getValue());
    this._balanceNode(node);
    return removed;
  }
}

exports.AvlTree = AvlTree;
