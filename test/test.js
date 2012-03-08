var flow = require(__dirname + '/../lib/flow').flow;

describe('Flow', function () {
    describe('#exec()', function () {
        it('empty flow should exec without errors', function (done) {
            flow()
                .exec(function (err, data) {
                    if (err) {
                        throw "empty flow should be cause no errrs"
                    }

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



});