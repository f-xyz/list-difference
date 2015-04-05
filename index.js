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
        root.diff = factory();
    }
}(this, function () {

    var lastUniqueId = 0;
    var HASH_FIELD_NAME = '$$hashKey';
    var DIFF_NOT_MODIFIED = 0;
    var DIFF_CREATED = 1;
    var DIFF_MOVED = 2;
    var DIFF_DELETED = -1;

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
     *
     * @param list
     * @param uniqueKey
     * @returns {{}}
     */
    function buildIndexMap(list, uniqueKey) {
        var map = {};
        for (var i = 0; i < list.length; ++i) {
            if (uniqueKey) {
                map[list[i][uniqueKey]] = i;
            } else {
                map[list[i]] = i;
            }
        }
        return map;
    }

    /**
     *
     * @param {*[]} list
     * @param {string} uniqueKey
     * @returns {*[]}
     */
    function hashListItems(list, uniqueKey) {
        for (var i = 0; i < list.length; ++i) {
            var item = list[i];
            if (typeof item === 'object' && item !== null) {
                if (item[uniqueKey] === undefined) {
                    item[uniqueKey] = getUniqueKey();
                }
            }
        }
        return list;
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
     * @param {*[]} list
     * @param {*[]} prev
     * @param {string} [hashField]
     */
    function diff(list, prev, hashField) {
        var diff = [];
        var iList = 0;
        var iPrev = 0;

        if (!hashField) {
            hashListItems(list, HASH_FIELD_NAME);
            hashListItems(prev, HASH_FIELD_NAME);
        }

        var listIndexMap = buildIndexMap(list, hashField);
        var prevIndexMap = buildIndexMap(prev, hashField);

        for (; iList < list.length || iPrev < prev.length;) {
            var listItem = list[iList];
            var prevItem = prev[iPrev];

            if (iList >= list.length) {

                diff.push({ item: prevItem, state: DIFF_DELETED });
                ++iPrev;

            } else if (iPrev >= prev.length) {

                diff.push({ item: listItem, state: DIFF_CREATED });
                ++iList;

            } else if (listItem !== prevItem) {

                var prevItemIndex;
                var listItemIndex;

                if (hashField) {
                    prevItemIndex = maybe(prevIndexMap[listItem[hashField]], -1);
                    listItemIndex = maybe(listIndexMap[prevItem[hashField]], -1);
                } else {
                    prevItemIndex = maybe(prevIndexMap[listItem], -1);
                    listItemIndex = maybe(listIndexMap[prevItem], -1);
                }

                var isCreated = prevItemIndex === -1;
                var isDeleted = listItemIndex === -1;

                if (isCreated) {
                    diff.push({ item: listItem, state: DIFF_CREATED });
                    ++iList;
                }

                if (!isCreated && !isDeleted) { // moved
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
                }

            } else {
                diff.push({ item: listItem, state: DIFF_NOT_MODIFIED });
                ++iList;
                ++iPrev;
            }
        }

        return diff;
    }

    // exports ////////////////////////////////////////////////////////////////

    diff.NOT_MODIFIED = DIFF_NOT_MODIFIED;
    diff.CREATED = DIFF_CREATED;
    diff.MOVED = DIFF_MOVED;
    diff.DELETED = DIFF_DELETED;
    diff.getUniqueKey = getUniqueKey;
    diff.hashListItems = hashListItems;
    diff.buildIndexMap = buildIndexMap;

    return diff;
}));