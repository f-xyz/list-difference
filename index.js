(function (root, factory) {
    /* istanbul ignore next */
    if (typeof root.define === 'function' && root.define.amd) {
        // AMD. Register as an anonymous module.
        root.define(['exports'], factory);
    } else if (typeof module === 'object') {
        // CommonJS
        module.exports = factory();
    } else {
        // Browser globals
        root[factory.name] = factory();
    }
}(this, function diff() {
    'use strict';

    // todo: make output objects' keys readable
    // todo: remove support of value items -> simplify + performance

    var TRACK_BY_FIELD = '$$listDiffHash';

    var DIFF_NOT_MODIFIED = 0;
    var DIFF_CREATED = 1;
    var DIFF_MOVED = 2;
    var DIFF_DELETED = -1;

    var lastUniqueId = 0;

    /**
     * Returns auto incremental unique ID as integer.
     * @returns {number}
     */
    function getUniqueKey() {
        return lastUniqueId++;
    }

    /**
     * Returns x if it is not undefined, y otherwise.
     * @param x
     * @param y
     * @returns {*}
     */
    function maybe(x, y) {
        if (x !== undefined) return x;
        return y;
    }

    /**
     * @param {Array} list
     * @param {string} trackBy
     * @returns {{}}
     */
    function buildHashToIndexMap(list, trackBy) {
        var map = {};
        for (var i = 0; i < list.length; ++i) {
            var item = list[i];
            if (trackBy) {
                map[item[trackBy]] = i;
            } else {
                map[item] = i;
                addHashFieldToListItem(item, TRACK_BY_FIELD);
            }
        }
        return map;
    }

    /**
     * @param item
     * @param {string} trackBy
     * @returns {*} item
     */
    function addHashFieldToListItem(item, trackBy) {
        if (typeof item === 'object' && item !== null) {
            item[trackBy] = getUniqueKey();
        }
        return item;
    }

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
     * @param {Array} list
     * @param {Array} prev
     * @param {string} [trackBy]
     */
    function diff(list, prev, trackBy) {
        var diff = [];
        var indexList = 0;
        var indexPrev = 0;

        var listIndexMap = buildHashToIndexMap(list, trackBy);
        var prevIndexMap = buildHashToIndexMap(prev, trackBy);

        function addEntry(item, state, iList, iPrev) {
            diff.push({
                item: item,
                state: state,
                iList: iList,
                iPrev: iPrev
            });
        }

        for (; indexList < list.length || indexPrev < prev.length;) {
            var itemList = list[indexList];
            var itemPrev = prev[indexPrev];

            if (indexList >= list.length) {

                addEntry(itemPrev, DIFF_DELETED, -1, indexPrev);
                ++indexPrev;

            } else if (indexPrev >= prev.length) {

                addEntry(itemList, DIFF_CREATED, indexList, -1);
                ++indexList;

            } else if (itemList !== itemPrev) {

                var indexOfItemInPrevList;
                var indexOfPrevItemInList;

                if (trackBy) {
                    indexOfItemInPrevList = maybe(prevIndexMap[itemList[trackBy]], -1);
                    indexOfPrevItemInList = maybe(listIndexMap[itemPrev[trackBy]], -1);
                } else if (typeof itemList === 'object'
                        && typeof itemPrev === 'object') {
                    indexOfItemInPrevList = maybe(prevIndexMap[TRACK_BY_FIELD], -1);
                    indexOfPrevItemInList = maybe(listIndexMap[TRACK_BY_FIELD], -1);
                } else {
                    indexOfItemInPrevList = maybe(prevIndexMap[itemList], -1);
                    indexOfPrevItemInList = maybe(listIndexMap[itemPrev], -1);
                }

                var isCreated = indexOfItemInPrevList === -1;
                var isDeleted = indexOfPrevItemInList === -1;

                // created
                if (isCreated) {
                    addEntry(itemList, DIFF_CREATED, indexList, -1);
                    ++indexList;
                }

                // moved
                if (!isCreated && !isDeleted) {
                    if (indexList === indexOfItemInPrevList) {
                        // for reference types with given trackBy
                        addEntry(itemPrev, DIFF_NOT_MODIFIED);
                    } else {
                        addEntry(itemPrev, DIFF_MOVED, indexOfItemInPrevList, indexPrev);
                    }
                    ++indexList;
                    ++indexPrev;
                }

                // deleted
                if (isDeleted) {
                    addEntry(itemPrev, DIFF_DELETED, -1, indexPrev);
                    ++indexPrev;
                }

            } else {
                addEntry(itemPrev, DIFF_NOT_MODIFIED, indexList, indexPrev);
                ++indexList;
                ++indexPrev;
            }
        }

        return diff;
    }

    // exports ////////////////////////////////////////////////////////////////

    diff.TRACK_BY_FIELD = TRACK_BY_FIELD;
    diff.NOT_MODIFIED = DIFF_NOT_MODIFIED;
    diff.CREATED = DIFF_CREATED;
    diff.MOVED = DIFF_MOVED;
    diff.DELETED = DIFF_DELETED;
    diff.getUniqueKey = getUniqueKey;
    diff.buildHashToIndexMap = buildHashToIndexMap;

    return diff;
}));
