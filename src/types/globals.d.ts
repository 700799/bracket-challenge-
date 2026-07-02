// Allow side-effect CSS imports during standalone typecheck (Next normally
// provides this via next-env.d.ts, which is only generated at build time).
declare module "*.css";
