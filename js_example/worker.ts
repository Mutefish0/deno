import { initWebGPU } from "./utils.ts";

const OffscreenCanvas = (Deno as any).OffscreenCanvas;

self.addEventListener("message", async (event: any) => {
  if (event.data.type === "init") {
    const { surface } = event.data;

    const canvas = new OffscreenCanvas(
      surface,
    ) as Deno.UnsafeWindowSurface;

    const render = await initWebGPU(canvas);

    while (true) {
      render();
    }
  }
});
