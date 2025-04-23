import type { PortfolioItemData } from '$lib/types/portfolio';

export const mongodbProject: PortfolioItemData = {
  title: 'MongoDB Realm Integration',
  description: 'A seamless integration between MongoDB and mobile applications using Realm Sync to enable offline-first capabilities and real-time synchronization.',
  tags: ['MongoDB', 'Realm', 'JavaScript', 'React Native', 'Mobile'],
  videoUrl: '/videos/mongodb-realm-demo.mp4',
  previewImage: '/images/portfolio/mongodb/preview1.jpg',
  githubUrl: 'https://github.com/yourusername/mongodb-realm-demo',
  liveUrl: 'https://demo.yourdomain.com/mongodb-realm',
  images: [
    {
      src: '/images/portfolio/mongodb/preview1.jpg',
      alt: 'MongoDB Realm Dashboard',
      caption: 'The admin dashboard for managing Realm Sync configurations'
    },
    {
      src: '/images/portfolio/mongodb/preview2.jpg',
      alt: 'Mobile App Integration',
      caption: 'The React Native mobile app with offline data capabilities'
    }
  ],
  content: [
    {
      type: 'text',
      value: 'This project demonstrates how to use MongoDB Realm to enable offline-first capabilities in mobile applications. By leveraging Realm\'s synchronization features, users can interact with the app even without an internet connection.'
    },
    {
      type: 'image',
      value: '/images/portfolio/mongodb/detail1.jpg',
      caption: 'System Architecture Diagram'
    },
    {
      type: 'text',
      value: 'The implementation includes user authentication, data access rules, and conflict resolution strategies. The backend uses MongoDB Atlas for data storage and Realm\'s serverless functions for business logic.'
    }
  ]
}; 