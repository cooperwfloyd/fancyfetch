const fetch = require('node-fetch');

const fancyfetch = async (resource, options, extras) => {
  if (!resource || typeof resource !== `string`) throw new Error(`Error in fancyfetch: A valid fetch resource was not provided\n\nresource: ${resource}`);
  if (options && typeof options !== `object`) throw new Error(`Error in fancyfetch: options must be a valid object.\n\noptions: ${options}`);
  if (extras && typeof extras !== `object`) throw new Error(`Error in fancyfetch: extras must be a valid object.\n\nextras: ${extras}`);
  if (extras.maxTries && (typeof extras.maxTries !== `number` || !(Number.isInteger(extras.maxTries)) || extras.maxTries < 1)) throw new Error(`Error in fancyfetch: extras.maxTries must be a positive integer.\n\nextras.maxTries: ${extras.maxTries}`);
  if (extras.validateResponse && typeof extras.validateResponse !== `function`) throw new Error(`Error in fancyfetch: extras.validateResponse must be a valid function.\n\nextras.validateResponse: ${extras.validateResponse}`);

  const goFetch = async () => await fetch(resource, {...options});
  let result = null;

  for (let tries = 0; tries < (extras.maxTries || 1); tries++) {
    try {
      const response = await goFetch();

      if ((extras.validateResponse && extras.validateResponse(response)) || (!extras.validateResponse && response)) {
        result = response;
        if (tries > 0 && result) console.log(`fancyfetch fetch retry successful`);
        break;
      } else if (extras.validateResponse) {
        console.error(`Error in fancyfetch: Fetch was successful but didn't pass validateResponse. Retrying...`);
      } else {
        console.error(`Error in fancyfetch: Failed to fetch. Retrying...`);
      }
    } catch {
      console.error(`Error in fancyfetch: Failed to fetch. Retrying...`);
    }
  }

  if (!result) throw new Error(`Error in fancyfetch: No successful responses were returned.\n\nresource: ${resource}\n\noptions: ${JSON.stringify(options, null, 2)}\n\nextras: ${JSON.stringify(extras, null, 2)}`);

  return result;
};

module.exports = fancyfetch;
