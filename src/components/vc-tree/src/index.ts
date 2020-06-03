import ProxyTree, { Tree } from './tree';
import TreeNode from './tree-node';
Tree.TreeNode = TreeNode;
ProxyTree.TreeNode = TreeNode;

export { Tree, TreeNode };
export default ProxyTree;
