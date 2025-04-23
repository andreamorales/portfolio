import type { PortfolioItemData } from '$lib/types/portfolio';

export const duckyProject: PortfolioItemData = {
  title: 'Ducky - Productivity App',
  description: 'A productivity application that helps users track their tasks and goals with a friendly duck companion for motivation.',
  tags: ['React', 'TypeScript', 'Firebase', 'UI/UX', 'PWA'],
  videoUrl: '',
  previewImage: '/images/portfolio/ducky/preview1.jpg',
  githubUrl: 'https://github.com/yourusername/ducky-app',
  liveUrl: 'https://ducky-app.com',
  images: [
    {
      src: '/images/portfolio/ducky/preview1.jpg',
      alt: 'Ducky App Dashboard',
      caption: 'The main dashboard showing task lists and duck companion'
    },
    {
      src: '/images/portfolio/ducky/preview2.jpg',
      alt: 'Task Creation Interface',
      caption: 'Creating a new task with priority settings and deadline'
    }
  ],
  content: [
    {
      type: 'text',
      value: 'Ducky is a productivity application designed to make task management fun and engaging. The app features a duck companion that grows and evolves as users complete their tasks, providing a gamified experience to boost motivation.'
    },
    {
      type: 'image',
      value: '/images/portfolio/ducky/detail1.jpg',
      caption: 'Duck Companion Evolution Stages'
    },
    {
      type: 'text',
      value: 'The application was built using React and TypeScript for the frontend, with Firebase handling authentication, database, and hosting. It features offline capabilities, push notifications for task reminders, and integration with calendar applications.'
    }
  ]
}; 