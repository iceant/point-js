;(function (window, document) {
    var Validator = function (strategies) {
        this.strategies = $pointjs.extend({
            isNonEmpty: function (value, errorMsg) {
                if (value === '') return errorMsg;
            },
            minLength: function (val, length, errorMsg) {
                if (val.length < length) {
                    return errorMsg;
                }
            },
            isMobile: function (val, errorMsg) {
                if (!/(^1[358][0-9]{9}$)/.test(val)) {
                    return errorMsg;
                }
            }
        }, strategies || {});
        this.cache = [];
    };

    Validator.prototype.add = function (dom, rules) {
        var self = this;
        for (var i = 0; i < rules.length; i++) {
            (function (rule) {
                var strategyAry = rule.strategy.split(':');
                var errorMsg = rule.errorMsg;

                self.cache.push(function () {
                    var strategy = strategyAry.shift();
                    strategyAry.unshift(dom.value);
                    strategyAry.push(errorMsg);
                    return self.strategies[strategy].apply(dom, strategyAry);
                });
            })(rules[i]);
        }

    }

    Validator.prototype.start = function () {
        for (var i = 0, validatorFn; (validatorFn = this.cache[i++]);) {
            var msg = validatorFn();
            if (msg) {
                return msg;
            }
        }
    }

    window.Validator = Validator;
}(window, document));