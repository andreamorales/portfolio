import type { PortfolioItemData } from '$lib/types/portfolio';

export const firehydrantProject: PortfolioItemData = {
  title: 'FireHydrant: Design System',
  description: 'Created a comprehensive design system for FireHydrant\'s incident management platform, increasing design consistency and development efficiency.',
  tags: ['UX/UI'],
  videoUrl: '/videos/firehydrant-design-system.mp4',
  previewImage: '/images/portfolio/firehydrant/preview1.jpg',
  githubUrl: 'https://github.com/yourusername/firehydrant-design-system',
  liveUrl: 'https://design-system.firehydrant.io',
  images: [
    {
      src: '/images/portfolio/firehydrant/preview1.jpg',
      alt: 'Component Library',
      caption: 'Core component library overview'
    },
    {
      src: '/images/portfolio/firehydrant/preview2.jpg',
      alt: 'Design Tokens',
      caption: 'Color system and design tokens'
    }
  ],
  content: [
    {
      type: 'text',
      value: 'The FireHydrant design system project addressed inconsistencies across their incident management platform by establishing a unified component library and design guidelines.'
    },
    {
      type: 'image',
      value: '/images/portfolio/firehydrant/detail1.jpg',
      caption: 'Before and after comparison showing UI improvements'
    },
    {
      type: 'text',
      value: 'The system included comprehensive documentation, Figma component libraries, and coded components that reduced development time by 40% for new features.'
    }
  ]
}; 