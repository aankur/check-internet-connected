const url = require('url');
const Promise = require('bluebird');

async function checkInternetConnected (config = {}) {
  const {timeout = 5000, retries = 5, domain = 'apple.com', servers} = config;
  const dns = require('dns');
  if (servers) {
    dns.setServers(servers);
  }
  const urlInfo = url.parse(domain);
  const hostname = urlInfo.hostname || urlInfo.pathname;
  let lastErrorV4 = false;
  const resolve4 = Promise.promisify(dns.resolve4);
  const resolve6 = Promise.promisify(dns.resolve6);
  for (let i = 0; i < retries; i++) {
    let result4 = null;
    let result6 = null;

    try {
      result4 = await resolve4(hostname).timeout(timeout);
    } catch (ex) {
      lastErrorV4 = ex;
    }

    try {
      result6 = await resolve6(hostname).timeout(timeout);
    } catch (ex) {
      /* swallow up v6 errors for now */
    }

    if (result4 && result6) {
      result4.push(...result6);
      return result4;
    } else if (result4) {
      return result4;
    } else if (result6) {
      return result6;
    }

    if (!(result4 || result6)) {
      if (i !== (retries - 1)) {
        await Promise.delay(timeout);
      }
    }
  }
  return lastErrorV4;
}
module.exports = checkInternetConnected;
