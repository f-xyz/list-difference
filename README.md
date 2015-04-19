*OUTDATED*
TODO: rewrite README

Calculates difference between two arrays.
If elements are objects it compares them by reference or using provided field (trackBy parameter).

Let's consider two lists:

A `[1, 2, 3, 5, 6]` and B `[2, 1, 3, 4, 5]`

Returned value will be:

|A Item | B Item | State             |
|-------|--------|-------------------|
| 1     | 2      | moved from 1 to 0 |
| 2     | 1      | moved from 0 to 1 |
| 3     | 3      | not modified      |
|       | 4      | deleted           |
| 5     | 5      | not modified      |
| 6     |        | created           |

`diff` will return an array of { item: T, state: number, indexOld: number, indexNew: number }.
Where state means:
  * 0 - not modified
  * 1 - created
  * 2 - moved
  * -1 - deleted

Returned value will look like:
```
[ { item: 1, state: 2, oldIndex: 1, newIndex: 0 },
  { item: 2, state: 2, oldIndex: 0, newIndex: 1 },
  { item: 3, state: 0 },
  { item: 4, state: -1 },
  { item: 5, state: 0 },
  { item: 6, state: 1 } ]
```
