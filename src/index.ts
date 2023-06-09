import type Fancyfetch from './types/fancyfetch';
// TODO: add debug option to output info
// TODO: readme
// TODO: add an option for max wait time
// TODO: TOC

const fancyfetch: typeof Fancyfetch = async (resource, options, extras) => {
  const extrasToUse = {
    log: true,
    maxAttempts: 1,
    ...extras,
  };

  if (extrasToUse?.fetch && typeof extrasToUse?.fetch !== `function`)
    throw new Error(
      `Error in fancyfetch: extras.fetch must be a valid function.\n\nextras.fetch: ${String(
        extrasToUse?.fetch
      )}`
    );

  const fetchToUse =
    typeof extrasToUse?.fetch && typeof extrasToUse?.fetch === `function`
      ? extrasToUse.fetch
      : typeof fetch === `function`
      ? fetch
      : typeof global !== `undefined` && typeof global?.fetch === `function`
      ? global.fetch
      : typeof window !== `undefined` && typeof window?.fetch === `function`
      ? window.fetch
      : null;

  if (typeof fetchToUse !== `function`)
    throw new Error(
      `Error in fancyfetch: fetchToUse must be a valid function.\n\nfetchToUse: ${String(
        fetchToUse
      )}`
    );

  if (typeof resource !== `string` && typeof resource !== `object`)
    throw new Error(
      `Error in fancyfetch: A valid fetch resource was not provided\n\nreference: https://developer.mozilla.org/en-US/docs/Web/API/fetch#parameters\n\nresource: ${JSON.stringify(
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
  if (
    extrasToUse?.maxAttempts &&
    (typeof extrasToUse?.maxAttempts !== `number` ||
      !Number.isInteger(extrasToUse.maxAttempts) ||
      extrasToUse.maxAttempts < 1)
  )
    throw new Error(
      `Error in fancyfetch: extras.maxAttempts must be a positive integer.\n\nextras.maxAttempts: ${extrasToUse.maxAttempts}`
    );
  if (
    extrasToUse?.retryDelay &&
    (typeof extrasToUse?.retryDelay !== `number` ||
      !Number.isInteger(extrasToUse.retryDelay) ||
      extrasToUse.retryDelay < 1)
  )
    throw new Error(
      `Error in fancyfetch: extras.retryDelay must be a positive integer.\n\nextras.retryDelay: ${String(
        extrasToUse.retryDelay
      )}`
    );
  if (
    extrasToUse?.validateResponse &&
    typeof extrasToUse?.validateResponse !== `function`
  )
    throw new Error(
      `Error in fancyfetch: extras.validateResponse must be a valid function.\n\nextras.validateResponse: ${String(
        extrasToUse?.validateResponse
      )}`
    );
  if (extrasToUse?.onError && typeof extrasToUse.onError !== `function`)
    throw new Error(
      `Error in fancyfetch: extras.onError must be a valid function.\n\nextras.onError: ${String(
        extrasToUse.onError
      )}`
    );
  if (
    extrasToUse?.onRetrySuccess &&
    typeof extrasToUse.onRetrySuccess !== `function`
  )
    throw new Error(
      `Error in fancyfetch: extras.onRetrySuccess must be a valid function.\n\nextras.onRetrySuccess: ${String(
        extrasToUse.onRetrySuccess
      )}`
    );
  if (
    extrasToUse?.onRetryError &&
    typeof extrasToUse.onRetryError !== `function`
  )
    throw new Error(
      `Error in fancyfetch: extras.onRetryError must be a valid function.\n\nextras.onRetryError: ${String(
        extrasToUse.onRetryError
      )}`
    );

  const sleep = async (ms: number): Promise<unknown> => {
    if (typeof ms !== `number` && !Number.isInteger(ms))
      throw new Error(
        `Error in sleep: ms must be a positive integer.\n\nms: ${String(ms)}`
      );

    return await new Promise((resolve) => setTimeout(resolve, ms));
  };

  let attempts = 0;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tryFetch = async (): Promise<any> => {
    attempts++;
    if (attempts > extrasToUse.maxAttempts) return null;

    try {
      const response = await fetchToUse(resource, options);

      const validResponse = extrasToUse?.validateResponse
        ? await extrasToUse.validateResponse(response.clone())
        : true;

      if (validResponse) {
        if (attempts > 1) {
          if (extrasToUse?.log)
            console.log(`fancyfetch fetch retry successful`);

          if (extrasToUse?.onRetrySuccess) {
            extrasToUse.onRetrySuccess();
          }
        }

        return response;
      } else {
        if (extrasToUse.maxAttempts === 1) return null;

        if (extrasToUse?.log)
          console.error(
            `Error in fancyfetch: Fetch was successful but didn't pass validateResponse. Retrying${
              extrasToUse?.retryDelay !== undefined
                ? ` in ${String(extrasToUse.retryDelay)} ms`
                : ``
            }...`
          );

        if (extrasToUse?.onRetryError) extrasToUse.onRetryError();
        if (extrasToUse?.retryDelay !== undefined)
          await sleep(extrasToUse?.retryDelay);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return await tryFetch();
      }
    } catch {
      if (extrasToUse.maxAttempts === 1) return null;
      if (extrasToUse?.log)
        console.error(
          `Error in fancyfetch: Failed to fetch. Retrying${
            extrasToUse?.retryDelay !== undefined
              ? ` in ${extrasToUse?.retryDelay} ms`
              : ``
          }...`
        );
      if (extrasToUse?.onRetryError) extrasToUse.onRetryError();
      if (extrasToUse?.retryDelay !== undefined)
        await sleep(extrasToUse?.retryDelay);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return await tryFetch();
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const result = await tryFetch();

  const errorMessage = `Error in fancyfetch: No successful responses were returned.\n\nresource: ${JSON.stringify(
    resource,
    null,
    2
  )}\n\noptions: ${JSON.stringify(
    options,
    null,
    2
  )}\n\nextras: ${JSON.stringify(extrasToUse, null, 2)}`;

  if (result === null) {
    if (extrasToUse?.onError) {
      if (extrasToUse?.log) console.error(errorMessage);

      extrasToUse.onError();
    } else {
      throw new Error(errorMessage);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return result;
};

module.exports = fancyfetch;
