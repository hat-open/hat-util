import { curry } from './curry';
import { JData } from './json';
import { isArray, isObject, strictParseInt, equals } from './misc';


type OpAdd = {
    op: 'add',
    path: string,
    value: JData
};

type OpRemove = {
    op: 'remove',
    path: string
};

type OpReplace = {
    op: 'replace',
    path: string,
    value: JData
};

type OpMove = {
    op: 'move',
    from: string,
    path: string
};

type OpCopy = {
    op: 'copy',
    from: string,
    path: string
};

type OpTest = {
    op: 'test',
    path: string,
    value: JData
};

type Operation = OpAdd | OpRemove | OpReplace | OpMove | OpCopy | OpTest;

type Pointer = string[];

export type JPatch = Operation[];


export const patch = curry((
    diff: JPatch,
    data: JData
): JData => {
    // @ts-ignore
    const reducer = (acc: JData, i: Operation) => operations[i.op](i, acc);
    return diff.reduce(reducer, data);
});

function opAdd(op: OpAdd, data: JData): JData {
    const path = parsePointer(op.path);
    return _add(path, op.value, data);
}

function opRemove(op: OpRemove, data: JData): JData {
    const path = parsePointer(op.path);
    return _remove(path, data);
}

function opReplace(op: OpReplace, data: JData): JData {
    const path = parsePointer(op.path);
    return _replace(path, op.value, data);
}

function opMove(op: OpMove, data: JData): JData {
    const from = parsePointer(op.from);
    const path = parsePointer(op.path);
    if (path.length > from.length && equals(from, path.slice(0, from.length)))
        throw Error("path can't be child of from");
    const val = _get(from, data);
    return _add(path, val, _remove(from, data));
}

function opCopy(op: OpCopy, data: JData): JData {
    const from = parsePointer(op.from);
    const path = parsePointer(op.path);
    const val = _get(from, data);
    return _add(path, val, data);
}

function opTest(op: OpTest, data: JData): JData {
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

function parsePointer(pointer: string): Pointer {
    if (pointer == '')
        return [];
    const segments = pointer.split('/');
    if (segments[0] != '')
        throw Error("invalid pointer");
    return segments.slice(1).map(unescapePointerSegment);
}

function* islice<T>(x: T[], start: number, stop?: number) {
    if (stop === undefined || stop > x.length)
        stop = x.length;
    for (let i = start; start < stop; i += 1)
        yield x[i];
}

function _add(path: Pointer, val: JData, data: JData): JData {
    if (path.length < 1)
        return val;

    const key = path[0];

    if (path.length < 2) {
        if (isArray(data)) {
            if (key == '-')
                return [...data, val];
            const index = strictParseInt(key);
            if (Number.isNaN(index) || index > data.length - 1 || index < 0)
                throw Error("invalid array index");
            return [...islice(data, 0, index), val, ...islice(data, index)];
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
            ...islice(data, 0, index),
            _add(path.slice(1), val, data[index]),
            ...islice(data, index + 1)
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

function _remove(path: Pointer, data: JData): JData {
    if (path.length < 1)
        return null;

    const key = path[0];

    if (path.length < 2) {
        if (isArray(data)) {
            const index = strictParseInt(key);
            if (Number.isNaN(index) || index > data.length - 1 || index < 0)
                throw Error("invalid array index");
            return [...islice(data, 0, index), ...islice(data, index + 1)];
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
            ...islice(data, 0, index),
            _remove(path.slice(1), data[index]),
            ...islice(data, index + 1)
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

function _replace(path: Pointer, val: JData, data: JData): JData {
    if (path.length < 1)
        return val;

    const key = path[0];

    if (path.length < 2) {
        if (isArray(data)) {
            const index = strictParseInt(key);
            if (Number.isNaN(index) || index > data.length - 1 || index < 0)
                throw Error("invalid array index");
            return [...islice(data, 0, index), val, ...islice(data, index + 1)];
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
            ...islice(data, 0, index),
            _replace(path.slice(1), val, data[index]),
            ...islice(data, index + 1)
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

function _get(path: Pointer, data: JData): JData {
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
