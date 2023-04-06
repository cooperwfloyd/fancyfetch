export interface FancyfetchOptions extends RequestInit {
  highWaterMark?: number;
}

export interface FancyfetchExtras {
  fetch?: () => Promise<Response>;
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
  resource: RequestInfo,
  options?: FancyfetchOptions,
  extras?: FancyfetchExtras
  /* eslint-disable @typescript-eslint/no-explicit-any */
): Promise<Response>;
/* eslint-enable @typescript-eslint/no-explicit-any */

export default fancyfetch;
