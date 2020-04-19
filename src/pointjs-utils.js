;(function (window, document) {

    var Type = window.$pointjs.Type = {};
    for (var i = 0, type; type = ['String', 'Function', 'Array', 'Number', 'Boolean', 'Object'][i++];) {
        (function (type) {
            $pointjs.fn['is'+type] = Type['is' + type] = function (obj) {
                return Object.prototype.toString.call(obj) === '[object ' + type + ']';
            };
        }(type));
    }

    $pointjs.fn.uniqueId = function(){
        // return Math.random().toString(16).slice(2)+(new Date()).getTime()+Math.random().toString(16).slice(2);
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    };


    $pointjs.fn.single = function (fn) {
        var ret;
        return function () {
            return ret || (ret = fn.apply(this, arguments));
        };
    };

    $pointjs.fn.currying = function (fn) {
        var args = [];
        return function () {
            if (arguments.length === 0) {
                return fn.apply(this, args);
            } else {
                [].push.apply(args, arguments);
                return arguments.callee;
            }
        };
    };

    $pointjs.fn.throttle = function (fn, interval) {
        var _self = fn,
            timer,
            firstTime = true;

        return function () {
            var args = arguments,
                _me = this;
            if (firstTime) {
                _self.apply(_me, args);
                return firstTime = false;
            }
            if (timer) {
                return false;
            }
            timer = setTimeout(function () {
                clearTimeout(timer);
                timer = null;
                _self.apply(_me, args);
            }, interval || 500);
        };
    };

    $pointjs.fn.timeChunk = function (ary,
                                      fn/*fn(item in ary)*/,
                                      count/*call how many times every cycle*/,
                                      interval) {
        var obj,
            t;

        var start = function () {
            for (var i = 0; i < Math.min(count || 1, ary.length); i++) {
                var obj = ary.shift();
                fn(obj);
            }
        };

        return function () {
            t = setInterval(function () {
                if (ary.length === 0) {
                    return clearInterval(t);
                }
                start();
            }, interval | 200);
        };
    };

    $pointjs.fn.sleep = function (millisecond) {
        return new Promise(function (resolve) {
            setTimeout(resolve, millisecond);
        });
    }

    $pointjs.fn.extend = (function () {
        for (var p in {toString: null}) {
            //检查当前浏览器是否支持forin循环去遍历出一个不可枚举的属性，比如toString属性，如果不能遍历不可枚举的属性(IE浏览器缺陷)，那么forin循环不会进来
            return function extend(o) {
                for (var i = 1, len = arguments.length; i < len; i++) {
                    var source = arguments[i];
                    for (prop in source) {
                        o[prop] = source[prop];
                    }
                }
                return o;
            };
        }
        //这些属性需要特殊检查一下，因为有的IE浏览器不支持for in去遍历这些属性
        var protoprops = ["toString", "valueOf", "constructor", "hasOwnProperty", "isPropertyOf", "propertyIsEnumerable", "toLocalString"];
        return function patched_extend(o) {
            for (var i = 1, len = arguments.length; i < len; i++) {
                var source = arguments[i];
                for (prop in source) {//先遍历常规的属性
                    o[prop] = source[prop];
                }
                //检查是否有特殊属性，防止漏掉
                for (var j = 0, len = protoprops.length; j < len; j++) {
                    prop = protoprops[j];
                    if (source.hasOwnProperty(prop)) {
                        o[prop] = source[prop];
                    }
                }
            }
            return o;
        }
    }());

    $pointjs.fn.makeCacheProxy = function (fn) {
        var cache = {};
        return function () {
            var args = Array.prototype.join.call(arguments, ",");
            if (args in cache) {
                return cache[args];
            }
            return cache[args] = fn.apply(this, arguments);
        };
    };

    $pointjs.fn.makeTimerProxy = function (fn, interval) {
        var cache = [],
            timer = null;

        return function () {
            var self = this;
            cache.push(arguments);
            if (timer) return;
            timer = setTimeout(function () {
                fn(cache);
                clearTimeout(timer);
                timer = null;
                cache.length = 0;
            }, interval || 2000);
        };
    };

    $pointjs.fn.each = function(obj, callback){
        var value,
            i = 0,
            isArray = $pointjs.Type.isArray( obj );
        if ( isArray ) {    // 迭代类数组
            for (var len = obj.length; i < len; i++ ) {
                value = callback.call( obj[i], i, obj[i]);
                if ( value === false ) {
                    break;
                }
            }
        } else {
            for ( i in obj ) {    // 迭代object对象
                value = callback.call( obj[i], i, obj[i] );
                if ( value === false ) {
                    break;
                }
            }
        }
        return obj;
    };

    $pointjs.fn.reverseEach = function(ary, callback){
        var value;
        for(var l = ary.length-1; l>=0; l--){
            value = callback.call(ary[l], l, ary[l]);
            if(value===false){
                break;
            }
        }
    };

    $pointjs.fn.makeMacroCommand = function(){
        return {
            commandList:[],
            add:function(cmd){
                this.commandList.push(cmd);
            },
            execute:function(){
                var self = this;
                for(var i=0, command; command = this.commandList[i++];){
                    if(Type.isFunction(command.execute)){
                        command.execute(arguments);
                    }else if(Type.isFunction(command.prototype.execute)){
                        command.prototype.execute(arguments);
                    }else if(Type.isFunction(command)){
                        command( arguments);
                    }
                }
            }
        };
    };

    $pointjs.fn.makeObjectPoolFactory = function (createObjectFn) {
        var objectPool = [];
        return {
          create:function(){
              var obj = objectPool.length===0?
                  createObjectFn.apply(this, arguments):objectPool.shift();
              return obj;
          },
          recover:function(obj){
              objectPool.push(obj);
          }
        };
    };

    var Chain = function(fn){
        this.fn = fn;
        this.successor = null;
    };
    Chain.prototype.passRequest = function(){
        var ret = this.fn.apply(this, arguments);
        if(ret!==false){
            return this.successor && this.successor.passRequest.apply(this.successor, arguments);
        }
    };
    Chain.prototype.setNextSuccessor = function(successor){
        return this.successor = successor;
    };
    Chain.prototype.next = function(){
        return this.successor && this.successor.passRequest.apply(this.successor, arguments);
    };

    $pointjs.fn.makeChain = function(fn){
        return new Chain(fn);
    };

}(window, document));