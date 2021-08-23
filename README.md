# rollup-plugin-simple-copy

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
