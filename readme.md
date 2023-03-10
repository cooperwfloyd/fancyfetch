# 💅 fancyfetch

`fancyfetch` is a simple, lightweight and isomorphic ES Module that extends the Fetch API to allow for graceful error handling, response validation, automatic retries, and the ability to use any `fetch` API package.

## ⚙️ Basic usage

Use it client-side in the browser or on the server just like the standard `fetch` API — `fancyfetch` will automatically locate and use Node's global `fetch` API or your browser's native `fetch` API

```js
import fancyfetch from '@cooperwfloyd/fancyfetch';

const data = await fancyfetch('https://www.example.com', {method: 'POST'});
```

## 🥳 Fancy usage

The third argument is available for all of fancyfetch's extensions, including:

👇 The ability to use a custom `fetch` API instead of the global default

```js
import fancyfetch from '@cooperwfloyd/fancyfetch';
import fetch from 'node-fetch';

const data = await fancyfetch(
  'https://www.example.com/a-large-server-side-request',
  {highWaterMark: 2048 * 2048},
  {fetch}
);
```

👇 The ability to gracefully auto-retry requests if they fail or if their responses don't return `true` in a custom validation callback

```js
import fancyfetch from '@cooperwfloyd/fancyfetch';

const data = await fancyfetch(
  'https://www.example.com/json',
  {
    headers: {
      'Content-Type': 'application/json',
    },
  },
  {
    retries: 10,
    retryDelay: 1000,
    validateResponse: async (response) => {
      try {
        const clone = await response?.clone();
        const json = await clone?.json();
        return !!json?.data;
      } catch {
        return false;
      }
    },
    onRetrySuccess: () => console.log('Successful retry'),
    onRetryError: () => console.error('Failed retry'),
  }
);
```
