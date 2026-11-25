// Lets editors running newer TypeScript (which checks side-effect imports) accept
// `import './globals.css'` without a @ts-expect-error. Next.js bundles the CSS itself.
declare module '*.css';
