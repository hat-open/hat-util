import './mock.js';

import * as u from '../../build/js/index.js';


const data = {};
const patch = [];

for (let i = 0; i < 10000; ++i) {
    data[`key ${i}`] = {a: 1, b: 2, c: 3, d: 4, e: 5};

    if (i % 100 == 0) {
        patch.push({op: 'replace', path: `/key ${i}/a`, value: 42})
    }
}

console.time('patch');
const result = u.patch(patch, data);
console.timeEnd('patch');
