;(function(window, document, $){
    window.assert=window.assert||function(){
        var _shift = [].shift;
        var _slice = [].slice;

        var condition = _shift.call(arguments);
        var message = _shift.call(arguments);
        var args = _slice.call(arguments);

        if(!condition){
            console.log(message?message:JSON.stringify(condition));
        }
    };

}(window, document));