;(function (window, document) {

    $pointjs.fn.makeSingle = function (fn) {
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

    $pointjs.fn.timeChunk = function (ary, fn/*fn(item in ary)*/, count/*call how many times every cycle*/, interval) {
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
        var Type = $pointjs.fn.Type;
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
    }
    Chain.prototype.passRequest = function(){
        var ret = this.fn.apply(this, arguments);
        if(ret!==false){
            return this.successor && this.successor.passRequest.apply(this.successor, arguments);
        }
    };
    Chain.prototype.setNextSuccessor = function(successor){
        return this.successor = successor;
    }
    Chain.prototype.next = function(){
        return this.successor && this.successor.passRequest.apply(this.successor, arguments);
    };

    $pointjs.fn.makeChain = function(fn){
        return new Chain(fn);
    };



}(window, document));