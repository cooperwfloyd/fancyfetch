# 💅 fancyfetch

`fancyfetch` is a simple, lightweight and isomorphic ES Module that extends the `fetch` API to allow for graceful error handling, response validation, automatic retries, and the ability to use any `fetch` API package.

## 🙂 Basic usage

Use it client-side in the browser or on the server just like the standard `fetch` API — `fancyfetch` will automatically locate and use Node's global `fetch` API or your browser's native `fetch` API.

```js
import fancyfetch from '@cooperwfloyd/fancyfetch';

const data = await fancyfetch('https://www.example.com');
```

## 🥳 Fancy usage

**The third argument is available for all of fancyfetch's extensions, including:**

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
    onError: () => console.error('No successful attempts'),
  }
);
```

## ✏️ Reference

- `resource` (required): <a href="https://developer.mozilla.org/en-US/docs/Web/API/fetch#parameters" target="_blank" rel="noopener noreferrer">A valid `fetch.resource`</a>
- `options`: <a href="https://developer.mozilla.org/en-US/docs/Web/API/fetch#parameters" target="_blank" rel="noopener noreferrer">A valid `fetch.options` </a>
- `extras`
  - `fetch`: function
    - The `fetch` API (ex. `fetch`, `node-fetch`, `isomorphic-fetch`) that requests should use (default, in order of specificity: `fetch`, `global.fetch`, `window.fetch`)
  - `log`: boolean
    - Dictates whether or not fancyfetch's console statements should be fired (default: `true`)
  - `validateResponse`: function
    - This callback function allows for checking the response to determine it's validity. It sends the response as an argument and should return a truthy or falsy value since fancyfetch will use a boolean to determine the response's validity.
  - `retries`: number
    - Specifies the maximum number of times that the request should be attempted (default: `1`). The `validateResponse` callback should be used whenever `retries` is greater than one since fancyfetch will not know when to break out of the recursive retry loop without it.
