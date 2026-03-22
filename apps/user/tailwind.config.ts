import type { Config } from "tailwindcss";
import sharedConfig from "@repo/tailwind-config";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "../../packages/ui/src/**/*.{js,ts,jsx,tsx,mdx}",
    "../../packages/auth/src/**/*.{js,ts,jsx,tsx,mdx}",
    "../../packages/support/src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  presets: [sharedConfig],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'hero-glow': 'radial-gradient(ellipse 80% 60% at 50% -20%, rgba(139, 92, 246, 0.15), transparent)',
      },
      keyframes: {
        'typewriter': {
          'from': { width: '0' },
          'to': { width: '100%' },
        },
      },
      animation: {
        'typewriter': 'typewriter 2s steps(40) forwards',
      },
    },
  },
};
export default config;
