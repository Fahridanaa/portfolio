/// <reference types="@webgpu/types" />

const MIN_WIDTH = 1360;
const TARGET_FPS = 24;
const MAX_PIXELS = 1_600_000;

const SHADER = /* wgsl */ `
struct Uniforms {
  resolution: vec2f,
  time: f32,
  pad: f32,
}

@group(0) @binding(0) var<uniform> u: Uniforms;

fn hash21(p: vec2f) -> f32 {
  var p3 = fract(vec3f(p.x, p.y, p.x) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

fn valueNoise(p: vec2f) -> f32 {
  let i = floor(p);
  let f = fract(p);
  let w = f * f * (3.0 - 2.0 * f);
  let a = hash21(i);
  let b = hash21(i + vec2f(1.0, 0.0));
  let c = hash21(i + vec2f(0.0, 1.0));
  let d = hash21(i + vec2f(1.0, 1.0));
  return mix(mix(a, b, w.x), mix(c, d, w.x), w.y);
}

fn fbm(p: vec2f) -> f32 {
  var value = 0.0;
  var amplitude = 0.5;
  var q = p;
  for (var i = 0; i < 3; i++) {
    value += amplitude * valueNoise(q);
    q = q * 2.03 + vec2f(17.1, 9.7);
    amplitude *= 0.5;
  }
  return value;
}

fn tone(n: f32) -> vec3f {
  let green = vec3f(0.16, 0.34, 0.20);
  let blue = vec3f(0.30, 0.44, 0.56);
  return mix(green, blue, smoothstep(0.38, 0.78, n));
}

@vertex
fn vs(@builtin(vertex_index) index: u32) -> @builtin(position) vec4f {
  var positions = array<vec2f, 3>(
    vec2f(-1.0, -1.0),
    vec2f(3.0, -1.0),
    vec2f(-1.0, 3.0),
  );
  return vec4f(positions[index], 0.0, 1.0);
}

@fragment
fn fs(@builtin(position) position: vec4f) -> @location(0) vec4f {
  let uv = position.xy / u.resolution;
  let aspect = u.resolution.x / u.resolution.y;
  let p = vec2f(uv.x * aspect, uv.y) * 1.45;
  let t = u.time * 0.012;

  // Two offset noise fields pull the pattern apart very slowly. The second
  // field also feeds the filaments, so the lines never slide like a texture.
  let q = vec2f(
    fbm(p * 0.85 + vec2f(0.0, t * 0.55)),
    fbm(p * 0.85 + vec2f(4.7, -t * 0.42)),
  );
  let n = fbm(p + q * 1.35 + vec2f(t * 0.12, -t * 0.08));
  let n2 = fbm(p * 1.7 + q * 0.9 + vec2f(8.2, 3.1));

  // A diluted ink wash holds the color; thin filaments give it a drawn edge.
  let wash = smoothstep(0.40, 0.80, n);
  var alpha = wash * 0.18;
  let f = n * 22.0 + n2 * 4.0 + u.time * 0.06;
  let distanceToLine = abs(fract(f + 0.5) - 0.5);
  let width = max(fwidth(f), 0.001);
  let line = 1.0 - smoothstep(0.25, 1.05, distanceToLine / width);
  alpha += line * 0.17;

  var color = mix(tone(n), vec3f(0.13, 0.27, 0.18), line * 0.35);
  color = mix(color, vec3f(0.18, 0.36, 0.22), smoothstep(0.55, 0.9, n2) * 0.2);

  // Static per-pixel noise stops wide washes from banding on 8-bit screens.
  let dither = (hash21(position.xy) - 0.5) * 0.006;
  alpha = clamp(alpha + dither, 0.0, 0.36);

  return vec4f(color * alpha, alpha);
}
`;

function pageVisible() {
	const prerendering = (
		document as Document & { prerendering?: boolean }
	).prerendering;
	return document.visibilityState === "visible" && !prerendering;
}

export function startAmbientBackground(canvas: HTMLCanvasElement) {
	const wide = window.matchMedia(`(min-width: ${MIN_WIDTH}px)`);
	let booted = false;

	const maybeBoot = () => {
		if (booted || !wide.matches || !pageVisible()) return;
		booted = true;
		void boot(canvas, wide).catch((error: unknown) => {
			console.warn("[ambient] WebGPU background disabled.", error);
		});
	};

	wide.addEventListener("change", maybeBoot);
	document.addEventListener("visibilitychange", maybeBoot);
	document.addEventListener("prerenderingchange", maybeBoot);
	maybeBoot();
}

async function boot(canvas: HTMLCanvasElement, wide: MediaQueryList) {
	const gpu = navigator.gpu;
	if (!gpu) return;

	const adapter = await gpu.requestAdapter({ powerPreference: "low-power" });
	if (!adapter) return;

	const device = await adapter.requestDevice();
	const context = canvas.getContext("webgpu");
	if (!context) return;

	const format = gpu.getPreferredCanvasFormat();
	context.configure({ device, format, alphaMode: "premultiplied" });

	const module = device.createShaderModule({ code: SHADER });
	const compilation = await module.getCompilationInfo();
	const errors = compilation.messages.filter(
		(message) => message.type === "error",
	);
	if (errors.length > 0) {
		throw new Error(errors.map((message) => message.message).join("\n"));
	}

	const pipeline = device.createRenderPipeline({
		layout: "auto",
		vertex: { module, entryPoint: "vs" },
		fragment: {
			module,
			entryPoint: "fs",
			targets: [{ format }],
		},
	});

	const uniforms = device.createBuffer({
		size: 16,
		usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
	});
	const bindGroup = device.createBindGroup({
		layout: pipeline.getBindGroupLayout(0),
		entries: [{ binding: 0, resource: { buffer: uniforms } }],
	});

	const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
	let width = 0;
	let height = 0;
	let time = 0;
	let lastFrame = performance.now();
	let frameRequest = 0;
	let stopped = false;

	const resize = () => {
		const cssWidth = Math.max(1, window.innerWidth);
		const cssHeight = Math.max(1, window.innerHeight);
		const scale = Math.min(
			window.devicePixelRatio || 1,
			Math.sqrt(MAX_PIXELS / (cssWidth * cssHeight)),
		);
		const nextWidth = Math.max(1, Math.round(cssWidth * scale));
		const nextHeight = Math.max(1, Math.round(cssHeight * scale));
		if (nextWidth === width && nextHeight === height) return false;
		width = nextWidth;
		height = nextHeight;
		canvas.width = width;
		canvas.height = height;
		return true;
	};

	const draw = () => {
		device.queue.writeBuffer(
			uniforms,
			0,
			new Float32Array([width, height, time, 0]),
		);
		const encoder = device.createCommandEncoder();
		const pass = encoder.beginRenderPass({
			colorAttachments: [
				{
					view: context.getCurrentTexture().createView(),
					clearValue: { r: 0, g: 0, b: 0, a: 0 },
					loadOp: "clear",
					storeOp: "store",
				},
			],
		});
		pass.setPipeline(pipeline);
		pass.setBindGroup(0, bindGroup);
		pass.draw(3);
		pass.end();
		device.queue.submit([encoder.finish()]);
	};

	const stop = () => {
		if (frameRequest !== 0) cancelAnimationFrame(frameRequest);
		frameRequest = 0;
	};

	const teardown = () => {
		if (stopped) return;
		stopped = true;
		stop();
		document.documentElement.removeAttribute("data-ambient");
		device.destroy();
	};

	const tick = (now: number) => {
		frameRequest = 0;
		if (stopped || document.hidden || reduceMotion.matches || !wide.matches) {
			return;
		}
		if (now - lastFrame >= 1000 / TARGET_FPS) {
			time += Math.min((now - lastFrame) / 1000, 0.1);
			lastFrame = now;
			try {
				draw();
			} catch {
				teardown();
				return;
			}
		}
		frameRequest = requestAnimationFrame(tick);
	};

	const start = () => {
		if (
			stopped ||
			frameRequest !== 0 ||
			reduceMotion.matches ||
			document.hidden ||
			!wide.matches
		) {
			return;
		}
		lastFrame = performance.now();
		frameRequest = requestAnimationFrame(tick);
	};

	const show = () => {
		if (!stopped) document.documentElement.setAttribute("data-ambient", "on");
	};

	const redraw = () => {
		if (stopped || !resize()) return;
		if (reduceMotion.matches || document.hidden || !wide.matches) {
			try {
				draw();
				show();
			} catch {
				teardown();
			}
		}
	};

	resize();
	draw();
	show();
	start();

	window.addEventListener("resize", redraw);
	document.addEventListener("visibilitychange", () => {
		if (document.hidden) stop();
		else start();
	});
	reduceMotion.addEventListener("change", () => {
		if (reduceMotion.matches) stop();
		else start();
	});
	wide.addEventListener("change", () => {
		if (!wide.matches) {
			stop();
			document.documentElement.removeAttribute("data-ambient");
			return;
		}
		redraw();
		show();
		start();
	});
	device.lost.then((info) => {
		if (info.reason !== "destroyed") teardown();
	});
}
