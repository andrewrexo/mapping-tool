interface DraggableProps {
  position: { left: number; top: number };
}

const createDraggable = ({ position }: DraggableProps) => {
  let moving = $state(false);
  let left = $state(position.left);
  let top = $state(position.top);
  let dragStartTime = $state(0);
  let dragStartPosition = $state({ x: 0, y: 0 });
  let initialOffset = $state({ x: 0, y: 0 });

  function onMouseDown(e: MouseEvent) {
    if (e.button !== 0) return;

    const target = e.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    initialOffset = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };

    dragStartTime = Date.now();
    dragStartPosition = { x: e.clientX, y: e.clientY };
  }

  function onMouseMove(e: MouseEvent) {
    if (dragStartTime === 0) return;

    const currentTime = Date.now();
    const dragDuration = currentTime - dragStartTime;
    const dragDistance = Math.sqrt(
      Math.pow(e.clientX - dragStartPosition.x, 2) + Math.pow(e.clientY - dragStartPosition.y, 2)
    );

    if (!moving && dragDuration > 50 && dragDistance > 5) {
      moving = true;
      if (left === 0 && top === 0) {
        left = e.clientX - initialOffset.x;
        top = e.clientY - initialOffset.y;
      }
    }

    if (moving) {
      left += e.movementX;
      top += e.movementY;
    }
  }

  function onMouseUp() {
    moving = false;
    dragStartTime = 0;
  }

  return {
    get left() {
      return left;
    },
    get top() {
      return top;
    },
    onMouseDown,
    onMouseMove,
    onMouseUp
  };
};

export default createDraggable;
