export default interface Fancyfetch {
  resource: RequestInfo;
  options?: RequestInit & {
    highWaterMark?: number;
  };
  extras?: {
    fetch?: () => Promise<Response>;
    log?: boolean;
    validateResponse?: (response: Response) => Promise<boolean> | boolean;
    maxAttempts?: number;
    retryDelay?: number;
    /* eslint-disable @typescript-eslint/no-explicit-any */
    onError?: () => any;
    onRetryError: () => any;
    onRetrySuccess: () => any;
    /* eslint-enable @typescript-eslint/no-explicit-any */
  };
}
