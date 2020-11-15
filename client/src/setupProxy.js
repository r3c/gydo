const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
	app.use(
		"/api",
		createProxyMiddleware({
			target: process.env.REACT_APP_NETWORK_HTTP_BASE ?? "http://localhost:5000",
			changeOrigin: true,
		})
	);
};
