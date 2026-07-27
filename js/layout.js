export const CANVAS_ASPECT_RATIO = 480 / 600;
export const MOBILE_CANVAS_SCALE = 0.8;
export const MOBILE_BREAKPOINT_PX = 720;

export function computeFitSize(availableWidth, availableHeight, aspectRatio, scale = 1) {
  const safeWidth = Math.max(0, availableWidth) * scale;
  const safeHeight = Math.max(0, availableHeight) * scale;

  let width = safeWidth;
  let height = width / aspectRatio;

  if (height > safeHeight) {
    height = safeHeight;
    width = height * aspectRatio;
  }

  return { width, height };
}

export function fitCanvasToContainer(canvas, container, reservedHeight, scale = 1) {
  const { width, height } = computeFitSize(
    container.clientWidth,
    container.clientHeight - reservedHeight,
    CANVAS_ASPECT_RATIO,
    scale
  );
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
}

export function watchCanvasFit(canvas, container, reservedEl) {
  const isMobileViewport = () =>
    typeof window.matchMedia === "function" &&
    window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT_PX}px)`).matches;

  const update = () => {
    const reservedHeight = reservedEl ? reservedEl.offsetHeight : 0;
    const scale = isMobileViewport() ? MOBILE_CANVAS_SCALE : 1;
    fitCanvasToContainer(canvas, container, reservedHeight, scale);
  };

  update();
  window.addEventListener("resize", update);
  window.addEventListener("orientationchange", update);
  if (window.visualViewport) {
    window.visualViewport.addEventListener("resize", update);
  }

  return update;
}
