<script lang="ts">
	import { onMount, tick } from 'svelte';
	import { Pointer } from 'lucide-svelte';
	import ImageCollage from '$lib/components/ImageCollage.svelte';
	import QuickNav from '$lib/components/portfolio/QuickNav.svelte';
	import Toast from '$lib/components/ui/Toast.svelte';
	import HomeImmersiveTopbar from '$lib/components/HomeImmersiveTopbar.svelte';
	import HomeLandingHero from '$lib/components/HomeLandingHero.svelte';
	import HomePortfolioOverviewList from '$lib/components/HomePortfolioOverviewList.svelte';
	import HomeImmersivePortfolioList from '$lib/components/HomeImmersivePortfolioList.svelte';
	import HomeNextPieceBanner from '$lib/components/HomeNextPieceBanner.svelte';
	import { portfolioItems } from '$lib/data/portfolio-items.js';
	import type { PortfolioItem } from '$lib/data/portfolio-items.js';
	import {
		colibri,
		companyLogos,
		homeCollageImageDimensions,
		homeCollageLargeScreenImages
	} from '$lib/data/home-page-assets';

	const getLatestYear = (year: string) => {
		const years = year.split('-').map((value) => parseInt(value.trim(), 10));
		return Math.max(...years);
	};

	$: sortedPortfolioItems = [...$portfolioItems].sort(
		(a: PortfolioItem, b: PortfolioItem) => getLatestYear(b.year) - getLatestYear(a.year)
	);

	$: allNavigationItems = sortedPortfolioItems.map((item: PortfolioItem, index: number) => ({
		id: index,
		title: item.title,
		thumbnail: item.quickNavThumbnail
	}));

	let immersiveMode = false;
	let isActivatingImmersive = false;
	let allowScrollToOpen = true;
	let canCloseImmersiveAtTop = false;
	let navMenuOpen = false;
	let activePortfolioIndex = 0;
	let nextPortfolioIndex: number | null = null;
	let showNextPieceBanner = false;
	let overviewPortfolioListElement: HTMLElement | null = null;
	let showToast = false;
	let toastMessage = '';
	let mounted = false;

	async function enterImmersiveMode(targetIndex: number = 0) {
		if (immersiveMode || isActivatingImmersive) {
			if (immersiveMode) {
				scrollToImmersiveSection(targetIndex);
			}
			return;
		}

		isActivatingImmersive = true;
		allowScrollToOpen = false;
		canCloseImmersiveAtTop = false;
		immersiveMode = true;
		navMenuOpen = false;
		activePortfolioIndex = targetIndex;

		await tick();
		scrollToImmersiveSection(targetIndex);
		isActivatingImmersive = false;
	}

	async function closeImmersiveMode(scrollTarget: 'top' | 'list' = 'list') {
		if (!immersiveMode || typeof window === 'undefined') return;

		immersiveMode = false;
		navMenuOpen = false;
		showNextPieceBanner = false;
		nextPortfolioIndex = null;
		canCloseImmersiveAtTop = false;
		allowScrollToOpen = scrollTarget === 'top';

		await tick();

		if (scrollTarget === 'top') {
			window.scrollTo({ top: 0, behavior: 'smooth' });
			return;
		}

		overviewPortfolioListElement?.scrollIntoView({
			behavior: 'smooth',
			block: 'start'
		});
	}

	function scrollToImmersiveSection(index: number) {
		const element = document.getElementById(`immersive-piece-${index}`);
		element?.scrollIntoView({
			behavior: 'smooth',
			block: 'start'
		});
	}

	function openPortfolioPiece(index: number) {
		if (!immersiveMode) {
			enterImmersiveMode(index);
			return;
		}

		scrollToImmersiveSection(index);
	}

	function updateImmersiveProgress() {
		if (!immersiveMode || typeof window === 'undefined') return;

		const viewportMidpoint = window.innerHeight * 0.45;
		let closestIndex = 0;
		let closestDistance = Number.POSITIVE_INFINITY;

		sortedPortfolioItems.forEach((_, index) => {
			const section = document.getElementById(`immersive-piece-${index}`);
			if (!section) return;

			const rect = section.getBoundingClientRect();
			const sectionMidpoint = rect.top + rect.height / 2;
			const distance = Math.abs(sectionMidpoint - viewportMidpoint);

			if (distance < closestDistance) {
				closestDistance = distance;
				closestIndex = index;
			}
		});

		activePortfolioIndex = closestIndex;
		nextPortfolioIndex = closestIndex < sortedPortfolioItems.length - 1 ? closestIndex + 1 : null;

		const activeSection = document.getElementById(`immersive-piece-${closestIndex}`);
		if (!activeSection || nextPortfolioIndex === null) {
			showNextPieceBanner = false;
			return;
		}

		const rect = activeSection.getBoundingClientRect();
		const progress = (window.innerHeight - rect.top) / rect.height;
		showNextPieceBanner = progress > 0.72 && rect.bottom > window.innerHeight * 0.4;
	}

	async function copyEmailToClipboard() {
		const email = 'andreamoralescoto@gmail.com';

		try {
			const tempInput = document.createElement('input');
			tempInput.value = email;
			document.body.appendChild(tempInput);
			tempInput.select();
			tempInput.setSelectionRange(0, 99999);

			try {
				await navigator.clipboard.writeText(email);
				toastMessage = 'Email copied!';
			} catch {
				document.execCommand('copy');
				toastMessage = 'Email copied!';
			}

			showToast = true;
			document.body.removeChild(tempInput);
		} catch {
			toastMessage = 'Email: andreamoralescoto@gmail.com';
			showToast = true;
		}
	}

	function openLinkedInProfile() {
		window.open('https://www.linkedin.com/in/andreasmorales/', '_blank');
	}

	function openGithubProfile() {
		window.open('https://github.com/andymorales', '_blank');
	}

	function openResume() {
		window.open(
			'https://docs.google.com/document/d/1ijo9LmsUPb_SLiEYfes1xed5VwAhEuv2r6gR_GqMz1s/edit?usp=sharing',
			'_blank'
		);
	}

	onMount(() => {
		mounted = true;

		const handleScroll = () => {
			if (isActivatingImmersive) return;

			if (!immersiveMode && window.scrollY <= 16) {
				allowScrollToOpen = true;
			}

			if (immersiveMode && !canCloseImmersiveAtTop && window.scrollY > 48) {
				canCloseImmersiveAtTop = true;
			}

			if (immersiveMode && canCloseImmersiveAtTop && window.scrollY <= 16) {
				closeImmersiveMode('top');
				return;
			}

			if (!immersiveMode && allowScrollToOpen && window.scrollY > 72) {
				enterImmersiveMode(0);
				return;
			}

			updateImmersiveProgress();
		};

		const handleDocumentClick = (event: MouseEvent) => {
			if (!immersiveMode || isActivatingImmersive) return;

			const target = event.target;
			if (!(target instanceof Element)) return;
			if (target.closest('.overview-portfolio-list')) return;

			const clickedInsidePortfolio = target.closest('.piece-shell');
			const clickedInsideControls = target.closest(
				'.immersive-topbar, .next-piece-banner, .mobile-immersive-nav'
			);

			if (!clickedInsidePortfolio && !clickedInsideControls) {
				closeImmersiveMode('list');
			}
		};

		window.addEventListener('scroll', handleScroll, { passive: true });
		document.addEventListener('click', handleDocumentClick);

		document.querySelector(':root')?.classList.add('mounted');
		document.body.classList.add('js-enabled');

		return () => {
			window.removeEventListener('scroll', handleScroll);
			document.removeEventListener('click', handleDocumentClick);
		};
	});
</script>

<svelte:head>
	<title>Andy Morales | Product Designer</title>
	<meta name="description" content="Andy Morales - Product designer for creative tools." />
</svelte:head>

<Toast message={toastMessage} bind:visible={showToast} />

<div class="landing-page">
	{#if immersiveMode}
		<HomeImmersiveTopbar
			isOpen={navMenuOpen}
			activeIndex={activePortfolioIndex}
			items={sortedPortfolioItems}
			{colibri}
			onToggle={() => (navMenuOpen = !navMenuOpen)}
			onSelect={(index) => {
				navMenuOpen = false;
				openPortfolioPiece(index);
			}}
		/>
	{/if}

	<main class="container flex-column-left" class:immersive-mode={immersiveMode}>
		{#if mounted}
			{#if !immersiveMode}
				<HomeLandingHero
					{colibri}
					consensysLogo={companyLogos.consensys}
					mongodbLogo={companyLogos.mongodb}
					robloxLogo={companyLogos.roblox}
					pantoLogo={companyLogos.panto}
					onCopyEmail={copyEmailToClipboard}
					onOpenLinkedIn={openLinkedInProfile}
					onOpenResume={openResume}
					onOpenGithub={openGithubProfile}
				/>
			{/if}

			<ImageCollage
				imageDimensions={homeCollageImageDimensions}
				largeScreenImages={homeCollageLargeScreenImages}
			>
				<svelte:fragment slot="drag-hint">
					<Pointer size={36} />
				</svelte:fragment>
			</ImageCollage>

			{#if !immersiveMode}
				<HomePortfolioOverviewList
					items={sortedPortfolioItems}
					bind:containerElement={overviewPortfolioListElement}
					onOpen={openPortfolioPiece}
				/>
			{:else}
				<HomeImmersivePortfolioList items={sortedPortfolioItems} />
			{/if}
		{/if}
	</main>
</div>

{#if immersiveMode && showNextPieceBanner && nextPortfolioIndex !== null}
	{@const upcomingIndex = nextPortfolioIndex}
	<HomeNextPieceBanner
		title={sortedPortfolioItems[upcomingIndex].title}
		onClick={() => scrollToImmersiveSection(upcomingIndex)}
	/>
{/if}

{#if immersiveMode}
	<div class="mobile-immersive-nav">
		<QuickNav items={allNavigationItems} hasExpandedItem={true} onExpandItem={openPortfolioPiece} />
	</div>
{/if}

<style>
	.landing-page {
		min-height: 100vh;
		background-color: var(--bg-color);
		color: var(--text-color);
		padding: 4.5rem;
		display: flex;
		flex-direction: column;
		align-items: stretch;
	}

	.container {
		max-width: 100%;
		margin: 0;
		padding: 0;
		position: relative;
		z-index: 2;
		gap: var(--spacing-xxl);
	}

	.container.immersive-mode {
		gap: 0;
	}

	.mobile-immersive-nav {
		display: none;
	}

	@media (max-width: 768px) {
		.container {
			gap: var(--spacing-md);
		}

		.container.immersive-mode {
			padding-top: 0;
		}

		.landing-page {
			padding: 2rem;
		}

		.mobile-immersive-nav {
			display: block;
		}
	}
</style>
