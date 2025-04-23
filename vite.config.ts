import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import type { UserConfig } from 'vite';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore -- process env provided by Node when running vite

// Make the dev server listen on all network interfaces so that
// physical devices on the same Wi‑Fi/LAN can load the site via the
// computer's local IP address (e.g. http://192.168.0.42:5173)
const config: UserConfig = {
	plugins: [sveltekit()],
	server: {
		host: '0.0.0.0', // listen on all interfaces
		port: 5173,
		strictPort: true,
		// HMR will automatically infer the host; set explicitly if needed.
	}
};

export default defineConfig(config);
