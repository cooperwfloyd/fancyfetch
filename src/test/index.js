import fancyfetch from '../index.js';

(async () => {
  await fancyfetch(`https://www.example.com`, null, {
    validateResponse: (response, index) => {
      if (index !== 5 || response.status !== 200) return false;
      return true;
    },
    maxTries: 10,
  });
})();
