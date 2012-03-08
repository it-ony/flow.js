(function (exports) {

    var flow = function (context) {
        return new Flow(context);
    };

    var Flow = function(context) {
        this.$context = context || {
            error: null,
            callback: null,
            actions: [],
            vars: {}
        };
    };


    /**
     *
     * @param {String} [name] variable name
     * @param {Function} fn function to execute
     */
    Flow.prototype.seq = function (name, fn) {
        if (name instanceof Function) {
            fn = name;
            name = null;
        }

        if (!fn) {
            throw "Sequence action not defined";
        }

        var self = this;

        this.$context.actions.push(function (cb) {
                var thisArg = function (err, data) {
                    if (!err && name) {
                        // save result to var
                        self.$context.vars[name] = data;
                    }

                    cb(err, data);
                };
                thisArg.vars = self.$context.vars;

                if (fn.length) {
                    // async
                    fn.call(thisArg, thisArg);
                } else {
                    // sync
                    try {
                        thisArg(null, fn.call(thisArg));
                    } catch (e) {
                        thisArg(e, null);
                    }
                }
            }
        );

        return this;
    };

    Flow.prototype.par = function (hash) {
        throw "not implemented";
        return this;
    };

    Flow.prototype.exec = function (cb) {
        var self = this;

        var callback = function(err, data) {
            if (cb) {
                cb(err, data);
            }
        };

        function execNext(index) {
            if (index < self.$context.actions.length) {
                // execute action
                self.$context.actions[index](function(err, data) {
                    if (err) {
                        callback(err, data);
                    } else {
                        execNext(index+1);
                    }
                });

            } else {
                // finished
                callback(null, self.$context.vars);
            }
        }

        execNext(0);

    };

    // global on the server, window in the browser
    var root = this,
        previous_flow = root.flow;

    flow.noConflict = function () {
        root.flow = previous_flow;
        return flow;
    };

    exports.flow = flow;

})(typeof exports === "undefined" ? this : exports);