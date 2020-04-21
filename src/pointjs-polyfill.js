;(function(window){

    Object.create = Object.create || function( obj ){
        var F = function(){};
        F.prototype = obj;

        return new F();
    };

    Function.prototype.bind = Function.prototype.bind||function(){
        var self = this,
            context = [].shift.call(arguments),
            args = [].slice.call(arguments);
        return function(){
            return self.apply(context, [].concat.call(args, [].slice.call(arguments)));
        };
    };

    Function.prototype.before = function(beforeFn, stopFn){
        var _self = this;
        stopFn = stopFn||function(value){
            return value===false;
        }
        return function(){
            var ret = beforeFn.apply(this, arguments);
            if(!stopFn(ret)){
                return _self.apply(this, arguments);
            }
        };
    };

    Function.prototype.after = function(afterFn, stopFn){
        var _self = this;
        stopFn = stopFn||function(value){
            return value===false;
        };
        return function () {
            var ret = _self.apply(this, arguments);
            if(!stopFn(ret)){
                ret = afterFn.apply(this, arguments);
            }
            return ret;
        };
    }

    Function.prototype.currying = Function.prototype.currying||function(fn){
       var args = [];
        return function(){
            if(arguments.length===0){
                return fn.apply(this, args);
            }else{
                [].push.apply(args, arguments);
                return arguments.callee;
            }
        };
    };

    Function.prototype.uncurrying = Function.prototype.uncurrying||function(){
        var _self = this;
        return function(){
            var obj = Array.prototype.shift.call(arguments);
            return self.apply(obj, arguments);
        };
    };

    Array.prototype.each=Array.prototype.each||function(iterator){
        if(!iterator) return;
        var ret = true;
        for(var i=0, l=this.length; i<l;i++){
            ret = iterator(i, this[i], this);
            if(ret===false){
                break;
            }
        }
    };

    var _indexOf=function(val, cmpFn){
        cmpFn = cmpFn||function(a, b){
            return a===b;
        };

        for(var i=0, l=this.length; i<l; i++){
            if(cmpFn(this[i], val)){
                return i;
            }
        }
        return -1;
    };

    Array.prototype.indexOf = Array.prototype.indexOf||_indexOf;

    Array.prototype.remove = Array.prototype.remove||function(val, cmpFn){
        var idx = _indexOf(val, cmpFn);
        if(idx!==-1){
            this.slice(idx, 1);
        }
    };

}(window, document));