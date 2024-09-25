import {
  createWindow,
  getPrimaryMonitor,
  mainloop,
  // @ts-ignore
} from "https://deno.land/x/dwm@0.3.6/mod.ts";

const OffscreenCanvas = (Deno as any).OffscreenCanvas;

const width = 800;
const height = 600;

// @ts-ignore
const adapter = await navigator.gpu.requestAdapter();
const device = await adapter!.requestDevice();

let cs = 1;

// @ts-ignore
if (Deno.build.os === "windows") {
  const monitor = getPrimaryMonitor();
  cs = monitor.contentScale.x;
}

const window = createWindow({
  title: "test",
  width: width * cs,
  height: height * cs,
  resizable: false,
});

const surface = window.windowSurface();

const worker = new Worker(new URL("./worker.ts", import.meta.url).href, {
  type: "module",
});

const ptr = (surface as any).transferControlToOffscreen();

console.log('ptr', ptr);

worker.postMessage({
  type: "init",
  surface: ptr,
});

//console.log("OffscreenCanvas is available: ", (Deno as any).OffscreenCanvas);
