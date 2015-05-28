var Ant = (function(global) {
    var Ant = global.Ant || {},
        tasks = [],
        toString = Object.prototype.toString,
        slice = Array.prototype.slice,
        nativeIsArray = Array.isArray,
        isArray, isObject, isString, isFunction;
    isArray = nativeIsArray ||
    function(obj) {
        return toString.call(obj) == '[object Array]';
    };
    isObject = function(obj) {
        return obj === Object(obj);
    };
    isFunction = function(obj) {
        return toString.call(obj) == '[object Function]';
    };
    isString = function(obj) {
        return toString.call(obj) == '[object String]';
    };

    function Task(taskName, deps, taskMethod) {
        this.name = taskName;
        this.method = taskMethod;
        this.deps = deps;
        this.data = null;
    }
    Task.prototype = {
        run: function() {
            var deps = this.deps,
                task = null,
                dataArray;
            for (var i = 0, l = deps.length; i < l; i++) {
                task = Ant.findTask(deps[i]);
                //如果依赖的任务已经被注册，则执行
                if (task && typeof task.run === 'function') {
                    task.run();
                } else {
                    //throw new Error('Task ' + deps[i] + ' is not registered.');
                }
            }
            dataArray = this.getDepsData();
            dataArray.push(this);
            this.method.apply(this, dataArray);
        },
        setData: function(data) {
            this.data = data;
        },
        getDepsData: function() {
            var dataArray = [],
                deps = this.deps;
            for (var i = 0, l = deps.length; i < l; i++) {
                depTask = Ant.findTask(deps[i]);
                if (depTask) {
                    dataArray.push(depTask.data);
                } else {
                    throw new Error('Task ' + deps[i] + ' is not registered.');
                }
            }
            return dataArray;
        }
    };
    Ant.findTask = function(taskName) {
        var t = null;
        for (var i = 0, l = tasks.length; i < l; i++) {
            if (tasks[i].name === taskName) {
                t = tasks[i];
                break;
            }
        }
        return t;
    };
    Ant.register = function() {
        var name = '',
            deps = [],
            t = null,
            factory, param = slice.call(arguments);
        if (isFunction(param[2])) {
            factory = param[2];
            name = param[0];
            deps = param[1];
        } else if (isFunction(param[1])) {
            factory = param[1];
            if (isString(param[0])) {
                name = param[0];
            } else {
                deps = param[0];
            }
        } else {
            factory = param[0];
        }
        t = new Task(name, deps, factory);
        tasks.push(t);
        return t;
    };
    Ant.run = function(taskName) {
        taskName = taskName || 'default';
        var t = Ant.findTask(taskName);
        if ( !! t) {
            t.run();
        } else {
            throw new Error('Task ' + taskName + ' is not registered.');
        }
    };
    return Ant;
})(this);