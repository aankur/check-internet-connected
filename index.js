const url = require('url');
const Promise = require('bluebird');
const net = require('net');
const os = require('os');

Promise.config({
  cancellation: true
});

/**
 * Helpeer function to try to search interface address
 */
function getInterfaceAddress(intr, family) {


  const allInterfaces = os.networkInterfaces();

  const foundIf = allInterfaces[intr];
  if (foundIf) {
    if (!family)
      family = 'IPv4'
    const foundFamily = foundIf.find(f => f.family == family)
    if (foundFamily.address)
      return foundFamily.address;



  }

  return null;

}

async function checkInternetConnected(config = {}) {
  const { timeout = 5000, retries = 5, domain = 'https://apple.com', network_interface = undefined, family = undefined } = config;
  const urlInfo = url.parse(domain);
  if (urlInfo.port === null) {
    if (urlInfo.protocol === 'ftp:') {
      urlInfo.port = '21';
    } else if (urlInfo.protocol === 'http:') {
      urlInfo.port = '80';
    } else if (urlInfo.protocol === 'https:') {
      urlInfo.port = '443';
    }
  }
  const defaultPort = Number.parseInt(urlInfo.port || '80');
  const hostname = urlInfo.hostname || urlInfo.pathname;
  for (let i = 0; i < retries; i++) {
    const connectPromise = new Promise(function (resolve, reject, onCancel) {
      const client = new net.Socket();

      const connectParams = { port: defaultPort, host: hostname };
      // Added capability to use specific network interface for connection check
      if (network_interface) {
        const lAddress = getInterfaceAddress(network_interface, family);
        if (lAddress)
          connectParams.localAddress = lAddress;

      }
      client.connect(connectParams, () => {
        client.destroy();
        resolve(true);
      });
      client.on('data', (data) => {
      });
      client.on('error', (err) => {
        client.destroy();
        reject(err);
      });
      client.on('close', () => {
      });

      onCancel(() => {
        client.destroy();
      });
    });
    try {
      await connectPromise.timeout(timeout);
    } catch (ex) {
      if (i === (retries - 1)) {
        throw ex;
      }
    }
  }
}

module.exports = checkInternetConnected;
