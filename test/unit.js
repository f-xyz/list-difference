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

        it('created element with non-zero offset', function () {
            diff([1, 2], [2]).should.eql([
                { item: 1, state: diff.CREATED },
                { item: 2, state: diff.NOT_MODIFIED }
            ]);
        });

        it('deleted element with non-zero offset', function () {
            diff([1, 2], [1]).should.eql([
                { item: 1, state: diff.NOT_MODIFIED },
                { item: 2, state: diff.CREATED }
            ]);
        });
    })
});