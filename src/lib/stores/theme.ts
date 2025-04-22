import { readable } from 'svelte/store';

// Create a readable store that only returns 'light' theme
export const theme = readable('light'); 