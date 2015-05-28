function Tree(root) {
	this.root = null;
	this.nodes = [];

	if (typeof root === 'object') {
		this.root = root;
		this.nodes.push(root);
	}
}

/*
* 往树中添加一个节点，如果没有指定父节点，则此节点为根节点
*/
Tree.prototype.addNode = function(node, parent) {
	
	var childs = null,
		tempChilds = [],
		parentInTree = null,
		nodeInTree = this.findNode(node.nodeName);
	
	if (parent && typeof parent === 'object') {
		//检查父节点是否已经在树中
		parentInTree = this.findNode(parent.nodeName);

		if (!parentInTree) {
			throw new Error('Node ' + parent.nodeName + ' must be add into Tree before Node ' + node.nodeName);
		} else {
			if (nodeInTree) { //当前节点node存在于树中，则移动节点即可
				childs = nodeInTree.parent.childs;
				for (var i = 0; i < childs.length; i++) {
					if (childs[i].nodeName !== node.nodeName) {
						tempChilds.push(childs[i]); 
					}
				}
				nodeInTree.parent.childs = tempChilds; //删除原父节点的父子关系
				nodeInTree.parent = parent; //找到新的父节点

			} else {
				//为节点node建立父子关系
				node.parent = parent;

				if (parent.childs && typeof parent.childs.push === 'function') {
					/* 这个地方需要检查当前节点是否已经存在于树中
					* 如果存在，要删除之前的父子关系，即移动节点
					*/
					parent.childs.push(node);
				} else {
					parent.childs = [];
					parent.childs.push(node);
				}

				this.nodes.push(node); //将节点添加到树中
			}
		}
	} else { //没有指定父节点，直接添加为根节点
		if (this.isLeaf(node)) { //如果是叶子节点，可以移动为根节点
			this.root = node;
		} else if (nodeInTree) { //如果不是叶子节点，不能移动为根节点
			throw new Error('Node ' + nodeInTree.nodeName + ' can not move to as the ROOT Node.');
		} else {
			this.root = node;
			this.nodes.push(node); //将节点添加到树中
		}
	}
};

Tree.prototype.findNode = function(nodeName) {
	var nodes = this.nodes, node = null;
	for (var i = 0; i < nodes.length; i++) {
		if(nodes[i].nodeName === nodeName) {
			node = nodes[i];
			break;
		}
	}
	return node;
};

Tree.prototype.isLeaf = function(node) {
	var nodeInTree = this.findNode(node.nodeName);
	if (nodeInTree && !(nodeInTree.childs && nodeInTree.childs.length > 0)) {
		return true;
	}
	return false;
};

/*
* 传说中的深度优先遍历
*/
Tree.prototype.iterator = function(callback, start) {
	var childs = null, node = start || this.root;

	if (node) { //如果不是空树
		callback(node);

		if(node.childs && node.childs.length > 0) {
			childs = node.childs;
			for (var i = 0; i < childs.length; i++) {
				arguments.callee.call(this, callback, childs[i]);
			}
		}
	}
};