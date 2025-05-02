import { writable } from 'svelte/store';

interface PortfolioImage {
  src: string;
  alt: string;
  caption?: string;
}

interface ContentItem {
  type: string;
  value: string;
  caption?: string;
}

export interface PortfolioItem {
  title: string;
  tags: string[];
  expanded: boolean;
  description: string;
  videoUrl: string;
  quickNavThumbnail: string;
  images: PortfolioImage[];
  content: ContentItem[];
  year: string;
  role: string;
  link: string;
  metrics: string[];
}

const initialPortfolioItems: PortfolioItem[] = [
  { 
    title: 'MongoDB: Realm Schema', 
    tags: ['UX/UI'],
    expanded: false,
    description: "Reimagining MongoDB's Realm Schema designer with a focus on tackling mobile developers unfamiliar with database schemas.",
    videoUrl: "/videos/mongodb-realm-demo.mp4",
    quickNavThumbnail: "/images/portfolio/mongodb/thumbnail.png",
    images: [
      { src: "/images/portfolio/mongodb/schema.png", alt: "Realm Schema Designer", caption: "Main interface showing relationship mapping" },
      { src: "/images/portfolio/mongodb/hero.png", alt: "Schema details", caption: "Field type configuration with validation settings" }
    ],
    content: [
      { type: "text", 
        value: "The MongoDB Realm Schema project involved redesigning the database schema interface to make it more intuitive for developers. I focused on streamlining the workflow for creating data models and relationships." },
      { type: "image", 
        value: "/images/portfolio/mongodb/schema.png", 
        caption: "Early wireframe explorations of the interface" },
      { type: "text", 
        value: "A key challenge was balancing technical functionality with visual clarity. The final design introduced a visual relationship map that dynamically updates as schemas evolve." }
    ],
    year: "2020",
    role: "Lead Designer",
    link: "Discontinued",
    metrics: [
      "Task completion rate from 0->100% in two weeks.",
      "P0 bugs from original product reduced by 100%",
      "4 components contributed to LeafyGreen, the MongoDB design system"
    ]
  },
  { 
    title: 'Ducky: Full Product', 
    tags: ['UX/UI', 'FRONTEND'],
    expanded: false,
    description: "Ducky is a micromentoring platform for product designers.",
    videoUrl: "/videos/ducky-product-demo.mp4",
    quickNavThumbnail: "/images/portfolio/ducky/thumbnail.png",
    images: [
      { src: "/images/portfolio/ducky/hero.png", alt: "Ducky Dashboard", caption: "Team dashboard showing active projects" }
    ],
    content: [
      { type: "text", value: "Ducky was designed to solve common project management pain points by combining the visual clarity of kanban with the structured approach of traditional PM tools." },
      { type: "image", value: "/images/portfolio/ducky/hero.png", caption: "User journey map highlighting key touchpoints" },
      { type: "text", value: "I led both design and frontend development, implementing the UI with React and handling real-time updates via WebSockets. The design system was built to accommodate future scaling with consistent components." }
    ],
    year: "2024",
    role: "Lead Designer & Frontend Dev",
    link: "https://www.tryducky.com",
    metrics: [
      "25% increase in sales",
      "2% decrease in UX problems",
      "Another metric"
    ]
  },
  { 
    title: 'FireHydrant: Design System', 
    tags: ['UX/UI'],
    expanded: false,
    description: "Increasing the quality of design systemically, in the most efficient way",
    videoUrl: "/videos/firehydrant-design-system.mp4",
    quickNavThumbnail: "/images/portfolio/firehydrant/thumbnail.png",
    images: [
      { src: "/images/portfolio/firehydrant/hero.png", alt: "Component Library", caption: "Core component library overview" }
    ],
    content: [
      { type: "text", value: "The FireHydrant design system project addressed inconsistencies across their incident management platform by establishing a unified component library and design guidelines." },
      { type: "image", value: "/images/portfolio/firehydrant/hero.png", caption: "Before and after comparison showing UI improvements" },
      { type: "text", value: "The system included comprehensive documentation, Figma component libraries, and coded components that reduced development time by 40% for new features." }
    ],
    year: "2022",
    role: "Design Systems Architect",
    link: "https://www.firehydrant.com",
    metrics: [
      "40% reduction in dev time",
      "85% component adoption rate",
      "22% faster onboarding"
    ]
  },
  { 
    title: 'Roblox: Creator Hub', 
    tags: ['UX/UI'],
    expanded: false,
    description: "Teaching Roblox devs how to use API keys, whether they are beginners or advanced users.",
    videoUrl: "/videos/roblox-creator-hub.mp4",
    quickNavThumbnail: "/images/portfolio/roblox/thumbnail.png",
    images: [
      { src: "/images/portfolio/roblox/hero.png", alt: "Analytics Dashboard", caption: "Game performance analytics" }
    ],
    content: [
      { type: "text", value: "The Roblox Creator Hub redesign focused on giving developers deeper insights into their games and better tools to engage with their communities." },
      { type: "image", value: "/images/portfolio/roblox/hero.png", caption: "User testing session analyzing key painpoints" },
      { type: "text", value: "Through extensive user research with Roblox developers, we identified key pain points and opportunities. The new design centralizes the most-used features while providing powerful new tools for monetization and community management." }
    ],
    year: "2021",
    role: "Senior Product Designer",
    link: "https://create.roblox.com/",
    metrics: [
      "17% increase in creator retention",
      "42% more time in analytics tools",
      "4.8/5 average user satisfaction"
    ]
  },
  { 
    title: 'Panto: Full Product', 
    tags: ['UX/UI', 'FRONTEND'],
    expanded: false,
    description: "Panto helps AI app layer companies evaluate the true usefulness of their data in order to post-train better AI models.",
    videoUrl: "/videos/panto-demo.mp4",
    quickNavThumbnail: "/images/portfolio/panto/thumbnail.png",
    images: [
      { src: "/images/portfolio/panto/hero.png", alt: "Design Interface", caption: "Main collaborative design interface" }
    ],
    content: [
      { type: "text", value: "Panto was built to solve the designer-developer handoff problem by creating a collaborative environment where designs automatically generate usable code components." },
      { type: "image", value: "/images/portfolio/panto/hero.png", caption: "System architecture diagram" },
      { type: "text", value: "I was responsible for the full product lifecycle, from initial concept through design, development and launch. The platform uses a component-based approach that maintains design fidelity while producing clean, maintainable code." }
    ],
    year: "2024-2025",
    role: "Design Lead & Frontend Engineer",
    link: "https://www.trypanto.com",
    metrics: [
      "68% reduction in handoff issues", 
      "3.1x faster implementation time",
      "86% component reuse rate" 
    ]
  },
  { 
    title: 'La Güila Toys: Full Product', 
    tags: ['TOY DESIGN'],
    expanded: false,
    description: "La Güila Toys is a line of toys that explore death and the passage of time, making bleak topics playful. I’ve created more than 20 toys in total.",
    videoUrl: "/videos/laguila-product-showcase.mp4",
    quickNavThumbnail: "/images/portfolio/laguila/thumbnail.png",
    images: [
      { src: "/images/portfolio/laguila/hero.png", alt: "Toy Collection", caption: "Complete product line overview" }
    ],
    content: [
      { type: "text", value: "La Güila Toys focuses on eco-friendly materials and designs that teach environmental concepts in an engaging way. Each toy is made from sustainable materials and designed to spark curiosity about the natural world." },
      { type: "image", value: "/images/portfolio/laguila/hero.png", caption: "Initial sketches and prototypes" },
      { type: "text", value: "The design process involved extensive research into sustainable materials, child development principles, and creating engaging ways to introduce complex ecological concepts through play." }
    ],
    year: "2023-2025",
    role: "Product Designer",
    link: "https://www.instagram.com/laguila_toys",
    metrics: [
      "Featured in 2 art shows at Ghost Fox Toys Gallery.",
      "Completely self-taught.",
      "One toy sold for $75"
    ]
  },
  { 
    title: 'Torch: Full Product', 
    tags: ['GAME DESIGN'],
    expanded: false,
    description: "Torch is a freeform Live Action Roleplaying game exploring themes of multigenerational storytelling and collective memory.",
    videoUrl: "/videos/torch-gameplay.mp4",
    quickNavThumbnail: "/images/portfolio/torch/thumbnail.png",
    images: [
      { src: "/images/portfolio/torch/hero.png", alt: "First page of the game, featuring a black and white illustrated  motif.", caption: "Cover of the game." },
      { src: "/images/portfolio/torch/instructions.png", alt: "The second page of the instructions, featuring icons of a lamplight and a torch.", caption: "The second page of instructions" },
      { src: "/images/portfolio/torch/outtake.png", alt: "A page signaling all the ways a player can create a scene, by focusig on their senses.", caption: "A page signaling all the ways a player can create a scene, by focusig on their senses." },
      { src: "/images/portfolio/torch/rounds.png", alt: "A page explaining that playes must be lying on the floor, and each round the lamplight is moved in a circular motion.", caption: "The page that explains the mechanics of the game." },
      { src: "/images/portfolio/torch/winner.png", alt: "A group of people announcing the win of the Golden Cobra Award for Torch.", caption: "The announcement of the Golden Cobra Award." },
    ],
    content: [
      { type: "text", 
        value: "Torch is a freeform Live Action Roleplaying game. It was born out of a game design retreat I attend every year in New Jersey, as part of my desire to participate in the Golden Cobra Challenge, a very well known LARP design competition. This game won the Best Multi-Generational Game award at Golden Cobra. The award was announced at Metatopia 2018." },
      { type: "image", value: "/images/portfolio/torch/instructions.png", caption: "Instructions page." },
      { type: "text", 
        value: "The game puts players in the position of citizens of a country that has been recently granted independence, out of the blue. Players must then travel through time telling the stories of the impact that such an unexpected event has on the country and the individual lives of its citizens, from the Independence Day to 500 years in the future." }
    ],
    year: "2018-2020",
    role: "Lead Game Designer",
    link: "https://mentapurpura.itch.io/torch",
    metrics: [
      "Winner of Golden Cobra Award",
      "Featured at Metatopia 2018",
    ]
  }
];

export const portfolioItems = writable<PortfolioItem[]>(initialPortfolioItems); 