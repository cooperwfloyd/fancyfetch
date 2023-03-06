import type {Response} from 'node-fetch';
import fancyfetch from '../index';

void (async (): Promise<void> => {
  const result = await fancyfetch(`https://www.example.com`, null, {
    validateResponse: (response: Response, index: number) => {
      if (index !== 5 || response.status !== 200) return false;
      return true;
    },
    maxAttempts: 10,
  });

  console.log(result?.status);
})();
