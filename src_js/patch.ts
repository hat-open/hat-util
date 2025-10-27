import { curry } from './curry.js';
// import { _islice } from './iter.js';
import { JData } from './json.js';
import { isArray, isObject, strictParseInt, equals, clone } from './misc.js';


export type JPatchOpAdd = {
    op: 'add',
    path: string,
    value: JData
};

export type JPatchOpRemove = {
    op: 'remove',
    path: string
};

export type JPatchOpReplace = {
    op: 'replace',
    path: string,
    value: JData
};

export type JPatchOpMove = {
    op: 'move',
    from: string,
    path: string
};

export type JPatchOpCopy = {
    op: 'copy',
    from: string,
    path: string
};

export type JPatchOpTest = {
    op: 'test',
    path: string,
    value: JData
};

export type JPatchOp = JPatchOpAdd | JPatchOpRemove | JPatchOpReplace |
                       JPatchOpMove | JPatchOpCopy | JPatchOpTest;

export type JPatch = JPatchOp[];

type JPatchPointer = string[];

export const diff = curry((
    oldData: JData,
    newData: JData
): JPatch => {
    return Array.from(_diff([], oldData, newData));
});

function* _diff(pointer: JPatchPointer, oldData: JData, newData: JData): Generator<JPatchOp, void, void> {

    if (oldData === newData)
        return;

    if (isArray(oldData) && isArray(newData)) {
        if (oldData.length == 0 && newData.length == 0)
            return;

        if (oldData.length == 0 || newData.length == 0) {
            yield { op: 'replace', path: stringifyPointer(pointer), value: newData };
            return;
        }

        if (oldData.length == newData.length) {
            for (let i = 0; i < oldData.length; i++) {
                yield *_diff([...pointer, String(i)], oldData[i], newData[i]);
            }
            return;
        }

        if (oldData.length > newData.length) {
            let newIdx = 0;
            let toRemove = oldData.length - newData.length;

            for (let oldIdx = 0; oldIdx < oldData.length; oldIdx++) {
                if (newIdx < newData.length && oldData[oldIdx] === newData[newIdx]) {
                    newIdx++;
                } else if (toRemove > 0) {
                    yield {
                        op: 'remove',
                        path: stringifyPointer([...pointer, String(newIdx)])
                    };
                    toRemove--;
                } else {
                    yield* _diff([...pointer, String(newIdx)], oldData[oldIdx], newData[newIdx]);
                    newIdx++;
                }
            }

            return;
        }

        if (oldData.length < newData.length) {
            let oldIdx = 0;
            let toAdd = newData.length - oldData.length;

            for (let newIdx = 0; newIdx < newData.length; newIdx++) {
                if (oldIdx < oldData.length && oldData[oldIdx] === newData[newIdx]) {
                    oldIdx++;
                } else if (toAdd > 0) {
                    yield {
                        op: 'add',
                        path: stringifyPointer([...pointer, String(newIdx)]),
                        value: newData[newIdx]
                    };
                    toAdd--;
                } else {
                    yield* _diff([...pointer, String(newIdx)], oldData[oldIdx], newData[newIdx]);
                    oldIdx++;
                }
            }

            return;
        }

        return;
    }

    if (isObject(oldData) && isObject(newData)) {
        const oldKeys = Object.keys(oldData);
        const newKeys = Object.keys(newData);

        if (oldKeys.length == 0 && newKeys.length == 0)
            return;

        if (oldKeys.length == 0 || newKeys.length == 0) {
            yield { op: 'replace', path: stringifyPointer(pointer), value: newData };
            return;
        }

        for (const key of oldKeys) {
            if (!Object.hasOwn(newData, key))
                yield { op: 'remove', path: stringifyPointer([...pointer, key]) };
        }

        for (const key of newKeys) {
            if (!Object.hasOwn(oldData, key))
                yield { op: 'add', path: stringifyPointer([...pointer, key]), value: newData[key] };
            else
                yield* _diff([...pointer, key], oldData[key], newData[key]);
        }

        return;
    }

    yield { op: 'replace', path: stringifyPointer(pointer), value: newData };
}

export const patch = curry((
    diff: JPatch,
    data: JData
): JData => {
    const reducer = (acc: JData, i: JPatchOp) => operations[i.op](i as any, acc);

    // return diff.reduce(reducer, data);

    return diff.reduce(reducer, clone(data));
});

function opAdd(op: JPatchOpAdd, data: JData): JData {
    const path = parsePointer(op.path);
    return _add(path, op.value, data);
}

function opRemove(op: JPatchOpRemove, data: JData): JData {
    const path = parsePointer(op.path);
    return _remove(path, data);
}

function opReplace(op: JPatchOpReplace, data: JData): JData {
    const path = parsePointer(op.path);
    return _replace(path, op.value, data);
}

function opMove(op: JPatchOpMove, data: JData): JData {
    const from = parsePointer(op.from);
    const path = parsePointer(op.path);
    if (path.length > from.length && equals(from, path.slice(0, from.length)))
        throw Error("path can't be child of from");

    const val = _get(from, data);
    return _add(path, val, _remove(from, data));
}

function opCopy(op: JPatchOpCopy, data: JData): JData {
    const from = parsePointer(op.from);
    const path = parsePointer(op.path);
    const val = _get(from, data);
    return _add(path, val, data);
}

function opTest(op: JPatchOpTest, data: JData): JData {
    const path = parsePointer(op.path);
    const val = _get(path, data);
    if (!equals(val, op.value))
        throw Error("invalid value");

    return data;
}

const operations = {
    add: opAdd,
    remove: opRemove,
    replace: opReplace,
    move: opMove,
    copy: opCopy,
    test: opTest
};

function escapePointerSegment(segment: string): string {
    return segment.replaceAll('~', '~0').replaceAll('/', '~1');
}

function unescapePointerSegment(segment: string): string {
    return segment.replaceAll('~1', '/').replaceAll('~0', '~');
}

function stringifyPointer(pointer: JPatchPointer): string {
    if (pointer.length == 0)
        return '';

    return '/' + pointer.map(escapePointerSegment).join('/');
}

function parsePointer(pointer: string): JPatchPointer {
    if (pointer == '')
        return [];

    const segments = pointer.split('/');
    if (segments[0] != '')
        throw Error("invalid pointer");

    return segments.slice(1).map(unescapePointerSegment);
}

function _add(path: JPatchPointer, val: JData, data: JData): JData {
    if (path.length < 1)
        return val;

    const key = path[0];

    if (path.length < 2) {
        if (isArray(data)) {
            if (key == '-') {
                // return [...data, val];

                data.push(val);
                return data;
            }

            const index = strictParseInt(key);
            if (Number.isNaN(index) || index > data.length || index < 0)
                throw Error("invalid array index");

            // return [
            //     ..._islice(0, index, data),
            //     val,
            //     ..._islice(index, null, data)
            // ];

            data.splice(index, 0, val);
            return data;
        }

        if (isObject(data)) {
            // return Object.assign({}, data, {[key]: val});

            data[key] = val;
            return data;
        }

        throw Error("invalid data type");
    }

    if (isArray(data)) {
        const index = strictParseInt(key);
        if (Number.isNaN(index) || index > data.length - 1 || index < 0)
            throw Error("invalid array index");

        // return [
        //     ..._islice(0, index, data),
        //     _add(path.slice(1), val, data[index]),
        //     ..._islice(index + 1, null, data)
        // ];

        _add(path.slice(1), val, data[index]);
        return data;
    }

    if (isObject(data)) {
        if (!(key in data))
            throw Error("invalid object key");

        // return Object.assign(
        //     {}, data, {[key]: _add(path.slice(1), val, data[key])}
        // );

        _add(path.slice(1), val, data[key]);
        return data;
    }

    throw Error("invalid data type");
}

function _remove(path: JPatchPointer, data: JData): JData {
    if (path.length < 1)
        return null;

    const key = path[0];

    if (path.length < 2) {
        if (isArray(data)) {
            const index = strictParseInt(key);
            if (Number.isNaN(index) || index > data.length - 1 || index < 0)
                throw Error("invalid array index");

            // return [
            //     ..._islice(0, index, data),
            //     ..._islice(index + 1, null, data)
            // ];

            data.splice(index, 1);
            return data;
        }

        if (isObject(data)) {
            if (!(key in data))
                throw Error("invalid object key");

            // const ret = Object.assign({}, data);
            // delete ret[key];
            // return ret;

            delete data[key];
            return data;
        }

        throw Error("invalid data type");
    }

    if (isArray(data)) {
        const index = strictParseInt(key);
        if (Number.isNaN(index) || index > data.length - 1 || index < 0)
            throw Error("invalid array index");

        // return [
        //     ..._islice(0, index, data),
        //     _remove(path.slice(1), data[index]),
        //     ..._islice(index + 1, null, data)
        // ];

        _remove(path.slice(1), data[index]);
        return data;
    }

    if (isObject(data)) {
        if (!(key in data))
            throw Error("invalid object key");

        // return Object.assign(
        //     {}, data, {[key]: _remove(path.slice(1), data[key])}
        // );

        _remove(path.slice(1), data[key]);
        return data;
    }

    throw Error("invalid data type");
}

function _replace(path: JPatchPointer, val: JData, data: JData): JData {
    if (path.length < 1)
        return val;

    const key = path[0];

    if (path.length < 2) {
        if (isArray(data)) {
            const index = strictParseInt(key);
            if (Number.isNaN(index) || index > data.length - 1 || index < 0)
                throw Error("invalid array index");

            // return [
            //     ..._islice(0, index, data),
            //     val,
            //     ..._islice(index + 1, null, data)
            // ];

            data[index] = val;
            return data;
        }

        if (isObject(data)) {
            if (!(key in data))
                throw Error("invalid object key");

            // return Object.assign({}, data, {[key]: val});

            data[key] = val;
            return data;
        }

        throw Error("invalid data type");
    }

    if (isArray(data)) {
        const index = strictParseInt(key);
        if (Number.isNaN(index) || index > data.length - 1 || index < 0)
            throw Error("invalid array index");

        // return [
        //     ..._islice(0, index, data),
        //     _replace(path.slice(1), val, data[index]),
        //     ..._islice(index + 1, null, data)
        // ];

        _replace(path.slice(1), val, data[index]);
        return data;
    }

    if (isObject(data)) {
        if (!(key in data))
            throw Error("invalid object key");

        // return Object.assign(
        //     {}, data, {[key]: _replace(path.slice(1), val, data[key])}
        // );

        _replace(path.slice(1), val, data[key]);
        return data;
    }

    throw Error("invalid data type");
}

function _get(path: JPatchPointer, data: JData): JData {
    if (path.length < 1)
        return data;

    const key = path[0];

    if (isArray(data)) {
        const index = strictParseInt(key);
        if (Number.isNaN(index) || index > data.length - 1 || index < 0)
            throw Error("invalid array index");

        return _get(path.slice(1), data[index]);
    }

    if (isObject(data)) {
        if (!(key in data))
            throw Error("invalid object key");

        return _get(path.slice(1), data[key]);
    }

    throw Error("invalid data type");
}
