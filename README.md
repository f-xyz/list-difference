Calculates difference between two arrays.
If elements are objects it compares them by reference.

Let's consider two lists:

`[1, 2, 4, 5]` and
`[1, 2, 3, 6]`

* 1 1 -> not changed
* 2 2 -> not changed
*   3 -> deleted
* 4   -> created
* 5   -> created
*   6 -> deleted

`diff` will return an array of { item: T, state: number }.
Where state means:
  * 0 - not modified
  * 1 - created
  * -1 - deleted

Returned value will look like:
```
[
    { item: 1: state: 0 },
    { item: 2: state: 0 },
    { item: 3: state: -1 },
    { item: 4: state: 1 },
    { item: 5: state: 1 },
    { item: 6: state: -1 },
]
```
