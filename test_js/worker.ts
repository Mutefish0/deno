const OffscreenCanvas = (Deno as any).OffscreenCanvas;

async function initWebGPU(surface: any) {
  const adapter = await navigator.gpu.requestAdapter();
  const device = await adapter!.requestDevice();

  const context = surface.getContext("webgpu");

  const format = navigator.gpu.getPreferredCanvasFormat();

  context.configure({ device, format, width: 800, height: 600 });

  const vertices = new Float32Array([
    0,
    0.5,
    0, // Vertex 1
    -0.5,
    -0.5,
    0, // Vertex 2
    0.5,
    -0.5,
    0, // Vertex 3
  ]);

  const vertexBuffer = device.createBuffer({
    size: vertices.byteLength,
    usage: GPUBufferUsage.VERTEX,
    mappedAtCreation: true,
  });

  new Float32Array(vertexBuffer.getMappedRange()).set(vertices);
  vertexBuffer.unmap();

  const shaderModule = device.createShaderModule({
    code: `
            @vertex
            fn vertex_main(@location(0) position: vec3<f32>) -> @builtin(position) vec4<f32> {
                return vec4<f32>(position, 1.0);
            }

            @fragment
            fn fragment_main() -> @location(0) vec4<f32> {
                return vec4<f32>(0.0, 1.0, 0.0, 1.0);  // Green color
            }
        `,
  });

  const pipelineLayout = device.createPipelineLayout({
    bindGroupLayouts: [],
  });

  const pipeline = device.createRenderPipeline({
    layout: pipelineLayout,
    vertex: {
      module: shaderModule,
      entryPoint: "vertex_main",
      buffers: [
        {
          arrayStride: 3 * 4,
          attributes: [
            {
              format: "float32x3",
              offset: 0,
              shaderLocation: 0,
            },
          ],
        },
      ],
    },
    fragment: {
      module: shaderModule,
      entryPoint: "fragment_main",
      targets: [{ format }],
    },
    primitive: {
      topology: "triangle-list",
    },
  });

  function render() {
    const commandEncoder = device.createCommandEncoder();
    const renderPass = commandEncoder.beginRenderPass({
      colorAttachments: [
        {
          view: context.getCurrentTexture().createView(),
          loadOp: "clear", // 需要指定 loadOp
          clearValue: { r: 0, g: 0, b: 0, a: 1 },
          storeOp: "store",
        },
      ],
    });

    renderPass.setPipeline(pipeline);
    renderPass.setVertexBuffer(0, vertexBuffer);
    renderPass.draw(3, 1, 0, 0);
    renderPass.end();

    device.queue.submit([commandEncoder.finish()]);

    surface.present();
  }

  let count = 0;
  let lastTime = 0;

  while (true) {
    const time = performance.now();
    count++;
    if (time - lastTime > 1000) {
      console.log("Render FPS: ", count);
      count = 0;
      lastTime = time;
    }
    render();
  }
}

self.addEventListener("message", (event: any) => {
  if (event.data.type === "init") {
    const { surface } = event.data;

    console.log("surface: ", surface);

    const canvas = new OffscreenCanvas(
      surface,
    ) as Deno.UnsafeWindowSurface;

    initWebGPU(canvas);
  }
});
