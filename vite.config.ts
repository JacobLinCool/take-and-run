import { defineConfig } from "vitest/config";
import { sveltekit } from "@sveltejs/kit/vite";

// import { attach as room } from "./src/lib/server/room/core";
// import { SocketPlugin } from "./src/lib/server/socket/vite-plugin";

export default defineConfig({
	plugins: [sveltekit()],
	test: {
		include: ["src/**/*.{test,spec}.{js,ts}"],
	},
	server: {
		fs: {
			allow: ["./locales"],
		},
	},
});
