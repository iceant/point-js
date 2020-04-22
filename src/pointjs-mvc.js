;(function(window, document){

    var V = {
        extend:function(options){
            function makeEvent(id){
                return $pointjs.Event.create(id);
            }

            function makeVid(){
                return $pointjs.uid();
            }

            var View = function(el){
                this.vid = makeVid();
                this.$event = makeEvent(this.vid);
                this.$el = el||document;
            };

            View.prototype.one = function(key, fn, last){
                this.$event.one(key, fn, last);
            }

            View.prototype.off = function(key, fn){
                this.$event.remove(key, fn);
            }

            View.prototype.on = function(key, fn, last){
                this.$event.listen(key, fn, last);
            }

            View.prototype.trigger = function () {
                this.$event.trigger.apply(this.$event, arguments);
            }

            View.prototype.$ = function(selector){
                return this.$el.$(selector);
            }

            View.prototype.extend = function(){
                return $pointjs.extend.apply(this, arguments);
            }

            View.prototype.escapeHtml = function escapeHTML(unsafeText) {
                var div = document.createElement('div');
                div.innerText = unsafeText;
                var html = div.innerHTML;
                div = null;
                return html;
            }

            View = $pointjs.extend(View, options);

            return View;
        }
    };

    window.$V = $pointjs.fn.$V = V;

}(window, document))