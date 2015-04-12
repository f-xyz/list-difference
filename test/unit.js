require('chai').should();
var diff = require('../index');

describe('unit tests', function () {

    describe('comparing with empty array', function () {

        it('both arrays are empty', function () {
            diff([], []).should.eql([]);
        });
        
        it('created element', function () {
            diff([1], []).should.eql([
                { item: 1, state: diff.CREATED, iList: 0, iPrev: -1 }
            ]);
        });

        it('deleted element', function () {
            diff([], [1]).should.eql([
                { item: 1, state: diff.DELETED, iList: -1, iPrev: 0 }
            ]);
        });
    });

    describe('comparing both non-empty arrays', function () {

        it('not modified elements', function () {
            diff([1], [1]).should.eql([
                { item: 1, state: diff.NOT_MODIFIED, iList: 0, iPrev: 0 }
            ]);
        });

        it('replaced elements', function () {
            diff([2], [1]).should.eql([
                { item: 2, state: diff.CREATED, iList: 0, iPrev: -1 },
                { item: 1, state: diff.DELETED, iList: -1, iPrev: 0 }
            ]);
        });

        it('created element with non-zero index', function () {
            diff([1, 2], [2]).should.eql([
                { item: 1, state: diff.CREATED, iList: 0, iPrev: -1 },
                { item: 2, state: diff.NOT_MODIFIED, iList: 1, iPrev: 0 }
            ]);
        });

        it('deleted element with non-zero index', function () {
            diff([1], [1, 2]).should.eql([
                { item: 1, state: diff.NOT_MODIFIED, iList: 0, iPrev: 0 },
                { item: 2, state: diff.DELETED, iList: -1, iPrev: 1 }
            ]);
        });

        it('exchange', function () {
            diff([1, 2], [2, 1]).should.eql([
                { item: 1, state: diff.MOVED, iList: 0, iPrev: 1 },
                { item: 2, state: diff.MOVED, iList: 1, iPrev: 0 }
            ]);
        });

        it('should deal with null and undefined', function () {
            var list = [null];
            var prev = [undefined];
            diff(list, prev).should.eql([
                { item: null, state: diff.CREATED, iList: 0, iPrev: -1 },
                { item: undefined, state: diff.DELETED, iList: -1, iPrev: 0 }
            ]);
        });
    });

    describe('comparing arrays of objects', function () {

        it('should compare by reference', function () {
            var a = { a: 1, id: 1 };
            var b = { a: 1, id: 2 };
            var result = diff([a], [b]);
            result.should.eql([
                { item: a, state: diff.CREATED, iList: 0, iPrev: -1 },
                { item: b, state: diff.DELETED, iList: -1, iPrev: 0 }
            ]);
        });

        it('should add Hash Field to items if trackBy was not given', function () {
            var a = { a: 1 };
            var b = { a: 1 };
            var result = diff([a], [b]);
            result.every(function (x) {
                return diff.TRACK_BY_FIELD in x.item;
            }).should.eq(true);
        });

        it('should use provided trackBy field', function () {
            var a = { a: 1, b: 1 };
            var b = { a: 1, b: 1 };
            var result = diff([a], [b], 'a');
            result.every(function (x) {
                return diff.TRACK_BY_FIELD in x.item;
            }).should.eq(false);
        });
    });

    describe('getUniqueHash tests', function () {

        it('should return unique values', function () {
            var bulk = {};
            var duplicate = false;
            for (var i = 0; i < 100; ++i) {
                var hash = diff.getUniqueKey();
                if (hash in bulk) {
                    duplicate = true;
                    break;
                }
                bulk[hash] = 0;
            }
            duplicate.should.eq(false);
        });
    });
});