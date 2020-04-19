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

    Function.prototype.before = function(beforeFn){
        var _self = this;
        return function(){
            var ret = beforeFn.apply(this, arguments);
            if(ret!==false){
                return _self.apply(this, arguments);
            }
        };
    };

    Function.prototype.after = function(afterFn){
        var _self = this;
        return function () {
            var ret = _self.apply(this, arguments);
            var args = [].concat(ret, arguments);
            afterFn.apply(this, args);
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

}(window, document));