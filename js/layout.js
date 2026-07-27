export const CANVAS_ASPECT_RATIO = 480 / 600;

export function computeFitSize(availableWidth, availableHeight, aspectRatio) {
  const safeWidth = Math.max(0, availableWidth);
  const safeHeight = Math.max(0, availableHeight);

  let width = safeWidth;
  let height = width / aspectRatio;

  if (height > safeHeight) {
    height = safeHeight;
    width = height * aspectRatio;
  }

  return { width, height };
}

export function fitCanvasToContainer(canvas, container, reservedHeight) {
  const { width, height } = computeFitSize(
    container.clientWidth,
    container.clientHeight - reservedHeight,
    CANVAS_ASPECT_RATIO
  );
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
}

export function watchCanvasFit(canvas, container, reservedEl) {
  const update = () => {
    const reservedHeight = reservedEl ? reservedEl.offsetHeight : 0;
    fitCanvasToContainer(canvas, container, reservedHeight);
  };

  update();
  window.addEventListener("resize", update);
  window.addEventListener("orientationchange", update);
  if (window.visualViewport) {
    window.visualViewport.addEventListener("resize", update);
  }

  return update;
}
