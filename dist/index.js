import r from"node-fetch";let e=async(e,o,t)=>{if(!e||"string"!=typeof e)throw Error(`Error in fancyfetch: A valid fetch resource was not provided

resource: ${e}`);if(o&&"object"!=typeof o)throw Error(`Error in fancyfetch: options must be a valid object.

options: ${o}`);if(t&&"object"!=typeof t)throw Error(`Error in fancyfetch: extras must be a valid object.

extras: ${t}`);if(t?.maxTries&&("number"!=typeof t.maxTries||!Number.isInteger(t.maxTries)||t.maxTries<1))throw Error(`Error in fancyfetch: extras.maxTries must be a positive integer.

extras.maxTries: ${t.maxTries}`);if(t?.validateResponse&&"function"!=typeof t.validateResponse)throw Error(`Error in fancyfetch: extras.validateResponse must be a valid function.

extras.validateResponse: ${t.validateResponse}`);if(t?.onError&&"function"!=typeof t.onError)throw Error(`Error in fancyfetch: extras.onError must be a valid function.

extras.onError: ${t.onError}`);if(t?.onRetrySuccess&&"function"!=typeof t.onRetrySuccess)throw Error(`Error in fancyfetch: extras.onRetrySuccess must be a valid function.

extras.onRetrySuccess: ${t.onRetrySuccess}`);if(t?.onRetryError&&"function"!=typeof t.onRetryError)throw Error(`Error in fancyfetch: extras.onRetryError must be a valid function.

extras.onRetryError: ${t.onRetryError}`);let n=null;for(let s=0;s<(t?.maxTries||1);s++)try{let a=await r(e,{...o});if(t?.validateResponse&&t.validateResponse(a,s)||!t?.validateResponse&&a){n=a,s>0&&n&&(console.log("fancyfetch fetch retry successful"),t?.onRetrySuccess&&t.onRetrySuccess());break}t?.validateResponse?(console.error("Error in fancyfetch: Fetch was successful but didn't pass validateResponse. Retrying..."),t?.onRetryError&&t.onRetryError()):(console.error("Error in fancyfetch: Failed to fetch. Retrying..."),t?.onRetryError&&t.onRetryError())}catch{console.error("Error in fancyfetch: Failed to fetch. Retrying..."),t?.onRetryError&&t.onRetryError()}let s=`Error in fancyfetch: No successful responses were returned.

resource: ${e}

options: ${JSON.stringify(o,null,2)}

extras: ${JSON.stringify(t,null,2)}`;if(!n){if(t?.onError)console.error(s),t.onError();else throw Error(s)}return n};export default e;