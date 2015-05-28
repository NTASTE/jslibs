Ant.register('taskA', function() {
	console.log('\r\ntaskA is running....');
	this.setData('hello world'); //这个方法在setTimeout里调用，无法即时返回数据
});

Ant.register('taskC', function() {
	console.log('\r\ntaskC is running....');
	this.setData('I am Ant.js');
});

Ant.register('taskB', ['taskA', 'taskC'], function() {
	this.getData('taskA');
	this.getData('taskB');
	
	console.log('\r\ntaskB is running....');
	console.log('taskB output:' + dataA + ', ' + dataC);
});

Ant.run('taskB');