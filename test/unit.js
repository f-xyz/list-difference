var should = require('chai').should();
var diff = require('../index');

describe('unit tests', function () {

    describe('comparing with empty array', function () {

        it('both arrays are empty', function () {
            diff([], []).should.eql([]);
        });

        it('created element', function () {
            diff([1], []).should.eql([
                { item: 1, state: diff.CREATED }
            ]);
        });

        it('deleted element', function () {
            diff([], [1]).should.eql([
                { item: 1, state: diff.DELETED }
            ]);
        });
    });

    describe('comparing both non-empty arrays', function () {

        it('not modified elements', function () {
            diff([1], [1]).should.eql([
                { item: 1, state: diff.NOT_MODIFIED }
            ]);
        });

        it('replaced elements', function () {
            diff([2], [1]).should.eql([
                { item: 2, state: diff.CREATED },
                { item: 1, state: diff.DELETED }
            ]);
        });

        it('created element with non-zero index', function () {
            diff([1, 2], [2]).should.eql([
                { item: 1, state: diff.CREATED },
                { item: 2, state: diff.NOT_MODIFIED }
            ]);
        });

        it('deleted element with non-zero index', function () {
            diff([1, 2], [1]).should.eql([
                { item: 1, state: diff.NOT_MODIFIED },
                { item: 2, state: diff.CREATED }
            ]);
        });

        it('exchange', function () {
            diff([1, 2], [2, 1]).should.eql([
                { item: 1, state: diff.MOVED, oldIndex: 1, newIndex: 0 },
                { item: 2, state: diff.MOVED, oldIndex: 0, newIndex: 1 }
            ]);
        });

        it('exchange around center item', function () {
            diff([1, 2, 3], [3, 2, 1]).should.eql([
                { item: 1, state: diff.MOVED, oldIndex: 2, newIndex: 0 },
                { item: 2, state: diff.NOT_MODIFIED },
                { item: 3, state: diff.MOVED, oldIndex: 0, newIndex: 2 }
            ]);
        });
    });

    describe('different item types', function () {

        it('should compare by reference', function () {
            var a = { a: 1 };
            var b = { a: 1 };
            var list = [a];
            var prev = [b];
            diff(list, prev).should.eql([
                { item: a, state: diff.CREATED },
                { item: b, state: diff.DELETED }
            ]);
        });

        it('should deal with null and undefined', function () {
            var list = [null];
            var prev = [undefined];
            diff(list, prev).should.eql([
                { item: null, state: diff.CREATED },
                { item: undefined, state: diff.DELETED }
            ]);
        });
    });
});