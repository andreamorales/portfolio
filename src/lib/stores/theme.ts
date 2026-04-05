import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export type Theme = 'light-theme' | 'dark-theme';

function createThemeStore() {
	const initial: Theme = browser
		? ((localStorage.getItem('theme') as Theme) ?? 'light-theme')
		: 'light-theme';

	const { subscribe, set, update } = writable<Theme>(initial);

	return {
		subscribe,
		set(value: Theme) {
			set(value);
			if (browser) {
				localStorage.setItem('theme', value);
				document.documentElement.className = value;
			}
		},
		toggle() {
			update((t) => {
				const next: Theme = t === 'light-theme' ? 'dark-theme' : 'light-theme';
				if (browser) {
					localStorage.setItem('theme', next);
					document.documentElement.className = next;
				}
				return next;
			});
		}
	};
}

export const theme = createThemeStore();
