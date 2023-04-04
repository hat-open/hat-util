// TODO docs

export type DraggerMouseHandler = (evt: MouseEvent) => void;

export type DraggerMoveHandler = (evt: MouseEvent, dx: number, dy: number) => void;

export type DraggerCreateMoveHandler = (evt: MouseEvent) => DraggerMoveHandler | null;

type Dragger = {
    initX: number,
    initY: number,
    moveHandler: DraggerMoveHandler;
}


const draggers: Dragger[] = [];


export function draggerMouseDownHandler(
    createMoveHandlerCb: DraggerCreateMoveHandler
): DraggerMouseHandler {
    return evt => {
        const moveHandler = createMoveHandlerCb(evt);
        if (!moveHandler)
            return;

        draggers.push({
            initX: evt.screenX,
            initY: evt.screenY,
            moveHandler: moveHandler
        });
    };
}


document.addEventListener('mousemove', evt => {
    for (const dragger of draggers) {
        const dx = evt.screenX - dragger.initX;
        const dy = evt.screenY - dragger.initY;
        dragger.moveHandler(evt, dx, dy);
    }
});


document.addEventListener('mouseup', () => {
    draggers.splice(0);
});
