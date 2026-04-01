/** Text links for CLI --contact and shared contact UI */
export interface ContactLink {
	label: string;
	href: string;
}

export const contactLinks: ContactLink[] = [
	{ label: 'GitHub', href: 'https://www.github.com/andreamorales' },
	{ label: 'LinkedIn', href: 'https://linkedin.com/' },
	{ label: 'Twitter / X', href: 'https://twitter.com/' },
	{ label: 'Email', href: 'mailto:hello@example.com' }
];
