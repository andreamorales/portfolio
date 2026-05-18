# Personal Portfolio Site

A clean, modern portfolio site built with SvelteKit and Svelte 5.

## Features

- Responsive design for all devices
- Light and dark theme support
- Smooth animations and transitions
- Reusable component structure
- Custom CSS styling with variables
- Contact form with validation
- Project showcase
- Optimized for performance

## Development

This project uses SvelteKit with TypeScript.

### Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Encrypting pass-protected case studies

Plaintext JSON lives at the **repository root** (next to `my-portfolio/`), e.g. `most-recent2.plaintext.json`. Encrypted output is written under `src/lib/data/secure/`.

Use **`--`** so npm forwards your passphrase to the script (everything after `--` is script args, not npm flags):

```bash
# Default: most-recent2 → src/lib/data/secure/most-recent2.encrypted.json
npm run encrypt -- <your-passphrase>

# most-recent1 (large Layer Health payload)
npm run encrypt -- <your-passphrase> 1
# or: npm run encrypt -- <your-passphrase> most-recent1
```

For arbitrary input/output paths:

```bash
npm run encrypt:case-study -- --in ../my-plaintext.json --out ./src/lib/data/secure/my-case.encrypted.json --password <your-passphrase>
```

### Project Structure

- `src/routes`: Page layouts and routes
- `src/lib/components`: Reusable components
  - `common`: Shared UI elements
  - `about`: About section components
  - `projects`: Project showcase components
  - `contact`: Contact form components
  - `hero`: Hero section components
- `src/lib/styles`: CSS styles
  - `variables.css`: Theme variables and design tokens
  - `global.css`: Global styles
  - `utilities.css`: Utility classes
  - `animations.css`: Animation keyframes and utilities
- `src/lib/fonts`: Custom font files
- `static`: Static assets like favicon

## Technologies

- SvelteKit
- TypeScript
- CSS3 (Custom properties, Animations)
- Responsive Design
