import daisyui from 'daisyui';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}', './node_modules/saraui/src/**/*.js'],
  theme: {
    extend: {}
  },
  plugins: [daisyui]
};
