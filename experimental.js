var colors = require('colors');
var util = require('./util');

var logDiff = util.logDiff;
var colorByState = util.colorByState;

var DIFF_NOT_MODIFIED = 0;
var DIFF_CREATED = 1;
var DIFF_MOVED = 2;
var DIFF_DELETED = -1;

/**
 * Calculates difference between two arrays.
 * List and prev. list:
 * 1 1 -> not changed
 * 2 2 -> not changed
 *   3 -> deleted
 * 4   -> created
 * 5   -> created
 *   6 -> deleted
 * Returns array of { item: T, state: int }.
 * Where state means: 0 - not modified, 1 - created, -1 - deleted.
 */
function diff(list, prev) {
    console.log('\n# diff');
    console.log('  list', list);
    console.log('  prev', prev);
    console.time('# time');

    var diff = [];
    var iList = 0;
    var iPrev = 0;

    var listMap = {};
    var prevMap = {};

    var i;
    for (i = 0; i < list.length; ++i) {
        listMap[list[i]] = list.indexOf(list[i]);
    }
    for (i = 0; i < prev.length; ++i) {
        prevMap[prev[i]] = prev.indexOf(prev[i]);
    }

    function maybe(x, y) {
        if (x !== undefined) return x;
        return y;
    }

    for (; iList < list.length || iPrev < prev.length;) {
        var listItem = list[iList];
        var prevItem = prev[iPrev];

        console.log('  %s: %s\t%s: %s', iList, listItem, iPrev, prevItem);

        if (iList >= list.length) {

            diff.push({ item: prevItem, state: DIFF_DELETED });
            ++iPrev;

        } else if (iPrev >= prev.length) {

            diff.push({ item: listItem, state: DIFF_CREATED });
            ++iList;

        } else if (listItem !== prevItem) {

            //var prevItemIndex = prev.indexOf(listItem);
            //var listItemIndex = list.indexOf(prevItem);

            var prevItemIndex = maybe(prevMap[listItem], -1);
            var listItemIndex = maybe(listMap[prevItem], -1);

            var isCreated = prevItemIndex === -1;
            var isDeleted = listItemIndex === -1;

            console.log('    %s, %s', prevItemIndex, listItemIndex);
            console.log('    item: %s, prev: %s -> created: %s, deleted: %s'.yellow,
                listItem, prevItem, isCreated, isDeleted);

            if (isCreated) {
                diff.push({ item: listItem, state: DIFF_CREATED });
                ++iList;
                console.log('    created %s'.green, listItem)
            }

            if (!isCreated && !isDeleted) {
                // moved
                console.log('    moved %s -> %s'.blue, prevItemIndex, iList);
                diff.push({
                    item: listItem,
                    state: DIFF_MOVED,
                    oldIndex: prevItemIndex,
                    newIndex: iList
                });
                ++iList;
                ++iPrev;
            }

            if (isDeleted) {
                diff.push({ item: prevItem, state: DIFF_DELETED });
                ++iPrev;
                console.log('    deleted %s'.red, prevItem)
            }

        } else {
            console.log('    item: %s, prev: %s -> not modified'.yellow,
                listItem, prevItem);
            diff.push({ item: listItem, state: DIFF_NOT_MODIFIED });
            ++iList;
            ++iPrev;
        }
    }

    console.timeEnd('# time');
    logDiff(diff);
    console.log(diff);
    console.log('\n');

    return diff;
}

//diff([1, 2, 0, 3, 2, 1, 3, 4], [0, 3, 0, 3, 2, 1, 2, 1]);
diff([1, 2, 3, 5, 6], [2, 1, 3, 4, 5]);
//diff([1, 2], [2, 1]);

