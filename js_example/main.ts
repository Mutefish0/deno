import { createWindow, mainloop } from "https://deno.land/x/dwm@0.3.6/mod.ts";

const width = 800;
const height = 600;

await navigator.gpu.requestAdapter();

const window = createWindow({
  title: "test",
  width: width,
  height: height,
  resizable: false,
});

const surface = window.windowSurface();

const worker = new Worker(new URL("./worker.ts", import.meta.url).href, {
  type: "module",
});

worker.postMessage({
  type: "init",
  surface: (surface as any).transferControlToOffscreen(),
});

let count = 0;
let lastTime = 0;

mainloop((time) => {
  count++;
  if (time - lastTime > 1000) {
    console.log("Main FPS: ", count);
    count = 0;
    lastTime = time;
  }
});
