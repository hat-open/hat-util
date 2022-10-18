import { isString, isArray, isObject } from './misc';


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

export function* flattenVNodeChildren(
    children: VNodeChild[]
): Generator<string | VNode, void, unknown> {
    for (const child of children) {
        if (isString(child) || isVNode(child)) {
            yield child;
        } else {
            yield* flattenVNodeChildren(child);
        }
    }
}
