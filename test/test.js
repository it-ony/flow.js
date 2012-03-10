var flow = require(__dirname + '/../lib/flow').flow;
var should = require('chai').should();

describe('Flow', function () {
    describe('#exec()', function () {
        it('empty flow should exec without errors', function (done) {
            flow()
                .exec(function (err, data) {
                    should.not.exist(err);

                    done();
                })
        });

        it('should always call callback', function (done) {
            flow()
                .seq(function (cb) {
                    cb(null);
                })
                .exec(function (err, vars) {
                    done();
                });

        });

    });

    describe('#seq()', function () {
        it('synchron sequence', function (done) {
            flow()
                .seq(function(){
                    // synchron
                })
                .exec(function (err, data) {
                    should.not.exist(err);

                    done();
                })
        });

        it('synchron sequence', function (done) {
            flow()
                .seq(function (cb) {
                    setTimeout(function() {
                        cb(null)
                    }, 20);
                })
                .exec(function (err, vars) {
                    should.not.exist(err);

                    done();
                });
        });

        it('synchron sequence with name should set var', function (done) {
            flow()
                .seq("x", function () {
                    // synchron
                    return "y";
                })
                .exec(function (err, results) {
                    should.not.exist(err);

                    results.should.have.ownProperty('x') && results.x.should.eql("y");
                    Object.keys(results).length.should.eql(1);

                    done();
                })
        });

        it('asynchron sequence with name should set var', function (done) {
            flow()
                .seq("x", function (cb) {
                    // asychron
                    cb(null, "y");
                })
                .exec(function (err, results) {
                    should.not.exist(err);

                    results.should.have.ownProperty('x') && results.x.should.eql("y");
                    Object.keys(results).length.should.eql(1);

                    done();
                })
        });

        it('sequence should execute after each', function (done) {

            var x;

            flow()
                .seq(function (cb) {
                    // asynchron
                    setTimeout(function () {
                        x = 123;
                        cb(null);
                    }, 5);
                })
                .seq(function () {
                    // synchron
                    should.exist(x) && x.should.eql(123);
                })
                .exec(function (err, results) {
                    should.not.exist(err);
                    done();
                })
        });

        it('two sequence should execute after each and set vars', function (done) {
            flow()
                .seq("x", function (cb) {
                    // asynchron
                    setTimeout(function(){
                        cb(null, "x")
                    }, 5);
                })
                .seq("y", function () {
                    // synchron
                    this.vars.should.have.property('x') && this.vars.x.should.eql('x');
                    return "y";
                })
                .exec(function (err, results) {
                    should.not.exist(err);

                    results.should.have.ownProperty('x') && results.x.should.eql("x") &&
                    results.should.have.ownProperty('y') && results.y.should.eql("y");

                    Object.keys(results).length.should.eql(2);

                    done();
                })
        });


        it('synchron sequence throwing error should add error in exec', function (done) {
            flow()
                .seq(function () {
                    throw "error"
                })
                .exec(function (err, results) {
                    should.exist(err);
                    done();
                })
        });

        it('asynchron sequence throwing error should add error in exec', function (done) {
            flow()
                .seq(function (cb) {
                    cb("error");
                })
                .exec(function (err, results) {
                    should.exist(err);
                    done();
                })
        });

        it('error in sequence should interrupt flow', function (done) {

            var x;

            flow()
                .seq(function (cb) {
                    cb("error");
                })
                .seq(function(){
                    x = 123;
                })
                .exec(function (err, results) {
                    should.exist(err) && should.not.exists(x);
                    done();
                })
        });


        it('passing no function to sequence should fails', function (done) {

            try {
                flow()
                    .seq()
                    .exec(function (err, results) {
                        throw "Exec should be executed";
                    });
            } catch (e) {
                done()
            }
        });

        it('passing no function to sequence should fails even with var name', function (done) {

            try {
                flow()
                    .seq("x")
                    .exec(function (err, results) {
                        throw "Exec should be executed";
                    });
            } catch (e) {
                done()
            }
        });


    });


    describe('#par()', function () {


        it('empty parallel', function (done) {
            flow()
                .par([])
                .exec(function (err) {
                    should.not.exist(err);

                    done();
                })
        });

        it('empty parallel with vars', function (done) {
            flow()
                .par({})
                .exec(function (err) {
                    should.not.exist(err);

                    done();
                })
        });

        it('sychron parallel', function (done) {

            var x, y, z;

            flow()
                .par([
                    function() {
                        x = 1;
                    },
                    function() {
                        y = 2;
                    },
                    function() {
                        z = 3;
                    }
                ])
                .exec(function (err) {
                    should.not.exist(err);

                    should.exist(x) && should.exist(y) && should.exist(z);
                    x.should.eql(1) && y.should.eql(2) && z.should.eql(3);

                    done();
                })
        });

        it('asychron parallel', function (done) {

            var x, y, z;

            flow()
                .par([
                function (cb) {
                    setTimeout(function(){
                        x = 1;
                        cb(null);
                    }, 20);
                },
                function (cb) {
                    setTimeout(function () {
                        y = 2;
                        cb(null);
                    }, 20);
                },
                function (cb) {
                    setTimeout(function () {
                        z = 3;
                        cb(null);
                    }, 20);
                }
            ])
            .exec(function (err) {
                should.not.exist(err);

                should.exist(x) && should.exist(y) && should.exist(z);
                x.should.eql(1) && y.should.eql(2) && z.should.eql(3);

                done();
            })
        });

        it('sychron parallel', function (done) {

            flow()
                .par({
                    a: function () {
                        return 1;
                    },
                    b: function () {
                        return 2;
                    },
                    c: function () {
                        return 3;
                    }
                })
                .exec(function (err, results) {
                    should.not.exist(err);

                    should.exist(results) && results.should.have.property('a')
                        && results.should.have.property('b') && results.should.have.property('c');


                    done();
                })
        });


        it('asychron parallel set vars', function (done) {

            flow()
                .par({
                    a: function (cb) {
                        setTimeout(function () {
                            cb(null, 1);
                        }, 20);
                    },
                    b: function (cb) {
                        setTimeout(function () {
                            cb(null, 2);
                        }, 20);
                    },
                    c: function (cb) {
                        setTimeout(function () {
                            cb(null, 3);
                        }, 20);
                    }
                })
                .exec(function (err, results) {
                    should.not.exist(err);

                    should.exist(results) && results.should.have.property('a')
                    && results.should.have.property('b') && results.should.have.property('c');

                    results.a.should.eql(1) && results.b.should.equal(2) && results.c.should.eql(3);

                    done();
                })
        });

        it('exception in synchron parallel tasks should not set a var and call exec', function (done) {

            flow()
                .par({
                    a: function () {
                        return 1;
                    },
                    b: function () {
                        throw "error";
                    },
                    c: function () {
                        return 2;
                    }
                })
                .exec(function (err, results) {
                    should.exist(err);

                    results.should.not.have.property('a') && results.should.not.have.property('b')
                        && results.should.not.have.property('c');

                    done();
                })
        });
    });

});