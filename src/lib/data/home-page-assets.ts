import colibri from '$lib/images/pixel_art_small (1).svg';
import beetle from '$lib/images/beetle.png';
import dahlia from '$lib/images/dahlia.png';
import knight from '$lib/images/knight.png';
import orchid from '$lib/images/orchid.png';
import owl from '$lib/images/owl.png';
import parrots from '$lib/images/parrots.png';
import rock from '$lib/images/rock.png';
import snake from '$lib/images/snake.png';
import woman from '$lib/images/woman.png';

import mongodbLogo from '$lib/images/MongoDB.svg?raw';
import consensysLogo from '$lib/images/Consensys.svg?raw';
import pantoLogo from '$lib/images/panto_horizontal.svg?raw';
import robloxLogo from '$lib/images/Roblox.svg?raw';

export type HomeCollageImage = {
	src: string;
	alt: string;
	width: number;
	height: number;
	zIndex: number;
	aspectRatio: string;
	flexShrink?: number;
	rotation?: number;
	contentOffsets: {
		top: number;
		right: number;
		bottom: number;
		left: number;
	};
};

export { colibri };

export const companyLogos = {
	mongodb: mongodbLogo,
	consensys: consensysLogo,
	panto: pantoLogo,
	roblox: robloxLogo
};

export const homeCollageImageDimensions: HomeCollageImage[] = [
	{
		src: knight,
		alt: 'Knight',
		width: 352.8,
		height: 616.8,
		zIndex: 6,
		aspectRatio: '294.05/513.99',
		contentOffsets: { top: 5, right: 20, bottom: 5, left: 20 }
	},
	{
		src: woman,
		alt: 'Woman',
		width: 418.731,
		height: 580.458,
		zIndex: 12,
		aspectRatio: '418.73/580.46',
		contentOffsets: { top: 10, right: 15, bottom: 5, left: 15 }
	},
	{
		src: parrots,
		alt: 'Parrots',
		width: 179.135,
		height: 267.576,
		zIndex: 9,
		aspectRatio: '179.13/267.58',
		contentOffsets: { top: 10, right: 10, bottom: 10, left: 10 }
	},
	{
		src: owl,
		alt: 'Owl',
		width: 340,
		height: 340,
		zIndex: 8,
		aspectRatio: '1/1',
		contentOffsets: { top: 5, right: 10, bottom: 5, left: 5 }
	},
	{
		src: beetle,
		alt: 'Beetle',
		width: 273.841,
		height: 134.3,
		zIndex: 1,
		aspectRatio: '273.84/134.30',
		contentOffsets: { top: 20, right: 20, bottom: 20, left: 20 }
	},
	{
		src: dahlia,
		alt: 'Dahlia',
		width: 436.519,
		height: 539.77,
		zIndex: 3,
		aspectRatio: '436.52/539.77',
		contentOffsets: { top: 10, right: 15, bottom: 10, left: 15 }
	},
	{
		src: snake,
		alt: 'Snake',
		width: 399.94,
		height: 460,
		zIndex: 11,
		aspectRatio: '400/460',
		contentOffsets: { top: 5, right: 5, bottom: 15, left: 10 }
	},
	{
		src: rock,
		alt: 'Rock',
		width: 206.375,
		height: 227.453,
		zIndex: 10,
		aspectRatio: '206.38/227.45',
		flexShrink: 0,
		contentOffsets: { top: 15, right: 15, bottom: 15, left: 15 }
	},
	{
		src: orchid,
		alt: 'Orchid',
		width: 359.332,
		height: 415.029,
		zIndex: 7,
		aspectRatio: '359.33/415.03',
		flexShrink: 0,
		rotation: -15,
		contentOffsets: { top: 5, right: 15, bottom: 25, left: 15 }
	}
];

export const homeCollageLargeScreenImages: HomeCollageImage[] = [];
