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
                    cb(null, "y")
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


    });


});