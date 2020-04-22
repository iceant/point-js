;(function (window, document) {
    var pointjs = function () {
    };
    pointjs.prototype.fn = pointjs.prototype;

    function _isObjTypeFn(obj, type) {
        return Object.prototype.toString.call(obj) === '[object ' + type + ']';
    }

    function $$(selector, context) {
        context = context || document;
        var elements = context.querySelectorAll(selector);
        return Array.prototype.slice.call(elements);
    }

    function uniqueId(len) {
        len = len || 9;
        return "_" + (Number(String(Math.random()).slice(2)) +
            Date.now() +
            Math.round(performance.now())).toString(36).substr(2, len);
    }

    function _isNotNull(val) {
        return (val !== null && val !== undefined);
    }

    var Type = pointjs.prototype.Type = {};
    for (var i = 0, type; (type = ['String', 'Function', 'Array', 'Number', 'Boolean', 'Object'][i++]);) {
        (function (type) {
            pointjs.prototype['is' + type] = Type['is' + type] = function (obj) {
                return _isObjTypeFn(obj, type)
            };
        }(type));
    }

    pointjs.prototype.isObjType=_isObjTypeFn;

    pointjs.prototype.uid = uniqueId;

    pointjs.prototype.each = function (obj, callback) {
        var value,
            isArray = $pointjs.Type.isArray(obj);
        if (isArray) {    // 迭代类数组
            for (var i = 0, len = obj.length; i < len; i++) {
                value = callback.call(obj[i], i, obj[i]);
                if (value === false) {
                    break;
                }
            }
        } else {
            for (var prop in obj) {
                if(Object.prototype.hasOwnProperty.call(obj, prop)){
                    value = callback.call(obj[prop], prop, obj[prop]);
                    if (value === false) {
                        break;
                    }
                }
            }
        }
        return obj;
    };

    pointjs.prototype.extend = function(){
        var length = arguments.length;
        var target = arguments[0];
        if(Type.isObject(target)){
            for (var i = 1; i < length; i++) {
                var source = arguments[i];
                for (var key in source) {
                    // 使用for in会遍历数组所有的可枚举属性，包括原型。
                    if (Object.prototype.hasOwnProperty.call(source, key)) {
                        target[key] = source[key];
                    }
                }
            }
        }else if(Type.isFunction(target)){
            for (var i = 1; i < length; i++) {
                var source = arguments[i];
                for (var key in source) {
                    // 使用for in会遍历数组所有的可枚举属性，包括原型。
                    if (Object.prototype.hasOwnProperty.call(source, key)) {
                        target.prototype[key] = source[key];
                    }
                }
            }
        }
        return target;
    };

    var DomElement = function (el) {
        this.$el = el;
    };

    function _find(selector, context) {
        var ary = $$(selector, context);
        if (ary.length === 0) {
            return new DomElement(null);
        } else if (ary.length === 1) {
            return new DomElement(ary[0]);
        } else {
            var result = [];
            for (var i = 0; i < ary.length; i++) {
                result.push(new DomElement(ary[i]));
            }
            ary = null;
            return result;
        }
    }

    pointjs.prototype.$ = _find;

    var EventUtil = {
        on: function (element, type, handler, useCapture) {/* 添加事件 */
            if (element.addEventListener) {
                element.addEventListener(type, handler, useCapture || false);
            } else if (element.attachEvent) {//IE  注意：此时事件处理程序会在全局作用域中运行，因此用attachEvent绑定的事件，此时在事件处理函数里的this 等于window，使用时要注意
                element.attachEvent("on" + type, handler);
            } else {
                element["on" + type] = handler;
            }
        },

        off: function (element, type, handler, useCapture) {/* 移除事件 */
            if (element.removeEventListener) {
                element.removeEventListener(type, handler, useCapture || false);
            } else if (element.detachEvent) {
                element.detachEvent("on" + type, handler);
            } else {
                element["on" + type] = null;
            }
        },

        getEvent: function (event) {/* 返回对event对象的引用 */
            return event ? event : window.event;
        },

        getTarget: function (event) {/* 返回事件的目标 */
            return event.target || event.srcElement;
        },

        preventDefault: function (event) { /* 取消事件的默认行为 */
            if (event.preventDefault) {
                event.preventDefault();
            } else {
                event.returnValue = false;
            }
        },

        stopPropagation: function (event) {/* 阻止事件冒泡 */
            if (event.stopPropagation) {
                event.stopPropagation();
            } else {
                event.cancelBubble = true;
            }
        },

        /* mouseover 和mouserout 这两个事件都会涉及把鼠标指针从一个元素的边界之内移动到另一个元素的边界之内。*/
        getRelatedTarget: function (event) {
            if (event.relatedTarget) {
                return event.relatedTarget;
            } else if (event.toElement) {//IE8 mouserout事件
                return event.toElement;
            } else if (event.fromElement) {//IE8 mouseover事件
                return event.fromElement;
            } else {
                return null;//其他事件
            }
        }
    };
    //-------------------------------------------------------------------------
    // DomElement.prototype

    DomElement.prototype.$ = function (selector) {
        return _find(selector, this.$el);
    }

    DomElement.prototype.html = function (html) {
        if (this.$el === null) {
            return null;
        }
        if (_isNotNull(html)) {
            this.$el.innerHTML = html;
            return this;
        } else {
            return this.$el.innerHTML;
        }
    }

    DomElement.prototype.attr = function (key, value) {
        if (this.$el === null) {
            return null;
        }
        if (_isNotNull(value)) {
            this.$el.setAttribute(key, value);
            return this;
        } else if (value === null) {
            this.$el.removeAttribute(key);
        } else {
            return this.$el.getAttribute(key);
        }
    }

    DomElement.prototype.attrNames = function () {
        if (this.$el === null) {
            return null;
        }
        return this.$el.getAttributeNames();
    }

    DomElement.prototype.hasAttribute = function (name) {
        if (this.$el === null) {
            return false;
        }
        return this.$el.hasAttribute(name);
    }

    DomElement.prototype.hasAttributes = function () {
        if (this.$el === null) {
            return false;
        }
        return this.$el.hasAttributes(arguments);
    }

    DomElement.prototype.getAttribute = function (name) {
        if (this.$el === null) {
            return null;
        }
        return this.$el.getAttribute(name);
    }

    DomElement.prototype.removeAttribute = function (name) {
        if (this.$el === null) return;
        this.$el.removeAttribute(name);
    }

    DomElement.prototype.val = function (val) {
        if (this.$el === null) {
            return null;
        }
        if (_isNotNull(val)) {
            this.$el.setAttribute('value', val);
        } else {
            return this.$el.getAttribute('value');
        }
    }

    DomElement.prototype.text = function (val) {
        if (this.$el === null) {
            return null;
        }
        if (_isNotNull(val)) {
            this.$el.innerText = val;
        } else {
            return this.$el.innerText;
        }
    }

    DomElement.prototype.on = function (type, handler) {
        if (this.$el === null) {
            return null;
        }
        EventUtil.on(this.$el, type, handler);
    }

    DomElement.prototype.off = function (type, handler) {
        if (this.$el === null) return null;
        EventUtil.off(this.$el, type, handler);
    }

    DomElement.prototype.parent = function () {
        if (this.$el === null) {
            return null;
        }
        return new DomElement(this.$el.parentNode);
    }

    DomElement.prototype.hasChildNodes = function () {
        if (this.$el === null) {
            return false;
        }
        return this.$el.hasChildNodes();
    }

    DomElement.prototype.childNodes = function () {
        if (this.$el === null) {
            return [];
        }
        var result = [];
        var childNodes = this.$el.childNodes();
        for (var i = 0; i < childNodes.length; i++) {
            result.push(new DomElement(childNodes[i]));
        }
        return result;
    }

    DomElement.prototype.children = function () {
        if (this.$el === null) {
            return [];
        }
        var result = [];
        var children = this.$el.children();
        for (var i = 0; i < children.length; i++) {
            result.push(new DomElement(children[i]));
        }
        return result;
    }

    DomElement.prototype.addClass = function () {
        if (this.$el === null) return null;
        var $el = this.$el;
        for (var i = 0; i < arguments.length; i++) {
            $el.classList.add(arguments[i]);
        }
    }

    DomElement.prototype.hasClass = function (className) {
        if (this.$el === null) return false;
        return this.$el.classList.contains(className);
    }

    DomElement.prototype.removeClass = function () {
        if (this.$el === null) return null;
        var $el = this.$el;
        for (var i = 0; i < arguments.length; i++) {
            $el.classList.remove(arguments[i]);
        }
    }

    DomElement.prototype.toggleClass = function (className, flag) {
        if (this.$el === null) return null;
        if (_isNotNull(flag)) {
            this.$el.classList.toggle(className, flag);
        } else {
            this.$el.classList.toggle(className);
        }
    }

    DomElement.prototype.width = function (val) {
        if (this.$el === null) return null;
        if (_isNotNull(val)) {
            this.attr('width', val);
        } else {
            return this.$el.clientWidth;
        }
    }

    DomElement.prototype.height = function (val) {
        if (this.$el === null) return null;
        if (_isNotNull(val)) {
            this.attr('height', val);
        } else {
            return this.$el.clientHeight;
        }
    }

    DomElement.prototype.focus = function () {
        if (this.$el === null) return null;
        this.$el.focus();
    }

    DomElement.prototype.hasFocus = function () {
        if (this.$el === null) return false;
        return this.$el.hasFocus();
    }

    DomElement.prototype.id = function (val) {
        if (this.$el === null) return null;
        if (_isNotNull(val)) {
            this.$el.id = val;
        } else {
            return this.$el.id;
        }
    }

    DomElement.prototype.isContentEditable = function () {
        if (this.$el === null) return false;
        return this.$el.isContentEditable;
    }

    DomElement.prototype.lang = function (val) {
        if (this.$el === null) return null;
        if (_isNotNull(val)) {
            this.$el.lang = val;
        } else {
            return this.$el.lang;
        }
    }

    DomElement.prototype.nextSibling = function () {
        if (this.$el === null) return null;
        return new DomElement(this.$el.nextSibling);
    }

    DomElement.prototype.nodeName = function () {
        if (this.$el === null) return null;
        return this.$el.nodeName;
    }

    DomElement.prototype.offsetHeight = function () {
        if (this.$el === null) return 0;
        return this.$el.offsetHeight;
    }

    DomElement.prototype.offsetWidth = function () {
        if (this.$el === null) return 0;
        return this.$el.offsetWidth;
    }

    DomElement.prototype.offsetLeft = function () {
        if (this.$el === null) return 0;
        return this.$el.offsetLeft;
    }
    DomElement.prototype.offsetParent = function () {
        if (this.$el === null) return 0;
        return this.$el.offsetParent;
    }
    DomElement.prototype.offsetTop = function () {
        if (this.$el === null) return 0;
        return this.$el.offsetTop;
    }

    DomElement.prototype.previousSibling = function () {
        if (this.$el === null) return null;
        return this.$el.previousSibling;
    }

    DomElement.prototype.style = function (json) {
        if (!_isNotNull(json)) return;
        if (this.$el === null) return;
        for (prop in json) {
            if (json.hasOwnProperty(prop)) {
                this.$el.style[prop] = json[prop];
            }
        }
    }

    DomElement.prototype.title = function (val) {
        if (this.$el === null) return null;
        if (_isNotNull(val)) {
            this.$el.title = val;
        } else {
            return this.$el.title;
        }
    }

    function makeXHR() {
        if (window.XMLHttpRequest) {
            return new XMLHttpRequest();
        }
        try {
            return new ActiveXObject('MSXML2.XMLHTTP.6.0');
        } catch (e) {
            try {
                return new ActiveXObject("MSXML2.XMLHTTP.3.0");
            } catch (e) {
                console.log('ERROR: This browser is not AJAX enabled.');
                return null;
            }
        }
    }

    var parseXHR = function (xhr) {
        try {
            xhr.responseJSON = JSON.parse(xhr.responseText);
        } catch (e) {
        }
        return xhr;
    }

    pointjs.prototype.ajaxSend = function (options) {
        options = pointjs.prototype.extend({
            method: 'GET',
            url: '/',
            headers: [],
            data: {},
            async: true,
            onreadystatechange: null,
            success: function () {
            },
            error: function () {
            },
            always: function () {
            },
        }, options || {});

        var xhr = makeXHR();
        xhr.open(options.method, options.url, options.async);
        for (var i = 0, l = options.headers.length; i < l; i++) {
            var header = options.headers[i];
            if (Type.isArray(header) && header.length > 1) {
                xhr.setRequestHeader(header[0], header[1]);
            } else if (header.name && header.value) {
                xhr.setRequestHeader(header.name, header.value);
            }
        }
        if (options.onreadystatechange !== null) {
            xhr.onreadystatechange = options.onreadystatechange;
        } else {
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4) {
                    xhr = parseXHR(xhr);
                    if (xhr.status >= 200 && xhr.status < 300) {
                        options.success.call(xhr, xhr);
                    } else {
                        options.error.call(xhr, xhr);
                    }
                    options.always.call(xhr, xhr);
                }
            }
        }

        xhr.onerror = options.onerror;
        try {
            xhr.send(options.data);
        } catch (e) {
            options.error.call(xhr, e, xhr);
        }
    }

    pointjs.prototype.ajaxGet = function (url, success, error, always) {
        return pointjs.prototype.ajaxSend({
            url: url,
            method: 'GET',
            success: success,
            error: error,
            always: always
        })
    };

    pointjs.prototype.ajaxPut = function (url, data, success, error, always) {
        return pointjs.prototype.ajaxSend({
            url: url,
            method: 'PUT',
            data: data,
            success: success,
            error: error,
            always: always
        })
    };

    pointjs.prototype.ajaxPost = function (url, data, success, error, always) {
        return pointjs.prototype.ajaxSend({
            url: url,
            method: 'POST',
            data: data,
            success: success,
            error: error,
            always: always
        })
    };

    pointjs.prototype.ajaxDelete = function (url, success, error, always) {
        return pointjs.prototype.ajaxSend({
            url: url,
            method: 'DELETE',
            success: success,
            error: error,
            always: always
        })
    };

    pointjs.prototype.insertCss = function (rule) {
        if (document.styleSheets && document.styleSheets.length) {
            try {
                document.styleSheets[0].insertRule(rule, 0);
            } catch (ex) {
                console.warn(ex.message, rule);
            }
        } else {
            var style = document.createElement("style");
            style.innerHTML = rule;
            document.head.appendChild(style);
        }
    }

    pointjs.prototype.deleteCSS = function (ruleName) {
        var cssrules = (document.all) ? "rules" : "cssRules",
            i;
        for (i = 0; i < document.styleSheets[0][cssrules].length; i += 1) {
            var rule = document.styleSheets[0][cssrules][i];
            if (rule.name === ruleName || rule.selectorText === '.' + ruleName) {
                document.styleSheets[0].deleteRule(i);
                break;
            }
        }
    };

    pointjs.prototype.loadCss = function (url, success, error) {
        var link = document.createElement("link");
        link.type = "text/css";
        link.rel = "stylesheet";
        link.href = url;
        EventUtil.on(link, 'load', success);
        EventUtil.on(link, 'error', error);
        document.getElementsByTagName("head")[0].appendChild(link);
    };

    pointjs.prototype.unloadCss = function (url, success) {
        var head = document.getElementsByTagName("head")[0];
        var children = head.children;
        for (var i = 0, l = children.length; i < l; i++) {
            var item = children.item(i);
            if (item.hasAttribute('href') && item.getAttribute('href') === url) {
                head.removeChild(item);
                success(item, head);
                break;
            }
        }
    }

    pointjs.prototype.loadScript = function (url, success, error) {
        var script = document.createElement("script");
        script.type = "type/javascipt";
        script.src = url;
        EventUtil.on(script, 'load', success);
        EventUtil.on(script, 'error', error);
        (document.getElementsByTagName('head')[0] || document.body || document.documentElement).appendChild(script);
    }

    pointjs.prototype.unloadScript = function (url, success) {
        var container = (document.getElementsByTagName('head')[0] || document.body || document.documentElement);
        pointjs.prototype.$('script', container).each(function (idx, item) {
            if (item.hasAttribute('src') && item.getAttribute('src') === url) {
                container.removeChild(item);
                success(item, container);
                return false;/*break the loop*/
            }
        });
    }

    var AsyncUtil = {
        ajaxSend: function (options) {
            options = pointjs.prototype.extend({
                method: 'GET',
                url: '/',
                headers: [],
                data: {},
                async: true,
                onreadystatechange: null,
                always: function () {
                },
            }, options || {});

            return new Promise(function (resolve, reject) {
                var xhr = makeXHR();
                xhr.open(options.method, options.url, options.async);
                for (var i = 0, l = options.headers.length; i < l; i++) {
                    var header = options.headers[i];
                    if (Type.isArray(header) && header.length > 1) {
                        xhr.setRequestHeader(header[0], header[1]);
                    } else if (header.name && header.value) {
                        xhr.setRequestHeader(header.name, header.value);
                    }
                }
                resolve = resolve || options.success;
                reject = reject || options.error;

                xhr.onreadystatechange = options.onreadystatechange || function () {
                    if (xhr.readyState === 4) {
                        xhr = parseXHR(xhr);
                        if (xhr.status >= 200 && xhr.status < 300) {
                            resolve.call(xhr, xhr);
                        } else {
                            reject.call(xhr, xhr);
                        }
                        options.always.call(xhr, xhr);
                    }
                }
                xhr.send(options.data);
            });
        },
        ajaxGet:function(url, headers, always){
            var options = {url:url, method:'GET'};
            options.headers=headers||[];
            options.always=always||function(){};
            return this.ajaxSend(options);
        },
        ajaxPost:function(url, data, headers, always){
            var options = {url:url, method:'POST'};
            options.data=data||{};
            options.headers=headers||[];
            options.always=always||function(){};
            return this.ajaxSend(options);
        },
        ajaxPut:function(url, data, headers, always){
            var options = {url:url, method:'PUT'};
            options.data=data||{};
            options.headers=headers||[];
            options.always=always||function(){};
            return this.ajaxSend(options);
        },
        ajaxDelete:function(url, headers, always){
            var options = {url:url, method:'DELETE'};
            options.headers=headers||[];
            options.always=always||function(){};
            return this.ajaxSend(options);
        },
        wait: function (duration) {
            return new Promise(function (resolve, reject) {
                setTimeout(resolve, duration);
            })
        },
        waitFor: function (element, event, useCapture) {
            return new Promise(function (resolve, reject) {
                var el = element;
                if (_isObjTypeFn(element, 'DomElement')) {
                    el = element.$el;
                }
                EventUtil.on(el, event, function (event) {
                    resolve(event);
                    EventUtil.off(element, event, function(){}, useCapture);
                    el = null;
                }, useCapture);
            });
        },
        loadImage: function (url) {
            return new Promise(function (resolve, reject) {
                var image = new Image;
                EventUtil.on(image, 'load', function listener() {
                    resolve(image);
                    EventUtil.off(image, 'load', listener);
                });
                EventUtil.on(image, 'error', reject);
                image.src = src;
            });
        },
        onDOMContentLoaded: function () {
            return new Promise(function (resolve, reject) {
                if (document.readyState === 'complete') {
                    resolve();
                } else {
                    EventUtil.on(document, 'DOMContentLoaded', resolve);
                }
            });
        },
        race: Promise.race,
        all: Promise.all,
        promise: function (fn) {
            return new Promise(fn);
        }
    };

    pointjs.prototype.async = AsyncUtil;
    pointjs.prototype.sleep = AsyncUtil.wait;

    pointjs.prototype.when = function () {
        var self = this;
        var args = arguments;

        var when = function(){
            this.$promise = Promise.all(args);
        };

        when.prototype.then=function(fn){
            this.$promise.then(function(){
                fn.apply(this, arguments[0]);
            });
        };

        return new when();
    };

    var _cmpFn = function(a, b){
        return a===b;
    }
    pointjs.prototype.arrayIndexOf = function(array, val, cmpFn){
        cmpFn = cmpFn||_cmpFn;

        for(var i=0, l=array.length; i<l; i++){
            if(cmpFn(array[i], val)){
                return i;
            }
        }
        return -1;
    };

    pointjs.prototype.arrayRemove=function(ary, val, cmpFn){
        cmpFn = cmpFn||_cmpFn;
        var idx = pointjs.prototype.indexOf(ary, val, cmpFn)
        if(idx!==-1){
            ary.slice(idx, 1);
        }
    }

    window.$pointjs = new pointjs();

}(window, document))