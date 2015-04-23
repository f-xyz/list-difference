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

    // todo: remove support of value items (?) -> simplify code
    // todo: remove trackBy default value (?)

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
     * @param {string} primaryKey
     * @returns {{}}
     */
    function buildHashToIndexMap(list, primaryKey) {
        var map = {};
        for (var i = 0; i < list.length; ++i) {
            var item = list[i];
            if (primaryKey) {
                map[item[primaryKey]] = i;
            } else {
                map[item] = i;
                addHashFieldToListItem(item, TRACK_BY_FIELD);
            }
        }
        return map;
    }

    /**
     * @param item
     * @param {string} primaryKey
     * @returns {*} item
     */
    function addHashFieldToListItem(item, primaryKey) {
        if (typeof item === 'object' && item !== null) {
            item[primaryKey] = getUniqueKey();
        }
        return item;
    }

    /**
     * Calculates difference between two arrays.
     * Returns array of { item: T, state: int }.
     * Where state means: 0 - not modified, 1 - created, -1 - deleted.
     * @param {Array} newList
     * @param {Array} oldList
     * @param {string} [primaryKey] item's unique index field
     */
    function diff(newList, oldList, primaryKey) {
        var diff = [];
        var newIndex = 0;
        var oldIndex = 0;

        var newIndexMap = buildHashToIndexMap(newList, primaryKey);
        var oldIndexMap = buildHashToIndexMap(oldList, primaryKey);

        function addEntry(item, state, newIndex, prevIndex) {
            diff.push({
                item: item,
                state: state,
                oldIndex: prevIndex,
                newIndex: newIndex
            });
        }

        for (; newIndex < newList.length || oldIndex < oldList.length;) {
            var newItem = newList[newIndex];
            var oldItem = oldList[oldIndex];

            if (newIndex >= newList.length) {

                addEntry(oldItem, DIFF_DELETED, -1, oldIndex);
                ++oldIndex;

            } else if (oldIndex >= oldList.length) {

                addEntry(newItem, DIFF_CREATED, newIndex, -1);
                ++newIndex;

            } else if (newItem !== oldItem) {

                var indexOfNewItemInOldList;
                var indexOfOldItemInNewList;

                if (primaryKey) {
                    indexOfNewItemInOldList = maybe(oldIndexMap[newItem[primaryKey]], -1);
                    indexOfOldItemInNewList = maybe(newIndexMap[oldItem[primaryKey]], -1);
                } else if (typeof newItem === 'object' && typeof oldItem === 'object') {
                    indexOfNewItemInOldList = maybe(oldIndexMap[TRACK_BY_FIELD], -1);
                    indexOfOldItemInNewList = maybe(newIndexMap[TRACK_BY_FIELD], -1);
                } else {
                    indexOfNewItemInOldList = maybe(oldIndexMap[newItem], -1);
                    indexOfOldItemInNewList = maybe(newIndexMap[oldItem], -1);
                }

                var isCreated = indexOfNewItemInOldList === -1;
                var isDeleted = indexOfOldItemInNewList === -1;

                // created
                if (isCreated) {
                    addEntry(newItem, DIFF_CREATED, newIndex, -1);
                    ++newIndex;
                }

                // moved
                if (!isCreated && !isDeleted) {
                    if (newIndex === indexOfNewItemInOldList) {
                        // for reference types with given trackBy
                        addEntry(oldItem, DIFF_NOT_MODIFIED);
                    } else {
                        addEntry(newItem, DIFF_MOVED, newIndex, indexOfOldItemInNewList);
                    }
                    ++newIndex;
                    ++oldIndex;
                }

                // deleted
                if (isDeleted) {
                    addEntry(oldItem, DIFF_DELETED, -1, oldIndex);
                    ++oldIndex;
                }

            } else {
                addEntry(oldItem, DIFF_NOT_MODIFIED, newIndex, oldIndex);
                ++newIndex;
                ++oldIndex;
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
