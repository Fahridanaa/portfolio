/// <reference types="@webgpu/types" />

const MIN_WIDTH = 1360;
const TARGET_FPS = 24;
const MAX_PIXELS = 1_600_000;

const WEBGPU_SHADER = /* wgsl */ `
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

// The WebGL shader mirrors the WGSL above line for line. Keep them in sync so
// both renderers draw the same ink.
const WEBGL_VERTEX_SHADER = /* glsl */ `#version 300 es
void main() {
  vec2 positions[3] = vec2[3](
    vec2(-1.0, -1.0),
    vec2(3.0, -1.0),
    vec2(-1.0, 3.0)
  );
  gl_Position = vec4(positions[gl_VertexID], 0.0, 1.0);
}
`;

const WEBGL_FRAGMENT_SHADER = /* glsl */ `#version 300 es
precision highp float;

uniform vec2 u_resolution;
uniform float u_time;

out vec4 outColor;

float hash21(vec2 p) {
  vec3 p3 = fract(vec3(p.x, p.y, p.x) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

float valueNoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 w = f * f * (3.0 - 2.0 * f);
  float a = hash21(i);
  float b = hash21(i + vec2(1.0, 0.0));
  float c = hash21(i + vec2(0.0, 1.0));
  float d = hash21(i + vec2(1.0, 1.0));
  return mix(mix(a, b, w.x), mix(c, d, w.x), w.y);
}

float fbm(vec2 p) {
  float value = 0.0;
  float amplitude = 0.5;
  vec2 q = p;
  for (int i = 0; i < 3; i++) {
    value += amplitude * valueNoise(q);
    q = q * 2.03 + vec2(17.1, 9.7);
    amplitude *= 0.5;
  }
  return value;
}

vec3 tone(float n) {
  vec3 green = vec3(0.16, 0.34, 0.20);
  vec3 blue = vec3(0.30, 0.44, 0.56);
  return mix(green, blue, smoothstep(0.38, 0.78, n));
}

void main() {
  // gl_FragCoord starts at the bottom-left; WebGPU positions start at the
  // top-left, so flip y to keep both renderers on the same pattern.
  vec2 position = vec2(gl_FragCoord.x, u_resolution.y - gl_FragCoord.y);
  vec2 uv = position / u_resolution;
  float aspect = u_resolution.x / u_resolution.y;
  vec2 p = vec2(uv.x * aspect, uv.y) * 1.45;
  float t = u_time * 0.012;

  // Two offset noise fields pull the pattern apart very slowly. The second
  // field also feeds the filaments, so the lines never slide like a texture.
  vec2 q = vec2(
    fbm(p * 0.85 + vec2(0.0, t * 0.55)),
    fbm(p * 0.85 + vec2(4.7, -t * 0.42))
  );
  float n = fbm(p + q * 1.35 + vec2(t * 0.12, -t * 0.08));
  float n2 = fbm(p * 1.7 + q * 0.9 + vec2(8.2, 3.1));

  // A diluted ink wash holds the color; thin filaments give it a drawn edge.
  float wash = smoothstep(0.40, 0.80, n);
  float alpha = wash * 0.18;
  float f = n * 22.0 + n2 * 4.0 + u_time * 0.06;
  float distanceToLine = abs(fract(f + 0.5) - 0.5);
  float width = max(fwidth(f), 0.001);
  float line = 1.0 - smoothstep(0.25, 1.05, distanceToLine / width);
  alpha += line * 0.17;

  vec3 color = mix(tone(n), vec3(0.13, 0.27, 0.18), line * 0.35);
  color = mix(color, vec3(0.18, 0.36, 0.22), smoothstep(0.55, 0.9, n2) * 0.2);

  // Static per-pixel noise stops wide washes from banding on 8-bit screens.
  float dither = (hash21(position.xy) - 0.5) * 0.006;
  alpha = clamp(alpha + dither, 0.0, 0.36);

  outColor = vec4(color * alpha, alpha);
}
`;

type Strip = {
	x: number;
	y: number;
	width: number;
	height: number;
};

type Renderer = {
	draw(time: number, strips: readonly Strip[]): void;
	firstFrame(time: number, strips: readonly Strip[]): Promise<boolean>;
	destroy(): void;
	lost: Promise<unknown> | null;
};

function pageVisible() {
	const prerendering = (
		document as Document & { prerendering?: boolean }
	).prerendering;
	return document.visibilityState === "visible" && !prerendering;
}

// The 1,280 px sheet is opaque, so only the margins beside it are visible.
// Returning the sheet itself as the full viewport means a page without a
// sheet keeps the old full-viewport draw.
function visibleStrips(width: number, height: number): Strip[] {
	const sheet = document.querySelector<HTMLElement>(".notebook-sheet");
	if (!sheet) return [{ x: 0, y: 0, width, height }];

	const rect = sheet.getBoundingClientRect();
	const left = Math.max(0, Math.min(width, rect.left));
	const right = Math.max(0, Math.min(width, rect.right));
	const strips: Strip[] = [];
	if (left > 0) strips.push({ x: 0, y: 0, width: Math.ceil(left), height });
	if (right < width) {
		const start = Math.floor(right);
		strips.push({ x: start, y: 0, width: width - start, height });
	}
	return strips;
}

export function startAmbientBackground(canvas: HTMLCanvasElement) {
	const wide = window.matchMedia(`(min-width: ${MIN_WIDTH}px)`);
	let booted = false;

	const maybeBoot = () => {
		if (booted || !wide.matches || !pageVisible()) return;
		booted = true;
		void boot(canvas, wide).catch((error: unknown) => {
			console.warn("[ambient] Background disabled.", error);
		});
	};

	wide.addEventListener("change", maybeBoot);
	document.addEventListener("visibilitychange", maybeBoot);
	document.addEventListener("prerenderingchange", maybeBoot);
	maybeBoot();
}

async function boot(canvas: HTMLCanvasElement, wide: MediaQueryList) {
	const renderer = await createRenderer(canvas);
	if (!renderer) return;

	const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
	let width = 0;
	let height = 0;
	let strips: Strip[] = [];
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
		// The canvas fills the viewport but the backing store may be scaled
		// down, so map the sheet's CSS edges onto the backing store.
		const styleWidth = Math.max(1, canvas.clientWidth || cssWidth);
		const styleHeight = Math.max(1, canvas.clientHeight || cssHeight);
		const scaleX = nextWidth / styleWidth;
		const scaleY = nextHeight / styleHeight;
		strips = visibleStrips(styleWidth, styleHeight)
			.map((strip) => {
				const x = Math.max(
					0,
					Math.min(nextWidth, Math.round(strip.x * scaleX)),
				);
				const y = Math.max(
					0,
					Math.min(nextHeight, Math.round(strip.y * scaleY)),
				);
				const right = Math.max(
					0,
					Math.min(nextWidth, Math.round((strip.x + strip.width) * scaleX)),
				);
				const bottom = Math.max(
					0,
					Math.min(nextHeight, Math.round((strip.y + strip.height) * scaleY)),
				);
				return { x, y, width: right - x, height: bottom - y };
			})
			.filter((strip) => strip.width > 0 && strip.height > 0);
		if (nextWidth === width && nextHeight === height) return false;
		width = nextWidth;
		height = nextHeight;
		canvas.width = width;
		canvas.height = height;
		return true;
	};

	const draw = () => {
		renderer.draw(time, strips);
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
		renderer.destroy();
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
	// A renderer can return without painting anything (headless Chrome has
	// done this). Keep the canvas hidden and the plain desk visible unless
	// the first frame really contains ink.
	let painted = false;
	let failed = false;
	try {
		painted = await renderer.firstFrame(0, strips);
	} catch (error) {
		failed = true;
		console.warn("[ambient] First frame failed; keeping the plain desk.", error);
	}
	if (!painted) {
		if (!failed) {
			console.warn(
				"[ambient] First frame contained no ink; keeping the plain desk.",
			);
		}
		renderer.destroy();
		return;
	}
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
	if (renderer.lost) {
		renderer.lost.then((info) => {
			if ((info as GPUDeviceLostInfo).reason !== "destroyed") teardown();
		});
	}
}

async function createRenderer(
	canvas: HTMLCanvasElement,
): Promise<Renderer | null> {
	try {
		const renderer = await createWebGPURenderer(canvas);
		if (renderer) return renderer;
	} catch (error) {
		console.warn("[ambient] WebGPU failed; trying WebGL.", error);
	}
	return createWebGLRenderer(canvas);
}

async function createWebGPURenderer(
	canvas: HTMLCanvasElement,
): Promise<Renderer | null> {
	const gpu = navigator.gpu;
	if (!gpu) return null;

	const adapter = await gpu.requestAdapter({ powerPreference: "low-power" });
	if (!adapter) return null;

	const device = await adapter.requestDevice();
	const context = canvas.getContext("webgpu");
	if (!context) {
		device.destroy();
		return null;
	}

	const format = gpu.getPreferredCanvasFormat();
	context.configure({
		device,
		format,
		alphaMode: "premultiplied",
		usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_SRC,
	});

	const module = device.createShaderModule({ code: WEBGPU_SHADER });
	const compilation = await module.getCompilationInfo();
	const errors = compilation.messages.filter(
		(message) => message.type === "error",
	);
	if (errors.length > 0) {
		device.destroy();
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

	const render = (
		seconds: number,
		strips: readonly Strip[],
		readback?: { buffer: GPUBuffer; bytesPerRow: number },
	) => {
		device.queue.writeBuffer(
			uniforms,
			0,
			new Float32Array([canvas.width, canvas.height, seconds, 0]),
		);
		const encoder = device.createCommandEncoder();
		const texture = context.getCurrentTexture();
		const pass = encoder.beginRenderPass({
			colorAttachments: [
				{
					view: texture.createView(),
					clearValue: { r: 0, g: 0, b: 0, a: 0 },
					loadOp: "clear",
					storeOp: "store",
				},
			],
		});
		pass.setPipeline(pipeline);
		pass.setBindGroup(0, bindGroup);
		for (const strip of strips) {
			pass.setScissorRect(strip.x, strip.y, strip.width, strip.height);
			pass.draw(3);
		}
		pass.end();
		if (readback) {
			encoder.copyTextureToBuffer(
				{ texture },
				{ buffer: readback.buffer, bytesPerRow: readback.bytesPerRow },
				{ width: texture.width, height: texture.height },
			);
		}
		device.queue.submit([encoder.finish()]);
	};

	return {
		draw(time, strips) {
			render(time, strips);
		},
		async firstFrame(time, strips) {
			const bytesPerRow = Math.ceil((canvas.width * 4) / 256) * 256;
			const readback = device.createBuffer({
				size: bytesPerRow * canvas.height,
				usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
			});
			try {
				render(time, strips, { buffer: readback, bytesPerRow });
				await readback.mapAsync(GPUMapMode.READ);
				const pixels = new Uint8Array(readback.getMappedRange());
				const rowBytes = canvas.width * 4;
				for (let y = 0; y < canvas.height; y += 1) {
					const row = y * bytesPerRow;
					for (let x = 3; x < rowBytes; x += 4) {
						if (pixels[row + x] !== 0) {
							readback.unmap();
							return true;
						}
					}
				}
				readback.unmap();
				return false;
			} finally {
				readback.destroy();
			}
		},
		destroy() {
			device.destroy();
		},
		lost: device.lost,
	};
}

function createWebGLRenderer(canvas: HTMLCanvasElement): Renderer | null {
	const gl = canvas.getContext("webgl2", {
		alpha: true,
		antialias: false,
		depth: false,
		stencil: false,
		premultipliedAlpha: true,
		powerPreference: "low-power",
	});
	if (!gl) return null;

	const compile = (type: number, source: string) => {
		const shader = gl.createShader(type);
		if (!shader) throw new Error("Unable to create a WebGL shader.");
		gl.shaderSource(shader, source);
		gl.compileShader(shader);
		if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
			const log = gl.getShaderInfoLog(shader);
			gl.deleteShader(shader);
			throw new Error(log ?? "WebGL shader compilation failed.");
		}
		return shader;
	};

	const program = gl.createProgram();
	if (!program) throw new Error("Unable to create a WebGL program.");
	const vertex = compile(gl.VERTEX_SHADER, WEBGL_VERTEX_SHADER);
	const fragment = compile(gl.FRAGMENT_SHADER, WEBGL_FRAGMENT_SHADER);
	gl.attachShader(program, vertex);
	gl.attachShader(program, fragment);
	gl.linkProgram(program);
	gl.deleteShader(vertex);
	gl.deleteShader(fragment);
	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
		const log = gl.getProgramInfoLog(program);
		gl.deleteProgram(program);
		throw new Error(log ?? "WebGL program linking failed.");
	}
	gl.useProgram(program);

	const resolution = gl.getUniformLocation(program, "u_resolution");
	const time = gl.getUniformLocation(program, "u_time");

	// The full-screen triangle needs no buffers, but WebGL2 still wants a
	// vertex array bound.
	const vao = gl.createVertexArray();
	gl.bindVertexArray(vao);

	const draw = (seconds: number, strips: readonly Strip[]) => {
		gl.viewport(0, 0, canvas.width, canvas.height);
		gl.disable(gl.SCISSOR_TEST);
		gl.clearColor(0, 0, 0, 0);
		gl.clear(gl.COLOR_BUFFER_BIT);
		gl.uniform2f(resolution, canvas.width, canvas.height);
		gl.uniform1f(time, seconds);
		gl.enable(gl.SCISSOR_TEST);
		for (const strip of strips) {
			gl.scissor(
				strip.x,
				canvas.height - strip.y - strip.height,
				strip.width,
				strip.height,
			);
			gl.drawArrays(gl.TRIANGLES, 0, 3);
		}
		gl.disable(gl.SCISSOR_TEST);
	};

	return {
		draw,
		async firstFrame(seconds, strips) {
			draw(seconds, strips);
			if (gl.isContextLost()) return false;
			const pixels = new Uint8Array(canvas.width * canvas.height * 4);
			gl.readPixels(
				0,
				0,
				canvas.width,
				canvas.height,
				gl.RGBA,
				gl.UNSIGNED_BYTE,
				pixels,
			);
			if (gl.getError() !== gl.NO_ERROR) return false;
			for (let offset = 3; offset < pixels.length; offset += 4) {
				if (pixels[offset] !== 0) return true;
			}
			return false;
		},
		destroy() {
			gl.deleteVertexArray(vao);
			gl.deleteProgram(program);
			gl.getExtension("WEBGL_lose_context")?.loseContext();
		},
		lost: null,
	};
}
