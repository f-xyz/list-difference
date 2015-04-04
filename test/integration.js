var should = require('chai').should();
var diff = require('../index');

describe('integration tests on big random arrays', function () {
    var n = 1e4;
    var list = [];
    var prev = [];
    var created = [];
    var deleted = [];
    var notModified = [];

    for (var i = 0; i < n; ++i) {

        var addToList = Math.random() >= 0.5;
        var addToPrev = Math.random() >= 0.5;

        if (addToList) list.push(i);
        if (addToPrev) prev.push(i);

        if      ( addToList &&  addToPrev) notModified.push(i);
        else if ( addToList && !addToPrev) created.push(i);
        else if (!addToList &&  addToPrev) deleted.push(i);
    }

    var number = Math.max(list.length, prev.length);
    var timeStart = Date.now();
    var result = diff(list, prev);
    var duration = Date.now() - timeStart;

    it('comparing of ' + number + ' elements took ' + duration + ' ms', function () {
        // 0.04 is ok on average notebook
        duration.should.lt(0.1 * number);
    });

    it('should determine not modified elements', function () {
        try {
            result
                .filter(function (x) { return x.state === diff.NOT_MODIFIED })
                .map(function (x) { return x.item })
                .should.eql(notModified);
        } catch (exc) {
            console.log('NOT MODIFIED ERROR');
            console.log('var list = [' + list.join(', ') + '];');
            console.log('var prev = [' + prev.join(', ') + '];');
            throw exc;
        }
    });

    it('should determine created elements', function () {
        try {
            result
                .filter(function (x) { return x.state === diff.CREATED })
                .map(function (x) { return x.item })
                .should.eql(created);
        } catch (exc) {
            console.log('CREATED ERROR');
            console.log('var list = [' + list.join(', ') + '];');
            console.log('var prev = [' + prev.join(', ') + '];');
            throw exc;
        }
    });

    it('should determine deleted elements', function () {
        try {
            result
                .filter(function (x) { return x.state === diff.DELETED })
                .map(function (x) { return x.item })
                .should.eql(deleted);
        } catch (exc) {
            console.log('DELETED ERROR');
            console.log('var list = [' + list.join(', ') + '];');
            console.log('var prev = [' + prev.join(', ') + '];');
            throw exc;
        }
    });
});
