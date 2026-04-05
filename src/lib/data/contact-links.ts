/** Text links for CLI --contact and shared contact UI */
export interface ContactLink {
	label: string;
	href: string;
	/** 'copy' = copy href value to clipboard instead of navigating */
	action?: 'link' | 'copy';
}

export const contactLinks: ContactLink[] = [
	{ label: 'GitHub', href: 'https://www.github.com/andreamorales' },
	{ label: 'LinkedIn', href: 'https://www.linkedin.com/in/andreasmorales/' },
	{
		label: 'CV',
		href: 'https://docs.google.com/document/d/1ijo9LmsUPb_SLiEYfes1xed5VwAhEuv2r6gR_GqMz1s/edit?usp=sharing'
	},
	{ label: 'Email', href: 'andreamoralescoto@gmail.com', action: 'copy' }
];
