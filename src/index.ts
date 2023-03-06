import type {RequestInfo, RequestInit, Response} from 'node-fetch';
import fetch from 'node-fetch';

interface Fancyfetch {
  resource: RequestInfo;
  options?: RequestInit | null | undefined;
  extras?: {
    maxAttempts?: number;
    validateResponse?: (response: Response) => Promise<boolean> | boolean;
    onError?: () => void;
    onRetrySuccess?: () => void;
    onRetryError?: () => void;
  };
}

const fancyfetch = async (
  resource: Fancyfetch[`resource`],
  options: Fancyfetch[`options`],
  extras: Fancyfetch[`extras`]
): Promise<Response | null> => {
  if (typeof resource !== `string`)
    throw new Error(
      `Error in fancyfetch: A valid fetch resource was not provided\n\nresource: ${JSON.stringify(
        resource,
        null,
        2
      )}`
    );
  if (options && typeof options !== `object`)
    throw new Error(
      `Error in fancyfetch: options must be a valid object.\n\noptions: ${JSON.stringify(
        options,
        null,
        2
      )}`
    );
  if (extras && typeof extras !== `object`)
    throw new Error(
      `Error in fancyfetch: extras must be a valid object.\n\nextras: ${JSON.stringify(
        extras,
        null,
        2
      )}`
    );
  if (
    typeof extras?.maxAttempts === `number` &&
    (!Number.isInteger(extras.maxAttempts) || extras.maxAttempts < 1)
  )
    throw new Error(
      `Error in fancyfetch: extras.maxAttempts must be a positive integer.\n\nextras.maxAttempts: ${extras.maxAttempts}`
    );
  if (
    extras?.validateResponse &&
    typeof extras?.validateResponse !== `function`
  )
    throw new Error(
      `Error in fancyfetch: extras.validateResponse must be a valid function.\n\nextras.validateResponse: ${String(
        extras?.validateResponse
      )}`
    );
  if (extras?.onError && typeof extras.onError !== `function`)
    throw new Error(
      `Error in fancyfetch: extras.onError must be a valid function.\n\nextras.onError: ${String(
        extras.onError
      )}`
    );
  if (extras?.onRetrySuccess && typeof extras.onRetrySuccess !== `function`)
    throw new Error(
      `Error in fancyfetch: extras.onRetrySuccess must be a valid function.\n\nextras.onRetrySuccess: ${String(
        extras.onRetrySuccess
      )}`
    );
  if (extras?.onRetryError && typeof extras.onRetryError !== `function`)
    throw new Error(
      `Error in fancyfetch: extras.onRetryError must be a valid function.\n\nextras.onRetryError: ${String(
        extras.onRetryError
      )}`
    );

  const maxAttempts = extras?.maxAttempts ?? 1;
  let attempts = 0;

  const tryFetch = async (): Promise<Response | null> => {
    attempts++;
    if (attempts > maxAttempts) return null;

    try {
      const response: Response = await fetch(resource, {
        highWaterMark: 1024 * 1024,
        ...options,
      });
      const validResponse = extras?.validateResponse
        ? !!(await extras.validateResponse(response))
        : true;

      if (validResponse) {
        if (attempts > 1) {
          console.log(`fancyfetch fetch retry successful`);

          if (extras?.onRetrySuccess) {
            extras.onRetrySuccess();
          }
        }

        return response;
      } else {
        if (maxAttempts === 1) return null;

        console.error(
          `Error in fancyfetch: Fetch was successful but didn't pass validateResponse. Retrying...`
        );

        if (extras?.onRetryError) extras.onRetryError();
        return await tryFetch();
      }
    } catch {
      if (maxAttempts === 1) return null;
      console.error(`Error in fancyfetch: Failed to fetch. Retrying...`);
      if (extras?.onRetryError) extras.onRetryError();
      return await tryFetch();
    }
  };

  const result = await tryFetch();

  const errorMessage = `Error in fancyfetch: No successful responses were returned.\n\nresource: ${JSON.stringify(
    resource,
    null,
    2
  )}\n\noptions: ${JSON.stringify(
    options,
    null,
    2
  )}\n\nextras: ${JSON.stringify(extras, null, 2)}`;

  if (result === null) {
    if (extras?.onError) {
      console.error(errorMessage);
      extras.onError();
    } else {
      throw new Error(errorMessage);
    }
  }

  return result;
};

export default fancyfetch;
