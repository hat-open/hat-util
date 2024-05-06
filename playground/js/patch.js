import './mock.js';

import * as u from '../../build/js/index.js';
import jsonpatch from 'fast-json-patch';
import jiff from 'jiff';


const data = {};
const patch = [];

for (let i = 0; i < 10000; ++i) {
    data[`key ${i}`] = {a: 1, b: 2, c: 3, d: 4, e: 5};

    if (i % 100 == 0) {
        patch.push({op: 'replace', path: `/key ${i}/a`, value: 42})
    }
}

for (let i = 0; i < 3; ++i) {
    console.time('u.patch');
    u.patch(patch, data);
    console.timeEnd('u.patch');

    console.time('fast-json-patch');
    jsonpatch.applyPatch(data, patch, false, false).newDocument;
    console.timeEnd('fast-json-patch');

    console.time('jiff');
    jiff.patch(patch, data);
    console.timeEnd('jiff');
}
