import { curry } from './curry.js';
import { _islice } from './iter.js';
import { JData } from './json.js';
import { isArray, isObject, strictParseInt, equals } from './misc.js';


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


export const patch = curry((
    diff: JPatch,
    data: JData
): JData => {
    const reducer = (acc: JData, i: JPatchOp) => operations[i.op](i as any, acc);
    return diff.reduce(reducer, data);
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

function unescapePointerSegment(segment: string): string {
    return segment.replaceAll('~1', '/').replaceAll('~0', '~');
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
            if (key == '-')
                return [...data, val];
            const index = strictParseInt(key);
            if (Number.isNaN(index) || index > data.length || index < 0)
                throw Error("invalid array index");
            return [
                ..._islice(0, index, data),
                val,
                ..._islice(index, null, data)
            ];
        }

        if (isObject(data))
            return Object.assign({}, data, {[key]: val});

        throw Error("invalid data type");
    }

    if (isArray(data)) {
        const index = strictParseInt(key);
        if (Number.isNaN(index) || index > data.length - 1 || index < 0)
            throw Error("invalid array index");
        return [
            ..._islice(0, index, data),
            _add(path.slice(1), val, data[index]),
            ..._islice(index + 1, null, data)
        ];
    }

    if (isObject(data)) {
        if (!(key in data))
            throw Error("invalid object key");
        return Object.assign(
            {}, data, {[key]: _add(path.slice(1), val, data[key])});
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
            return [
                ..._islice(0, index, data),
                ..._islice(index + 1, null, data)
            ];
        }

        if (isObject(data)) {
            if (!(key in data))
                throw Error("invalid object key");
            const ret = Object.assign({}, data);
            delete ret[key];
            return ret;
        }

        throw Error("invalid data type");
    }

    if (isArray(data)) {
        const index = strictParseInt(key);
        if (Number.isNaN(index) || index > data.length - 1 || index < 0)
            throw Error("invalid array index");
        return [
            ..._islice(0, index, data),
            _remove(path.slice(1), data[index]),
            ..._islice(index + 1, null, data)
        ];
    }

    if (isObject(data)) {
        if (!(key in data))
            throw Error("invalid object key");
        return Object.assign(
            {}, data, {[key]: _remove(path.slice(1), data[key])});
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
            return [
                ..._islice(0, index, data),
                val,
                ..._islice(index + 1, null, data)];
        }

        if (isObject(data)) {
            if (!(key in data))
                throw Error("invalid object key");
            return Object.assign({}, data, {[key]: val});
        }

        throw Error("invalid data type");
    }

    if (isArray(data)) {
        const index = strictParseInt(key);
        if (Number.isNaN(index) || index > data.length - 1 || index < 0)
            throw Error("invalid array index");
        return [
            ..._islice(0, index, data),
            _replace(path.slice(1), val, data[index]),
            ..._islice(index + 1, null, data)
        ];
    }

    if (isObject(data)) {
        if (!(key in data))
            throw Error("invalid object key");
        return Object.assign(
            {}, data, {[key]: _replace(path.slice(1), val, data[key])});
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
