Ant.js
======

Ant.js是一个解决js开发过程中多任务管理及流程控制的一个类库

# 使用




Ant.register('taskA', function() {
	this.setData('hello world');
});

Ant.register('taskB', ['taskA'], function(dataA) {
	console.log(dataA);
});

Ant.run('taskB');

