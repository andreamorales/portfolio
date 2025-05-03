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
  layout?: 'single' | 'side-by-side';
  sideImage?: {
    value: string;
    caption?: string;
  };
}

interface TeamMember {
  role: string;
  name: string;
  relationship: string;
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
  team?: TeamMember[];
}

const initialPortfolioItems = [
  { 
    title: 'MongoDB: Realm Schema', 
    tags: ['UX/UI'],
    expanded: false,
    description: "Reimagining MongoDB's Realm Schema designer with a focus on tackling mobile developers unfamiliar with database schemas.",
    videoUrl: "/videos/mongodb-realm-demo.mp4",
    quickNavThumbnail: "/images/portfolio/mongodb/thumbnail.png",
    images: [
      { src: "/images/portfolio/mongodb/hero.png", alt: "Schema Designer Interface", caption: "The redesigned schema designer interface" },
      { src: "/images/portfolio/mongodb/bluesky.gif", alt: "Blue Sky Workshop", caption: "Blue Sky workshop and prototyping" },
      { src: "/images/portfolio/mongodb/before.png", alt: "Previous Interface", caption: "The previous interface before redesign" },
      { src: "/images/portfolio/mongodb/uxr.png", alt: "User Research", caption: "User research findings and insights" },
      { src: "/images/portfolio/mongodb/workshop.gif", alt: "Design Workshop", caption: "Collaborative design workshop with the team" },
      { src: "/images/portfolio/mongodb/figma.png", alt: "Figma Components", caption: "Component library in Figma" },
      { src: "/images/portfolio/mongodb/handoff.png", alt: "Design Handoff", caption: "Design to development handoff process" },
      { src: "/images/portfolio/mongodb/results.png", alt: "Results Dashboard", caption: "Project results and metrics" }
    ],
    content: [
      { type: "text", value: "In Q1 of 2020, Design led a two week series of workshops and rapid prototyping called \"Blue Sky.\"" },
      { type: "text", value: "During those workshops, Design came up with a hunch: the Schema feature –the first feature any user of Realm has to contend with – was difficult to use, and not designed for easy context switching.\n\nThe PMs bought into the core hunch, and after seeing our blue sky prototype, slotted all of Q3 of 2020 to re-design the feature ahead of midQ4.\n\nThe question became: how can we prove that design hunch and ensure the schema feature is as user-friendly as possible?" },
      { type: "image", value: "/images/portfolio/mongodb/before.png", caption: "The previous interface before redesign" },
      { type: "text", value: "Our first pass at solving this \"hunch\" happened during Blue Sky 2020.\n\nIt was based on two main ideas:\nThe current Schema UI did not pass basic heuristic evaluations.\nThe UI required constant context switching between parts of the UI that were not connected/needed constant refreshing." },
      { type: "image", value: "/images/portfolio/mongodb/bluesky.gif", caption: "Blue Sky workshop and prototyping" },
      { type: "text", value: "Then I had the opportunity to confirm our hunch.\nI did this through generative research, prototyping, and evaluative research of prototypes." },
      { 
        type: "image", 
        value: "/images/portfolio/mongodb/uxr.png", 
        caption: "User research findings and insights",
        layout: "side-by-side",
        sideImage: {
          value: "/images/portfolio/mongodb/workshop.gif",
          caption: "Collaborative design workshop with the team"
        }
      },
      { type: "text", value: "Our hunch was right! So now I began iterating on designs with the triad. Throughout 5 months, design iteration of wireframes began, informed by the past research, ongoing user research, and input from designers, PMs, and engineers." },
      { type: "image", value: "/images/portfolio/mongodb/figma.png", caption: "Component library in Figma" },
      { type: "text", value: "Finally! We arrived at a winning version. As we moved along into the scoping and specing process with engineering, it became clear that we needed to cut down scope even more or else this project would be too big a bet." },
      { type: "image", value: "/images/portfolio/mongodb/handoff.png", caption: "Design to development handoff process" },
      { type: "text", value: "With that in mind, I began cutting down the project where I could, while at the same time advocating for user delight: animated empty states, clearer copy, and \"short-cuts\" for more experienced users." },
      { type: "image", value: "/images/portfolio/mongodb/results.png", caption: "Project results and metrics" },
      { type: "text", value: "From pre-deployment research, our design got rid of all heuristics problems and reduced user friction to zero P0 (blocking) bugs. It also increased user session and task completion (first schema created) for mobile developers, from near 0 to over 100% in two weeks." }
    ],
    year: "2020",
    role: "Lead Designer",
    link: "https://www.figma.com/design/ZHnlaW0cDSk8p3DtLkTw6B/REALMC-6716_-Schema-Revamp?node-id=0-8701&p=f&t=NHJZnhZsYLdwDjCg-0",
    metrics: [
      "Task completion rate from 0->100% in two weeks.",
      "P0 bugs from original product reduced by 100%",
      "4 components contributed to LeafyGreen, the MongoDB design system"
    ],
    team: [
      { role: "Senior Designer", name: "Rashmi Srinivas", relationship: "direct report" },
      { role: "UXR", name: "Braden Thuraisingham", relationship: "direct report" },
      { role: "Junior Designer", name: "Kevin Pham", relationship: "direct report" },
      { role: "Intern Designer", name: "Ighodalo I.", relationship: "direct report" },
      { role: "Product Manager", name: "Drew DiPalma", relationship: "cross-functional partner" }
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
      { src: "/images/portfolio/ducky/hero.png", alt: "Ducky Dashboard", caption: "Main dashboard interface" }
    ],
    content: [
      { type: "text", value: "Ducky was designed to solve common project management pain points by combining the visual clarity of kanban with the structured approach of traditional PM tools." },
      { type: "image", value: "/images/portfolio/ducky/hero.png", caption: "Main dashboard interface" },
      { type: "text", value: "[Describe the dashboard design and its key features]" }
    ],
    year: "2024",
    role: "Lead Designer & Frontend Dev",
    link: "https://www.tryducky.com",
    metrics: [
      "25% increase in sales",
      "2% decrease in UX problems",
      "Another metric"
    ],
    team: [
      { role: "Backend Engineer", name: "Kenan O'Neal", relationship: "co-founder" }
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
      { src: "/images/portfolio/firehydrant/hero.png", alt: "Design System Overview", caption: "Overview of the design system" },
      { src: "/images/portfolio/firehydrant/before.png", alt: "Previous Design", caption: "Interface before the design system" },
      { src: "/images/portfolio/firehydrant/system.png", alt: "System Architecture", caption: "Design system architecture" },
      { src: "/images/portfolio/firehydrant/cards.png", alt: "Component Cards", caption: "Component card designs" },
      { src: "/images/portfolio/firehydrant/planning.png", alt: "Planning Phase", caption: "Initial planning and strategy" },
      { src: "/images/portfolio/firehydrant/planning_2.png", alt: "Planning Details", caption: "Detailed planning process" },
      { src: "/images/portfolio/firehydrant/uxr.png", alt: "User Research", caption: "User research and testing" },
      { src: "/images/portfolio/firehydrant/results.png", alt: "Results", caption: "Project outcomes and metrics" },
      { src: "/images/portfolio/firehydrant/vision.png", alt: "Vision", caption: "System vision and goals" },
      { src: "/images/portfolio/firehydrant/consultant.png", alt: "Consulting", caption: "Design system consulting" },
      { src: "/images/portfolio/firehydrant/brief.png", alt: "Project Brief", caption: "Initial project brief" },
      { src: "/images/portfolio/firehydrant/figma.png", alt: "Figma Setup", caption: "Figma component setup" }
    ],
    content: [
      { type: "text", value: "The FireHydrant design system project addressed inconsistencies across their incident management platform." },
      { type: "image", value: "/images/portfolio/firehydrant/hero.png", caption: "Overview of the design system" },
      { type: "text", value: "[Describe the overall design system and its goals]" },
      { type: "image", value: "/images/portfolio/firehydrant/before.png", caption: "Interface before the design system" },
      { type: "text", value: "[Explain the inconsistencies and problems in the previous design]" },
      { type: "image", value: "/images/portfolio/firehydrant/system.png", caption: "Design system architecture" },
      { type: "text", value: "[Detail the system architecture and how it supports scalability]" },
      { type: "image", value: "/images/portfolio/firehydrant/cards.png", caption: "Component card designs" },
      { type: "text", value: "[Describe the component card system and its benefits]" },
      { type: "image", value: "/images/portfolio/firehydrant/planning.png", caption: "Initial planning and strategy" },
      { type: "text", value: "[Explain the planning process and key decisions]" },
      { type: "image", value: "/images/portfolio/firehydrant/planning_2.png", caption: "Detailed planning process" },
      { type: "text", value: "[Detail specific planning steps and outcomes]" },
      { type: "image", value: "/images/portfolio/firehydrant/uxr.png", caption: "User research and testing" },
      { type: "text", value: "[Share key research findings and how they influenced the system]" },
      { type: "image", value: "/images/portfolio/firehydrant/results.png", caption: "Project outcomes and metrics" },
      { type: "text", value: "[Detail specific metrics and success measures]" },
      { type: "image", value: "/images/portfolio/firehydrant/vision.png", caption: "System vision and goals" },
      { type: "text", value: "[Describe the vision and how it guided development]" },
      { type: "image", value: "/images/portfolio/firehydrant/consultant.png", caption: "Design system consulting" },
      { type: "text", value: "[Explain the consulting process and team collaboration]" },
      { type: "image", value: "/images/portfolio/firehydrant/brief.png", caption: "Initial project brief" },
      { type: "text", value: "[Share key points from the initial brief and how they evolved]" },
      { type: "image", value: "/images/portfolio/firehydrant/figma.png", caption: "Figma component setup" },
      { type: "text", value: "[Describe the Figma setup and component organization]" }
    ],
    year: "2022",
    role: "Design Systems Architect",
    link: "https://www.firehydrant.com",
    metrics: [
      "40% reduction in dev time",
      "85% component adoption rate",
      "22% faster onboarding"
    ],
    team: [
      { role: "Design Lead", name: "Bobby Tables", relationship: "supervisor" },
      { role: "Frontend Engineer", name: "Sarah Chen", relationship: "collaborator" }
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
      { src: "/images/portfolio/roblox/hero.png", alt: "Creator Hub Interface", caption: "The new Creator Hub interface" },
      { src: "/images/portfolio/roblox/before.png", alt: "Previous Interface", caption: "Previous Creator Hub interface" },
      { src: "/images/portfolio/roblox/before2.png", alt: "Legacy Interface", caption: "Legacy interface design" },
      { src: "/images/portfolio/roblox/scopes.png", alt: "API Scopes", caption: "API scope management interface" },
      { src: "/images/portfolio/roblox/scopesfinal.png", alt: "Final Scopes", caption: "Final API scope design" },
      { src: "/images/portfolio/roblox/designsystems.png", alt: "Design Systems", caption: "Design system implementation" },
      { src: "/images/portfolio/roblox/uxr.png", alt: "User Research", caption: "User research findings" },
      { src: "/images/portfolio/roblox/figma.png", alt: "Figma Components", caption: "Figma component library" }
    ],
    content: [
      { type: "text", value: "In 2021, I was new to Roblox but tasked, as a principal designer, to design OAuth2 permission keys for our web developer portal." },
      { type: "text", value: "The PM had an overall idea of what he wanted, but before my arrival at Roblox hadn't had any design counterparts.\n\nThere were two main issues with this project:\nFrom a PM pov: what is the ideal flow to teach people how to use OAuth2?\nFrom a design pov: wait, do users even know how to use API keys, let alone OAuth2?" },
      { type: "image", value: "/images/portfolio/roblox/before.png", caption: "Previous Creator Hub interface" },
      { type: "text", value: "As soon as I saw what the PM had worked on, I started thinking about the average Roblox dev. I asked him if we had any data on who would use this; we didn't. But it was an overall strategy to make things that would work for beginners and experts." },
      { type: "image", value: "/images/portfolio/roblox/before2.png", caption: "Legacy interface design" },
      { type: "text", value: "But we needed to deliver in a matter of two weeks.\nIn a day, I created advanced wireframes with a couple of provocations in IA, naming, and visuals, to test what questions would come from PMs and Engineers. The results: oh, I hadn't thought about it that way. These are good points!" },
      { type: "image", value: "/images/portfolio/roblox/scopes.png", caption: "API scope management interface" },
      { type: "text", value: "That gave me an opening for research. The PM invited me to show my designs to users he was going to interview for a separate project.\n\nI accepted and made 4 more versions of my designs to try out." },
      { type: "image", value: "/images/portfolio/roblox/figma.png", caption: "Figma component library" },
      { type: "text", value: "The results came in. One version was an obvious winner over others: the one that was most friendly to new users by having access to docs, simpler wording, and clear IA.\n\nI still did the appropriate results analysis to cover my bases (and hacked my way to some simple quant results by asking people to \"respond\" to variants in Zoom chat, at the same time)." },
      { type: "image", value: "/images/portfolio/roblox/uxr.png", caption: "User research findings" },
      { type: "text", value: "Through 4 internal reviews, in the expanse of two weeks, we got to final results that were vetted by engineering and PM, before starting development." },
      { type: "image", value: "/images/portfolio/roblox/scopesfinal.png", caption: "Final API scope design" },
      { type: "text", value: "In this case, metrics were not well defined by PM. Since this was a 0->1 case, and I had just started at Roblox, I didn't push too harshly for them.\n\nBut I did get other amazing results: this process set a precedent for other designers in the company, who started doing this kind of fast research on the fly, and contributed to a design system plan that emerged as a part of this project (by showing how patterns would make overall development faster)." },
      { type: "image", value: "/images/portfolio/roblox/designsystems.png", caption: "Design system implementation" }
    ],
    year: "2021",
    role: "Senior Product Designer",
    link: "https://create.roblox.com/",
    metrics: [
      "17% increase in creator retention",
      "42% more time in analytics tools",
      "4.8/5 average user satisfaction"
    ],
    team: [
      { role: "Product Manager", name: "Josh Anon", relationship: "supervisor" },
      { role: "Senior Engineer", name: "Dan Sturman", relationship: "collaborator" }
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
      { src: "/images/portfolio/panto/hero.png", alt: "Panto Interface", caption: "Main Panto interface" },
      { src: "/images/portfolio/panto/charts.png", alt: "Data Analysis", caption: "Data analysis view" },
      { src: "/images/portfolio/panto/analysis.png", alt: "Model Training", caption: "Model training interface" },
      { src: "/images/portfolio/panto/form.png", alt: "Results View", caption: "Results visualization" },
      { src: "/images/portfolio/panto/menu.png", alt: "Settings", caption: "Settings configuration" },
      { src: "/images/portfolio/panto/table.png", alt: "User Profile", caption: "User profile page" },
      { src: "/images/portfolio/panto/charts_light.png", alt: "Dashboard", caption: "Analytics dashboard" }
    ],
    content: [
      { type: "text", value: "Panto helps AI companies evaluate and improve their training data." },
      { type: "image", value: "/images/portfolio/panto/hero.png", caption: "Main Panto interface" },
      { type: "text", value: "[Describe the main interface and its key features]" },
      { type: "image", value: "/images/portfolio/panto/charts.png", caption: "Data analysis view" },
      { type: "text", value: "[Explain the data analysis capabilities]" },
      { type: "image", value: "/images/portfolio/panto/analysis.png", caption: "Model training interface" },
      { type: "text", value: "[Detail the model training process and interface]" },
      { type: "image", value: "/images/portfolio/panto/form.png", caption: "Results visualization" },
      { type: "text", value: "[Describe the results visualization system]" },
      { type: "image", value: "/images/portfolio/panto/menu.png", caption: "Settings configuration" },
      { type: "text", value: "[Explain the settings system and customization options]" },
      { type: "image", value: "/images/portfolio/panto/table.png", caption: "Data table view" },
      { type: "text", value: "[Describe the data organization and management]" },
      { type: "image", value: "/images/portfolio/panto/charts_light.png", caption: "Analytics dashboard" },
      { type: "text", value: "[Detail the analytics capabilities and insights]" }
    ],
    year: "2024-2025",
    role: "Design Lead & Frontend Engineer",
    link: "https://www.trypanto.com",
    metrics: [
      "68% reduction in handoff issues", 
      "3.1x faster implementation time",
      "86% component reuse rate" 
    ],
    team: [
      { role: "Backend Engineer", name: "Kenan O'Neal", relationship: "co-founder" }
    ]
  },
  { 
    title: 'La Güila Toys: Full Product', 
    tags: ['TOY DESIGN'],
    expanded: false,
    description: "La Güila Toys is a line of toys that explore death and the passage of time, making bleak topics playful. I've created more than 20 toys in total.",
    videoUrl: "/videos/laguila-product-showcase.mp4",
    quickNavThumbnail: "/images/portfolio/laguila/thumbnail.png",
    images: [
      { src: "/images/portfolio/laguila/hero.png", alt: "Toy Collection", caption: "Complete toy collection" },
      { src: "/images/portfolio/laguila/draft.png", alt: "Initial Drafts", caption: "Initial toy design drafts" },
      { src: "/images/portfolio/laguila/sculpt.png", alt: "Sculpting Process", caption: "Toy sculpting process" },
      { src: "/images/portfolio/laguila/pour.png", alt: "Mold Pouring", caption: "Mold pouring process" },
      { src: "/images/portfolio/laguila/stump.png", alt: "Stump Toy", caption: "The Stump toy design" },
      { src: "/images/portfolio/laguila/bigghost.png", alt: "Big Ghost", caption: "The Big Ghost toy" },
      { src: "/images/portfolio/laguila/lilghost.png", alt: "Little Ghost", caption: "The Little Ghost toy" },
      { src: "/images/portfolio/laguila/armadillos.png", alt: "Armadillos", caption: "The Armadillo toy series" }
    ],
    content: [
      { type: "text", value: "La Güila Toys explores complex themes through playful design." },
      { type: "image", value: "/images/portfolio/laguila/hero.png", caption: "Complete toy collection" },
      { type: "text", value: "[Describe the overall toy collection and its themes]" },
      { type: "image", value: "/images/portfolio/laguila/draft.png", caption: "Initial toy design drafts" },
      { type: "text", value: "[Explain the design process and initial concepts]" },
      { type: "image", value: "/images/portfolio/laguila/sculpt.png", caption: "Toy sculpting process" },
      { type: "text", value: "[Detail the sculpting techniques and materials]" },
      { type: "image", value: "/images/portfolio/laguila/pour.png", caption: "Mold pouring process" },
      { type: "text", value: "[Describe the mold making and pouring process]" },
      { type: "image", value: "/images/portfolio/laguila/stump.png", caption: "The Stump toy design" },
      { type: "text", value: "[Explain the concept and design of the Stump toy]" },
      { type: "image", value: "/images/portfolio/laguila/bigghost.png", caption: "The Big Ghost toy" },
      { type: "text", value: "[Describe the Big Ghost toy and its meaning]" },
      { type: "image", value: "/images/portfolio/laguila/lilghost.png", caption: "The Little Ghost toy" },
      { type: "text", value: "[Explain the Little Ghost toy design]" },
      { type: "image", value: "/images/portfolio/laguila/armadillos.png", caption: "The Armadillo toy series" },
      { type: "text", value: "[Detail the Armadillo series concept and execution]" }
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
    ],
    team: [
      { role: "Illustrator", name: "Juan Apéstegui", relationship: "collaborator" }
    ]
  }
] as PortfolioItem[];

export const portfolioItems = writable<PortfolioItem[]>(initialPortfolioItems); 