import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    root: __dirname,
    rules: {
      // Tailwind is applied only to the global stylesheet. `.module.css` files must
      // keep Turbopack's default CSS-Modules pipeline (scoped class names + the JS
      // class map); routing them through @tailwindcss/turbopack drops that map, so
      // `styles.page` evaluates to `undefined`, every class renders as the literal
      // string "undefined", and the page loads completely unstyled.
      "**/globals.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
