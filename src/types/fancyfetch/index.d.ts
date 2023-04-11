import type {RequestInfo, RequestInit, Response} from '@types/node-fetch';
import type {URL} from '@types/node/url';

export interface FancyfetchOptions extends RequestInit {
  highWaterMark?: number;
}

export interface Fetch {
  /* eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents */
  resource: RequestInfo | URL;
  options?: FancyfetchOptions;
}

export interface FancyfetchExtras {
  fetch?: (
    resource: Fetch['resource'],
    options?: Fetch['options']
  ) => Promise<Response>;
  log?: boolean;
  validateResponse?: (response: Response) => Promise<boolean> | boolean;
  maxAttempts?: number;
  retryDelay?: number;
  /* eslint-disable @typescript-eslint/no-explicit-any */
  onError?: () => any;
  onRetryError?: () => any;
  onRetrySuccess?: () => any;
  /* eslint-enable @typescript-eslint/no-explicit-any */
}

export declare function fancyfetch(
  resource: Fetch['resource'],
  options?: Fetch['options'],
  extras?: FancyfetchExtras
): Promise<Response>;

export default fancyfetch;
