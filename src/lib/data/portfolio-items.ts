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
      { src: "/images/portfolio/mongodb/hero.png", alt: "Schema Designer Interface", caption: "The redesigned schema designer interface." },
      { src: "/images/portfolio/mongodb/bluesky.gif", alt: "Blue Sky Workshop", caption: "Blue Sky workshop and prototyping." },
      { src: "/images/portfolio/mongodb/before.png", alt: "Previous Interface", caption: "The previous interface before redesign." },
      { src: "/images/portfolio/mongodb/uxr.png", alt: "User Research", caption: "User research findings and insights." },
      { src: "/images/portfolio/mongodb/workshop.gif", alt: "Design Workshop", caption: "Collaborative design workshop with the team." },
      { src: "/images/portfolio/mongodb/figma.png", alt: "Figma Components", caption: "Component library in Figma." },
      { src: "/images/portfolio/mongodb/handoff.png", alt: "Design Handoff", caption: "Design to development handoff process." },
      { src: "/images/portfolio/mongodb/results.png", alt: "Results Dashboard", caption: "Project results and metrics." }
    ],
    content: [
      { type: "text", value: "In Q1 of 2020, Design led a two week series of workshops and rapid prototyping called \"Blue Sky.\"" },
      { type: "text", value: "During those workshops, Design came up with a hunch: the Schema feature –the first feature any user of Realm has to contend with – was difficult to use, and not designed for easy context switching.\n\nThe PMs bought into the core hunch, and after seeing our blue sky prototype, slotted all of Q3 of 2020 to re-design the feature ahead of midQ4.\n\nThe question became: how can we prove that design hunch and ensure the schema feature is as user-friendly as possible?" },
      { type: "image", value: "/images/portfolio/mongodb/before.png" },
      { type: "text", value: "Our first pass at solving this \"hunch\" happened during Blue Sky 2020.\n\nIt was based on two main ideas:\nThe current Schema UI did not pass basic heuristic evaluations.\nThe UI required constant context switching between parts of the UI that were not connected/needed constant refreshing." },
      { type: "image", value: "/images/portfolio/mongodb/bluesky.gif" },
      { type: "text", value: "Then I had the opportunity to confirm our hunch.\nI did this through generative research, prototyping, and evaluative research of prototypes." },
      { 
        type: "image", 
        value: "/images/portfolio/mongodb/uxr.png",
        layout: "side-by-side",
        sideImage: {
          value: "/images/portfolio/mongodb/workshop.gif"
        }
      },
      { type: "text", value: "Our hunch was right! So now I began iterating on designs with the triad. Throughout 5 months, design iteration of wireframes began, informed by the past research, ongoing user research, and input from designers, PMs, and engineers." },
      { type: "image", value: "/images/portfolio/mongodb/figma.png" },
      { type: "text", value: "Finally! We arrived at a winning version. As we moved along into the scoping and specing process with engineering, it became clear that we needed to cut down scope even more or else this project would be too big a bet." },
      { type: "image", value: "/images/portfolio/mongodb/handoff.png" },
      { type: "text", value: "With that in mind, I began cutting down the project where I could, while at the same time advocating for user delight: animated empty states, clearer copy, and \"short-cuts\" for more experienced users." },
      { type: "image", value: "/images/portfolio/mongodb/results.png" },
      { type: "text", value: "From pre-deployment research, our design got rid of all heuristics problems and reduced user friction to zero P0 (blocking) bugs. It also increased user session and task completion (first schema created) for mobile developers, from near 0 to over 100% in two weeks." }
    ],
    year: "2020",
    role: "Lead Designer",
    link: "https://www.figma.com/design/ZHnlaW0cDSk8p3DtLkTw6B/REALMC-6716_-Schema-Revamp?node-id=0-8701&p=f&t=NHJZnhZsYLdwDjCg-0",
    metrics: [
      "Task completion rate from 0->100% in two weeks",
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
    title: 'FireHydrant: Design System', 
    tags: ['UX/UI'],
    expanded: false,
    description: "Increasing the quality of design systemically, in the most efficient way",
    videoUrl: "/videos/firehydrant-design-system.mp4",
    quickNavThumbnail: "/images/portfolio/firehydrant/thumbnail.png",
    images: [
      { src: "/images/portfolio/firehydrant/hero.png", alt: "Design System Overview", caption: "Overview of the design system." },
      { src: "/images/portfolio/firehydrant/before.png", alt: "Previous Design", caption: "Interface before the design system changes." },
      { src: "/images/portfolio/firehydrant/brief.png", alt: "Project Brief", caption: "Initial project brief." },
      { src: "/images/portfolio/firehydrant/consultant.png", alt: "Consulting", caption: "Design system consulting results." },
      { src: "/images/portfolio/firehydrant/cards.png", alt: "Component Cards", caption: "Component card designs, made by two designers, that didn't quite match other, because there were no guidelines." },
      { src: "/images/portfolio/firehydrant/uxr.png", alt: "User Research", caption: "Interviews with stakeholders to understand the ideal state of the design system." },
      { src: "/images/portfolio/firehydrant/planning.png", alt: "Planning Phase", caption: "Initial planning and strategy." },
      { src: "/images/portfolio/firehydrant/planning_2.png", alt: "Planning Details", caption: "Detailed planning process with visuals to get stakeholders on board." },
      { src: "/images/portfolio/firehydrant/vision.png", alt: "Vision", caption: "A vision of what the brand could be, which trickled down to the design system." },
      { src: "/images/portfolio/firehydrant/figma.png", alt: "Figma Setup", caption: "A design system designed by 'primitives' for dev tools, like forms, tables, analytics, etc." },
      { src: "/images/portfolio/firehydrant/results.png", alt: "Results", caption: "The design system then inspired the re-design of the landing page." },
      { src: "/images/portfolio/firehydrant/system.png", alt: "System Architecture", caption: "One final screen, implementing the design system." }
    ],
    content: [
      { type: "text", value: "When I first came to FireHydrant as a Sr. Director of Design, a design system already existed. Unfortunately, it had been created with lots of CSS wrapping over OSS components, way too early into the product-market fit process.\n\nWe also had the issue that there were no guidelines for its usage, and no clear ownership of it on the eng side. This lead to poor performance of the system and of the design ICs.\n\nHow could we raise the bar of UX, while improving the design system, in a resource-efficient way?" },
      { type: "image", value: "/images/portfolio/firehydrant/before.png" },
      { type: "text", value: "At the beginning, we were just trying to stay afloat.\nDesign didn't have enough resources to quickly deliver designs for the features on the roadmap. My first task was to make sure we hired the right way, quickly, and that our designs were maintaining some sort of standard...\n\nWhile hiring, I made sure we started someone on work for guidelines..." },
      { 
        type: "image", 
        value: "/images/portfolio/firehydrant/brief.png",
        layout: "side-by-side",
        sideImage: {
          value: "/images/portfolio/firehydrant/consultant.png"
        }
      },
      { type: "text", value: "Still, we needed more cohesion. Even if I hired someone to make patterns, the process would take too long. In the mean time, I had to start finding a way to get all our partners to agree on a governance style for our design system..." },
      { type: "image", value: "/images/portfolio/firehydrant/cards.png" },
      { type: "text", value: "I set out to listen to every partner. I gathered their requirements, attended FE Guild meetings, and listened to them. Consensus arose: ChakraUI, the OSS system, without embellishments, could probably do the trick." },
      { type: "image", value: "/images/portfolio/firehydrant/uxr.png" },
      { type: "text", value: "Now I had to get the resources to make it happen...\nOkay, what is the actual plan to make that reversal to OSS happen? Since we had no FE Lead assigned to the project, I had to convince my CTO by speaking his language: memos and pro/con plans." },
      { type: "image", value: "/images/portfolio/firehydrant/planning.png" },
      { type: "text", value: "But it was hard to get resources without a visual guide. Even if in theory both the FE Guild, Design, the founders and the CTO agreed on the need to devolve to pure OSS, there was confusion around what that future could look like when it came down to the specifics.\n\nIn conjunction with my newly hired Staff and Sr Designer, we set out to build a tangible vision." },
      { type: "image", value: "/images/portfolio/firehydrant/planning_2.png" },
      { type: "text", value: "We started off with a really broad idea of the future\nI made sure my Sr Designer, who had the most experience with visual design, had at least a week to work on this with me..." },
      { type: "image", value: "/images/portfolio/firehydrant/vision.png" },
      { type: "text", value: "From there, I took it on myself. Since all the designers were busy at work, and we needed a quick turnaround on the vision, I decided to work on this myself. I began creating what I called \"Dev SaaS templates\": a table template, an analytics template, a form template, a specific item template, and a settings template, plus a specific to FH dashboard template." },
      { type: "image", value: "/images/portfolio/firehydrant/figma.png" },
      { type: "text", value: "Our efforts influenced marketing heavily. As marketing began recruiting brand designers and FE engineers, they were onboarded unto our work and that quickly influenced the new landing page they were creating, which pushed our work further since everyone began to see the vision as integral to their own work." },
      { type: "image", value: "/images/portfolio/firehydrant/results.png" },
      { type: "text", value: "Not only did we do a great job convincing all partners of the importance of this work, but we got approval for a Design System Eng, and we got 3 engineers internally assigned to work on the migration back to vanilla ChakraUI.\n\nBecause of that, we eliminated all P0 and P1 usability bugs in less than 2 weeks (after years of not working on them)." },
      { type: "image", value: "/images/portfolio/firehydrant/system.png" },
      { type: "text", value: "Work on the design system has affected our way of working with FE, got us to hiring a design systems engineer, and has already changed the color palette, reversed all components to vanilla ChakraUI, and reduced design and eng turnaround times by 30%." }
    ],
    year: "2022",
    role: "Design Director",
    link: "https://www.firehydrant.com",
    metrics: [
      "Convinced exec team to hire a design systems engineer",
      "Reduced design and eng turnaround times by 30%"
    ],
    team: [
      { role: "Principal Designer", name: "Kate Farrar", relationship: "direct report" },
      { role: "Senior Designer", name: "Nick Tasato", relationship: "direct report" },
      { role: "Engineering Manager", name: "Dylan Nielsen", relationship: "cross-functional partner" }
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
      { src: "/images/portfolio/roblox/hero.png", alt: "Creator Hub Interface", caption: "The new Creator Hub interface." },
      { src: "/images/portfolio/roblox/before.png", alt: "Previous Interface", caption: "The original PM sketches, made because he did not have a designer." },
      { src: "/images/portfolio/roblox/before2.png", alt: "Legacy Interface", caption: "Another view of a PM sketch for the UI, before I came into the project." },
      { src: "/images/portfolio/roblox/scopes.png", alt: "API Scopes", caption: "API scope management interface." },
      { src: "/images/portfolio/roblox/scopesfinal.png", alt: "Final Scopes", caption: "Final API scope design, with a focus on the user giving permissions." },
      { src: "/images/portfolio/roblox/designsystems.png", alt: "Design Systems", caption: "Several of the new design system components and guidelines created for stepper flows." },
      { src: "/images/portfolio/roblox/uxr.png", alt: "User Research", caption: "User research findings from focus groups in which we showeed the designs." },
      { src: "/images/portfolio/roblox/figma.png", alt: "Figma Components", caption: "The full final Figma flow." }
    ],
    content: [
      { type: "text", value: "In 2021, I was new to Roblox but tasked, as a principal designer, to design OAuth2 permission keys for our web developer portal." },
      { type: "text", value: "The PM had an overall idea of what he wanted, but before my arrival at Roblox hadn't had any design counterparts.\n\nThere were two main issues with this project:\nFrom a PM pov: what is the ideal flow to teach people how to use OAuth2?\nFrom a design pov: wait, do users even know how to use API keys, let alone OAuth2?" },
      { type: "image", value: "/images/portfolio/roblox/before.png" },
      { type: "text", value: "As soon as I saw what the PM had worked on, I started thinking about the average Roblox dev. I asked him if we had any data on who would use this; we didn't. But it was an overall strategy to make things that would work for beginners and experts." },
      { type: "image", value: "/images/portfolio/roblox/before2.png" },
      { type: "text", value: "But we needed to deliver in a matter of two weeks.\nIn a day, I created advanced wireframes with a couple of provocations in IA, naming, and visuals, to test what questions would come from PMs and Engineers. The results: oh, I hadn't thought about it that way. These are good points!" },
      { type: "image", value: "/images/portfolio/roblox/scopes.png" },
      { type: "text", value: "That gave me an opening for research. The PM invited me to show my designs to users he was going to interview for a separate project.\n\nI accepted and made 4 more versions of my designs to try out." },
      { type: "image", value: "/images/portfolio/roblox/figma.png" },
      { type: "text", value: "The results came in. One version was an obvious winner over others: the one that was most friendly to new users by having access to docs, simpler wording, and clear IA.\n\nI still did the appropriate results analysis to cover my bases (and hacked my way to some simple quant results by asking people to \"respond\" to variants in Zoom chat, at the same time)." },
      { type: "image", value: "/images/portfolio/roblox/uxr.png" },
      { type: "text", value: "Through 4 internal reviews, in the expanse of two weeks, we got to final results that were vetted by engineering and PM, before starting development." },
      { type: "image", value: "/images/portfolio/roblox/scopesfinal.png" },
      { type: "text", value: "In this case, metrics were not well defined by PM. Since this was a 0->1 case, and I had just started at Roblox, I didn't push too harshly for them.\n\nBut I did get other amazing results: this process set a precedent for other designers in the company, who started doing this kind of fast research on the fly, and contributed to a design system plan that emerged as a part of this project (by showing how patterns would make overall development faster)." },
      { type: "image", value: "/images/portfolio/roblox/designsystems.png" }
    ],
    year: "2021",
    role: "Principal Designer",
    link: "https://create.roblox.com/",
    metrics: [
      "10 new design system components",
      "200% increase in API key usage"
    ],
    team: [
      { role: "Senior Designer", name: "Sony Verma", relationship: "teammate" },
      { role: "Product Manager", name: "Eric Sun", relationship: "cross-functional partner" },
      { role: "Engineering Manager", name: "Achint Verma", relationship: "cross-functional partner"}
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
      { src: "/images/portfolio/panto/hero.png", alt: "Panto Interface", caption: "Main Panto interface." },
      { src: "/images/portfolio/panto/before.png", alt: "Original Landing", caption: "The original landing page." },
      { src: "/images/portfolio/panto/landing.png", alt: "Landing Page", caption: "The second landing page of Panto, developed by me." },
      { src: "/images/portfolio/panto/analysis.png", alt: "Analysis View", caption: "Data analysis visualization." },
      { src: "/images/portfolio/panto/charts.png", alt: "Charts Dark", caption: "Data visualization in dark mode." },
      { src: "/images/portfolio/panto/charts_light.png", alt: "Charts Light", caption: "Data visualization in light mode." },
      { src: "/images/portfolio/panto/table.png", alt: "Data Table", caption: "Developer-friendly data table view." },
      { src: "/images/portfolio/panto/form.png", alt: "Form Interface", caption: "Optimized form interface." }
    ],
    content: [
      { type: "text", value: "The release of DeepSeek R1 has proven that AI is not a \"winner takes all\" technology. Ultimately, there will be thousands, if not millions, of AI models used by everyone, made by smaller and smaller teams with less and less compute." },
      { type: "text", value: "My cofounder and I predicted that this trend will only accelerate. Tools like Cursor will continue to make development accessible to everyone, and just as millions of developers around the world create apps, **millions** of people will create models to sell to others as products, or to use personally." },
      { type: "text", value: "At first, people won't be able to pre-train models from scratch. Instead, they will post-train models that offer open weights. For that purpose, understanding how that data influences model behavior will be key." },
      { type: "image", value: "/images/portfolio/panto/before.png" },
      { type: "text", value: "Originally, this project was meant to focus on the licensing of IP for the age of AI. But as we did more research, my cofounder and I realized that the main problem was the evaluation of what IP was valuable to AI to begin with." },
      { type: "image", value: "/images/portfolio/panto/landing.png" },
      { type: "text", value: "For that reason, we built a second version of Panto that consisted of data valuation tools that sample, analyze, and select data to make models 10x better. Our approach breaks the black-box of models and uncovers the true relevance of data to them." },
      { type: "text", value: "Panto is made up of two features. The first one is data scoring. Data is live-streamed from the company into Panto. As the data trickles in, we compare it to a baseline of data and crack open the black-box of models to see how they react to the company's data. We give each data point a novelty score." },
      { type: "image", value: "/images/portfolio/panto/analysis.png" },
      { type: "text", value: "The analysis is then visualized in charts. These charts help explain the complex inner workings of LLMs to users that are technical (developers), but not experienced in machine learning." },
      { type: "image", value: "/images/portfolio/panto/charts.png" },
      { type: "text", value: "And of course, to keep the experience dev friendly, I implemented light mode and dark mode out of the gate." },
      { type: "image", value: "/images/portfolio/panto/charts_light.png" },
      { type: "text", value: "The whole design is meant to be developer friendly. Tables include zebra stripping and are mobile friendly, and forms and steppers are optimized for top-of-the-line UX." },
      { 
        type: "image", 
        value: "/images/portfolio/panto/table.png",
        layout: "side-by-side",
        sideImage: {
          value: "/images/portfolio/panto/form.png"
        }
      },
      { type: "text", value: "Overall, this project was my \"build a technical tool\" dream. It landed us two design partners off the bat, and we raised a sizable pre-seed for it after trying many different iterations of the product until we reached this one. Unfortunately, my personal life suffered some setbacks and the project has slowed down its pace." }
    ],
    year: "2024-2025",
    role: "Design Lead & Frontend Engineer",
    link: "https://www.trypanto.com",
    metrics: [
      "Two design partners", 
      "400k raised in pre-seed"
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
      { src: "/images/portfolio/laguila/hero.png", alt: "Toy Collection", caption: "Complete toy collection." },
      { src: "/images/portfolio/laguila/armadillos.png", alt: "Armadillos", caption: "The Armadillo toy series, inspired by Mexican alebrijes." },
      { src: "/images/portfolio/laguila/draft.png", alt: "Initial Drafts", caption: "Initial toy design drafts from FIT class." },
      { src: "/images/portfolio/laguila/sculpt.png", alt: "Sculpting Process", caption: "Self-taught toy sculpting process." },
      { src: "/images/portfolio/laguila/pour.png", alt: "Mold Pouring", caption: "Self-taught mold pouring process." },
      { src: "/images/portfolio/laguila/stump.png", alt: "Stump Toy", caption: "The Stump toy design." },
      { src: "/images/portfolio/laguila/bigghost.png", alt: "Big Ghost", caption: "The Big Ghost toy." },
      { src: "/images/portfolio/laguila/lilghost.png", alt: "Little Ghost", caption: "The Little Ghost toy." }
    ],
    content: [
      { type: "text", value: "In 2023, in an effort to continue my exploration into designing playful interfaces and products, I became very interested in learning how to design resin toys." },
      { type: "image", value: "/images/portfolio/laguila/armadillos.png" },
      { type: "text", value: "I began by attending a toy design class at FIT, in Manhattan. I learned the basics of 3D drawn design focused on children toys." },
      { type: "image", value: "/images/portfolio/laguila/draft.png" },
      { type: "text", value: "After that, I self-taught the basics of sculpting and resin pouring." },
      { 
        type: "image", 
        value: "/images/portfolio/laguila/sculpt.png",
        layout: "side-by-side",
        sideImage: {
          value: "/images/portfolio/laguila/pour.png"
        }
      },
      { type: "text", value: "All of this resulted in 20+ toy designs, two of which have been featured in art galleries." },
      { type: "image", value: "/images/portfolio/laguila/stump.png" },
      { type: "image", value: "/images/portfolio/laguila/bigghost.png" },
      { type: "image", value: "/images/portfolio/laguila/lilghost.png" }
    ],
    year: "2023-2025",
    role: "Toy Designer",
    link: "https://www.instagram.com/laguila_toys",
    metrics: [
      "Featured in 2 art shows at Ghost Fox Toys Gallery",
      "Completely self-taught",
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
      { src: "/images/portfolio/torch/instructions.png", alt: "The second page of the instructions, featuring icons of a lamplight and a torch.", caption: "The second page of instructions." },
      { src: "/images/portfolio/torch/outtake.png", alt: "A page signaling all the ways a player can create a scene, by focusig on their senses.", caption: "A page signaling all the ways a player can create a scene, by focusing on their senses." },
      { src: "/images/portfolio/torch/rounds.png", alt: "A page explaining that playes must be lying on the floor, and each round the lamplight is moved in a circular motion.", caption: "The page that explains the mechanics of the game." },
      { src: "/images/portfolio/torch/winner.png", alt: "A group of people announcing the win of the Golden Cobra Award for Torch.", caption: "The announcement of the Golden Cobra Award." }
    ],
    content: [
      { type: "text", value: "Torch is a freeform Live Action Roleplaying game. It was born out of a game design retreat I attend every year in New Jersey, as part of my desire to participate in the Golden Cobra Challenge, a very well known LARP design competition. This game won the Best Multi-Generational Game award at Golden Cobra. The award was announced at Metatopia 2018." },
      { type: "image", value: "/images/portfolio/torch/instructions.png" },
      { type: "text", value: "The game puts players in the position of citizens of a country that has been recently granted independence, out of the blue. Players must then travel through time telling the stories of the impact that such an unexpected event has on the country and the individual lives of its citizens, from the Independence Day to 500 years in the future." }
    ],
    year: "2018-2020",
    role: "Lead Game Designer",
    link: "https://mentapurpura.itch.io/torch",
    metrics: [
      "Winner of Golden Cobra Award",
      "Featured at Metatopia 2018"
    ],
    team: [
      { role: "Illustrator", name: "Juan Apéstegui", relationship: "collaborator" }
    ]
  }
] as PortfolioItem[];

export const portfolioItems = writable<PortfolioItem[]>(initialPortfolioItems); 