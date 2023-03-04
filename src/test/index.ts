import type {Response} from 'node-fetch';
import fancyfetch from '../index';

void (async (): Promise<void> => {
  await fancyfetch(`https://www.example.com`, undefined, {
    validateResponse: (response: Response, index: number) => {
      if (index !== 5 || response.status !== 200) return false;
      return true;
    },
    maxAttempts: 10,
  });
})();
