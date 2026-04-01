/** Fade opacity by how much of the node is visible inside `root` (scroll container). */
export function scrollFadeEntry(
	node: HTMLElement,
	params: { root: HTMLElement | null }
): {
	update: (p: { root: HTMLElement | null }) => void;
	destroy: () => void;
} {
	let observer: IntersectionObserver | null = null;
	const thresholds = Array.from({ length: 21 }, (_, i) => i / 20);

	function attach(root: HTMLElement | null) {
		observer?.disconnect();
		if (!root) {
			node.style.opacity = '1';
			return;
		}
		observer = new IntersectionObserver(
			(entries) => {
				for (const e of entries) {
					const t = e.intersectionRatio;
					node.style.opacity = String(0.32 + 0.68 * t);
				}
			},
			{ root, threshold: thresholds }
		);
		observer.observe(node);
	}

	attach(params.root);
	return {
		update(p: { root: HTMLElement | null }) {
			attach(p.root);
		},
		destroy() {
			observer?.disconnect();
		}
	};
}
