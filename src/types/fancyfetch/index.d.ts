import type {RequestInfo, RequestInit, Response} from '@types/node-fetch';
import type {URL} from '@types/node/url';

export interface FancyfetchOptions extends RequestInit {
  highWaterMark?: number;
}

export interface FancyfetchExtras {
  fetch?: (
    /* eslint-disable @typescript-eslint/no-redundant-type-constituents */
    resource: RequestInfo | URL,
    /* eslint-enable @typescript-eslint/no-redundant-type-constituents */
    options: FancyfetchOptions
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
  /* eslint-disable @typescript-eslint/no-redundant-type-constituents */
  resource: RequestInfo | URL,
  /* eslint-enable @typescript-eslint/no-redundant-type-constituents */
  options?: FancyfetchOptions,
  extras?: FancyfetchExtras
): Promise<Response>;

export default fancyfetch;
