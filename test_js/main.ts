import {
  createWindow,
  getPrimaryMonitor,
  mainloop,
} from "https://deno.land/x/dwm@0.3.6/mod.ts";

const width = 800;
const height = 600;

await navigator.gpu.requestAdapter();

let cs = 1;

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
