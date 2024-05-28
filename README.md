# rollup-plugin-simple-copy / vite-plugin-simple-copy

## How to use

```javascript
// rollup.config.js
import copy from "rollup-plugin-simple-copy";

export default {
  // ...
  plugins: [
    copy({
      targets: [
        { src: 'static', dest: 'dist' },
      ],
    }),
  ],
};
```

```javascript
// vite.config.js
import { defineConfig } from 'vite';
import copy from "rollup-plugin-simple-copy/vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    copy({
      extMap: {
        ".svg": "image/svg+xml",
      },
      targets: [
        {
          src: "node_modules/asset-library/dist/assets",
          dest: "assets",
          filter: (src) => /.+\.svg$/.test(src),
        }
      ],
    }),
  ],
})
```
