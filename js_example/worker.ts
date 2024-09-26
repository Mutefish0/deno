import { initWebGPU } from "./utils.ts";

const OffscreenCanvas = (Deno as any).OffscreenCanvas;

self.addEventListener("message", (event: any) => {
  if (event.data.type === "init") {
    const { surface } = event.data;

    const canvas = new OffscreenCanvas(
      surface,
    ) as Deno.UnsafeWindowSurface;

    initWebGPU(canvas);
  }
});
