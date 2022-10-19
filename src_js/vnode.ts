import { curry } from './curry';
import { JPath } from './json';
import { isString, isArray, isObject, isNil } from './misc';


export type VNode = VNodeWithoutData | VNodeWithData;
export type VNodeWithoutData = [string, ...VNodeChild[]];
export type VNodeWithData = [string, VNodeData, ...VNodeChild[]];
export type VNodeData = Record<string, any>;
export type VNodeChild = string | VNode | VNodeChild[];


export function isVNodeWithoutData(node: VNode): node is VNodeWithoutData {
    return node.length < 2 || !isObject(node[1]);
}

export function isVNodeWithData(node: VNode): node is VNodeWithData {
    return node.length > 1 && isObject(node[1]);
}

export function isVNode(child: VNodeChild): child is VNode {
    return isArray(child) && child.length > 0 && isString(child[0]);
}

export function getVNodeChildren(node: VNode): VNodeChild[] {
    return node.slice(isVNodeWithData(node) ? 2 : 1) as VNodeChild[];
}

export function getFlatVNodeChildren(node: VNode): (string | VNode)[] {
    const children: (string | VNode)[] = [];
    const childrenStart = (isVNodeWithData(node) ? 2 : 1);
    for (let i = childrenStart; i < node.length; ++i) {
        const child = node[i] as VNodeChild;
        if (isString(child) || isVNode(child)) {
            children.push(child);
        } else {
            for (const flatChild of flattenVNodeChildren(child))
                children.push(flatChild);
        }
    }
    return children;
}

export function* flattenVNodeChildren(
    children: VNodeChild[]
): Generator<string | VNode> {
    for (const child of children) {
        if (isString(child) || isVNode(child)) {
            yield child;
        } else {
            yield* flattenVNodeChildren(child);
        }
    }
}

export function _changeVNodeData(
    fn: (data: VNodeData | null) => VNodeData | null,
    node: VNode
): VNode {
    const data = fn(isVNodeWithData(node) ? node[1] : null);
    if (isNil(data)) {
        if (isVNodeWithoutData(node))
            return node;
        const result = Array.from(node);
        result.splice(1, 1);
        return result as VNode;
    }
    return [node[0], data, ...getVNodeChildren(node)];
}

export const changeVNodeData = curry(_changeVNodeData);

export function _changeVNodeChildren(
    fn: (children: VNodeChild[]) => VNodeChild[],
    node: VNode
): VNode {
    const children = fn(getVNodeChildren(node));
    const head = node.slice(0, (isVNodeWithoutData(node) ? 1 : 2)) as VNode;
    return [...head, ...children];
}

export const changeVNodeChildren = curry(_changeVNodeChildren);

export function _queryVNodePath(
    selector: string,
    tree: VNodeChild
): JPath | null {
    const first = _queryAllVNodePaths(selector, tree).next();
    return (first.done ? null : first.value);
}

export const queryVNodePath = curry(_queryVNodePath);

export function* _queryAllVNodePaths(
    selector: string,
    tree: VNodeChild
): Generator<JPath> {
    if (isString(tree))
        return;
    if (isVNode(tree) && testSelector(selector, tree))
        yield [];
    const childrenStart = (isVNode(tree) ?
        (isVNodeWithData(tree) ? 2 : 1) :
        0
    );
    for (let i = childrenStart; i < tree.length; ++i)
        for (const path of _queryAllVNodePaths(selector, tree[i] as VNodeChild))
            yield [i, ...(path as JPath[])];
}

export const queryAllVNodePaths = curry(_queryAllVNodePaths);

function testSelector(selector: string, node: VNode): boolean {
    selector as any;
    node as any;

    // TODO

    return false;
}
