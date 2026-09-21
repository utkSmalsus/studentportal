/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/webparts/**/*.{ts,tsx}'],
  // Tailwind v3 (not v4) on purpose: v4's theme relies on :root-scoped CSS
  // variables, which don't reach a Shadow DOM. v3's utilities are plain
  // static CSS, so they work unmodified once scoped into the shadow root.
  corePlugins: { preflight: true },
  theme: { extend: {} },
  plugins: [],
};
