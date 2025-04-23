export interface PortfolioItemData {
  title: string;
  description: string;
  tags: string[];
  videoUrl?: string;
  previewImage: string;
  githubUrl?: string;
  liveUrl?: string;
  images: Array<{
    src: string;
    alt: string;
    caption?: string;
  }>;
  content: Array<{
    type: 'text' | 'image';
    value: string;
    caption?: string;
  }>;
} 