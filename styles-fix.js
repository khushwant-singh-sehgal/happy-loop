#!/usr/bin/env node

const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

// Colors for console output
const colors = {
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

console.log(`${colors.blue}Happy Loop Styles Fix${colors.reset}`);
console.log('Copying styles from https://happy-loop-land.lovable.app/');
console.log('');

// Step 1: Install the exact versions of packages used on the live site
console.log(`${colors.yellow}Step 1: Installing exact package versions...${colors.reset}`);
try {
  execSync('npm uninstall tailwindcss autoprefixer postcss', { stdio: 'inherit' });
  execSync('npm install -D tailwindcss@3.3.3 autoprefixer@10.4.15 postcss@8.4.29', { stdio: 'inherit' });
  console.log(`${colors.green}✓ Packages installed successfully${colors.reset}`);
} catch (error) {
  console.error(`${colors.red}Failed to install packages:${colors.reset}`, error);
  process.exit(1);
}

// Step 2: Create tailwind.config.js with the exact configuration from the live site
console.log(`${colors.yellow}Step 2: Creating tailwind.config.js...${colors.reset}`);
const tailwindConfig = `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        purple: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
        },
        pink: {
          50: '#fdf2f8',
          100: '#fce7f3',
          200: '#fbcfe8',
          300: '#f9a8d4',
          400: '#f472b6',
          500: '#ec4899',
          600: '#db2777',
          700: '#be185d',
          800: '#9d174d',
          900: '#831843',
        },
        gray: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
        },
        teal: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
        },
      },
      fontFamily: {
        sans: ['var(--font-quicksand)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}`;

try {
  fs.writeFileSync(path.join(process.cwd(), 'tailwind.config.js'), tailwindConfig);
  console.log(`${colors.green}✓ tailwind.config.js created${colors.reset}`);
} catch (error) {
  console.error(`${colors.red}Failed to create tailwind.config.js:${colors.reset}`, error);
  process.exit(1);
}

// Step 3: Create postcss.config.js
console.log(`${colors.yellow}Step 3: Creating postcss.config.js...${colors.reset}`);
const postcssConfig = `module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}`;

try {
  fs.writeFileSync(path.join(process.cwd(), 'postcss.config.js'), postcssConfig);
  console.log(`${colors.green}✓ postcss.config.js created${colors.reset}`);
  
  // Remove postcss.config.mjs if it exists
  if (fs.existsSync(path.join(process.cwd(), 'postcss.config.mjs'))) {
    fs.unlinkSync(path.join(process.cwd(), 'postcss.config.mjs'));
    console.log(`${colors.green}✓ Removed postcss.config.mjs${colors.reset}`);
  }
} catch (error) {
  console.error(`${colors.red}Failed to create postcss.config.js:${colors.reset}`, error);
  process.exit(1);
}

// Step 4: Update globals.css
console.log(`${colors.yellow}Step 4: Updating globals.css...${colors.reset}`);
const globalsCss = `@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  @apply bg-white text-gray-900;
}

@layer components {
  .btn-primary {
    @apply inline-block bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-full transition-all transform hover:scale-105;
  }
  
  .btn-secondary {
    @apply inline-block bg-white hover:bg-gray-100 text-purple-600 font-bold py-3 px-6 rounded-full border-2 border-purple-600 transition-all transform hover:scale-105;
  }
  
  .card {
    @apply bg-white rounded-2xl shadow-lg p-6 transition-all hover:shadow-xl;
  }
  
  .section {
    @apply py-16 md:py-24;
  }
  
  .container-custom {
    @apply max-w-7xl mx-auto px-4 sm:px-6 lg:px-8;
  }
}`;

try {
  fs.writeFileSync(path.join(process.cwd(), 'src/app/globals.css'), globalsCss);
  console.log(`${colors.green}✓ globals.css updated${colors.reset}`);
} catch (error) {
  console.error(`${colors.red}Failed to update globals.css:${colors.reset}`, error);
  process.exit(1);
}

// Step 5: Update next.config.js
console.log(`${colors.yellow}Step 5: Updating next.config.js...${colors.reset}`);
const nextConfig = `/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
};

module.exports = nextConfig;`;

try {
  fs.writeFileSync(path.join(process.cwd(), 'next.config.js'), nextConfig);
  console.log(`${colors.green}✓ next.config.js updated${colors.reset}`);
} catch (error) {
  console.error(`${colors.red}Failed to update next.config.js:${colors.reset}`, error);
  process.exit(1);
}

console.log(`${colors.blue}All style fixes have been applied!${colors.reset}`);
console.log(`Run 'npm run dev' to start the development server and see the changes.`); 