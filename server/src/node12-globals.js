/* Node 12 runtime shims.
 *
 * The headless server targets a Node 12.8 runtime, which predates the global
 * `Response`/`Blob` that arrived with Node 18's fetch. This file is prepended
 * (as an esbuild banner) to the Node 12 bundle so the globals exist before any
 * bundled module runs. It only implements the subset three.js's FileLoader /
 * ImageBitmapLoader actually consume.
 *
 * `ReadableStream` is deliberately left undefined: three's FileLoader checks
 * `typeof ReadableStream === 'undefined'` and, when true, skips the streaming
 * progress path and reads the body directly via arrayBuffer()/text()/blob() —
 * exactly what we want on a runtime without web streams.
 */
(function () {
	var g = (typeof globalThis !== 'undefined') ? globalThis : global;

	if (typeof g.Response === 'undefined') {
		g.Response = function Response(body, init) {
			init = init || {};
			this._buf = Buffer.isBuffer(body)
				? body
				: (body == null ? Buffer.alloc(0) : Buffer.from(body));
			this.status = (init.status != null) ? init.status : 200;
			this.statusText = init.statusText || '';
			this.ok = this.status >= 200 && this.status < 300;
			this.url = init.url || '';
			// Force three's non-streaming fetch branch.
			this.body = undefined;

			var h = init.headers || {};
			this.headers = {
				get: function (name) {
					var k = String(name).toLowerCase();
					for (var key in h) {
						if (Object.prototype.hasOwnProperty.call(h, key) &&
							String(key).toLowerCase() === k) {
							return h[key];
						}
					}
					return null;
				},
			};
		};

		g.Response.prototype.arrayBuffer = function () {
			var b = this._buf;
			return Promise.resolve(b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength));
		};
		g.Response.prototype.text = function () {
			return Promise.resolve(this._buf.toString('utf8'));
		};
		g.Response.prototype.json = function () {
			return Promise.resolve(JSON.parse(this._buf.toString('utf8')));
		};
		g.Response.prototype.blob = function () {
			var b = this._buf;
			// createImageBitmap is stubbed in the headless server, so the blob's
			// only job is to be a non-null placeholder it can ignore.
			return Promise.resolve({ size: b.length, _buf: b });
		};
	}

	if (typeof g.Blob === 'undefined') {
		g.Blob = function Blob(parts) { this._parts = parts || []; };
	}

	// fetch abort plumbing (Node 15+ globals). three's FileLoader builds an
	// AbortController per request and feeds controller.signal to fetch (our fetch
	// shim ignores it). It also feature-detects AbortSignal.any via `typeof`, so a
	// bare AbortSignal without `.any` makes three fall back to the plain signal.
	if (typeof g.AbortController === 'undefined') {
		g.AbortSignal = function AbortSignal() { this.aborted = false; };
		g.AbortSignal.prototype.addEventListener = function () {};
		g.AbortSignal.prototype.removeEventListener = function () {};

		g.AbortController = function AbortController() { this.signal = new g.AbortSignal(); };
		g.AbortController.prototype.abort = function () { this.signal.aborted = true; };
	}

	if (typeof g.Headers === 'undefined') {
		g.Headers = function Headers(init) {
			this._h = {};
			var self = this;
			if (init) {
				Object.keys(init).forEach(function (k) {
					self._h[String(k).toLowerCase()] = init[k];
				});
			}
		};
		g.Headers.prototype.get = function (n) {
			var v = this._h[String(n).toLowerCase()];
			return v == null ? null : v;
		};
		g.Headers.prototype.set = function (n, v) { this._h[String(n).toLowerCase()] = v; };
		g.Headers.prototype.append = function (n, v) { this.set(n, v); };
		g.Headers.prototype.has = function (n) {
			return Object.prototype.hasOwnProperty.call(this._h, String(n).toLowerCase());
		};
	}
})();
