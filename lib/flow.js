(function (exports) {

    var flow = function () {
        return new Flow();
    };

    var Flow = function(context) {
        this.$context = context || {
            error: null,
            actions: [],
            vars: {}
        };
    };


    /**
     *
     * @param {String} [name] variable name
     * @param {Function} fn function to execute
     *      fn - function() {}      // syncron
     *      fn - function(cb) {}    // asyncron
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

    var parallelAction = function (name, fn) {

        if (!fn) {
            throw "Parallel action not defined";
        }

        return function (parallelInstance, context, results, parallelFinishedCallback) {
            var thisArg = function (err, data) {

                if (!err && name) {
                    // save result to tmp. var
                    results[name] = data;
                }

                parallelFinishedCallback(parallelInstance, err, data);
            };

            thisArg.vars = context.vars;

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
        };
    };

    /**
     * Executes the given functions parallel
     *
     * @param {Object, Array} fns
     *  {Object} fns - keys will be variable name for returned value
     */
    Flow.prototype.par = function (fns) {

        var self = this;

        if (fns) {

            var parallelActions = [];

            if (fns instanceof Array) {
                for (var i = 0; i < fns.length; i++) {
                    var fn = fns[i];
                    parallelActions.push(new parallelAction(null, fn));
                }
            } else {
                for (var key in fns) {
                    if (fns.hasOwnProperty(key)) {
                        parallelActions.push(new parallelAction(key, fns[key]));
                    }
                }
            }

            if (parallelActions.length > 0) {
                // we got at least one function executing in parallel

                // push new action
                this.$context.actions.push(function (cb) {

                    (function (parallelActions, cb) {
                        var results = {};

                        var parallelFinished = function (fn, err, data) {
                            if (err) {
                                // some error occurred
                                cb(err, null);
                            } else {
                                var index = parallelActions.indexOf(fn);
                                if (index >= 0 && index < parallelActions.length) {
                                    // remove parallel executed function from actions
                                    parallelActions.splice(index, 1);
                                } else {
                                    cb("Parallel function returned which wasn't part of this parallel actions");
                                    return;
                                }

                                if (parallelActions.length == 0) {
                                    // copy results to var
                                    for (var key in results) {
                                        if (results.hasOwnProperty(key)) {
                                            self.$context.vars[key] = results[key];
                                        }
                                    }

                                    cb(null, results);
                                }
                            }
                        };

                        // copy array of parallel actions, to avoid array is modified by returning of function
                        // before all functions are started

                        var copyParallelActions = parallelActions.slice();

                        // start all functions
                        for (var p = 0; p < copyParallelActions.length; p++) {
                            // start parallel action
                            var parallelInstance = copyParallelActions[p];
                            parallelInstance(parallelInstance, self.$context, results, parallelFinished);
                        }
                    })(parallelActions, cb);

                });
            }
        }

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
                        callback(err, self.$context.vars);
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