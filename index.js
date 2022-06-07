const url = require('url');
const Promise = require('bluebird');
const net = require('net');
const os = require('os');
const _ = require('lodash');

Promise.config({
  cancellation: true
});

/**
 * @Laurix1983 added
 * Helper function to try to search interface address
 */
function getInterfaceAddress (networkInterface, networkFamily) {
  const allInterfaces = os.networkInterfaces();

  const foundIf = allInterfaces[networkInterface];
  if (foundIf) {
    const foundFamily = foundIf.find(f => { return f.family === networkFamily; });
    if (!foundFamily) {
      return null;
    }
    if (foundFamily.address) { return foundFamily.address; }
  }
  return null;
}

async function checkInternetConnected (config = {}) {
  const { timeout = 5000, retries = 5, domain = 'https://apple.com', networkInterface = undefined, networkInterfaceFamily = undefined, networkFamily = undefined } = config;
  if (!_.isNumber(timeout)) {
    throw new Error('\'timeout\' Param is supposed to be a Number signifying Time Duration in Milliseconds.');
  }
  if (!_.isNumber(retries)) {
    throw new Error('\'retries\' Param is supposed to be a Number.');
  }
  if (!_.isString(domain)) {
    throw new Error('\'domain\' Param is supposed to be a String.');
  }
  if (networkInterface != null && !_.isString(networkInterface)) {
    throw new Error('\'networkInterface\' Param is supposed to be a String.');
  }
  if (networkInterfaceFamily != null && !_.isString(networkInterfaceFamily)) {
    throw new Error('\'networkInterfaceFamily\' Param is supposed to be a String.');
  }
  if (networkInterfaceFamily != null && networkInterface == null) {
    throw new Error('\'networkInterfaceFamily\' is to be specified without networkInterface');
  }
  if (networkInterface != null && networkInterfaceFamily == null) {
    throw new Error('\'networkInterfaceFamily\' is to be specified if networkInterface is defined');
  }
  if (networkInterfaceFamily != null && _.indexOf(['IPv4', 'IPv6'], networkInterfaceFamily) === -1) {
    throw new Error('\'networkInterfaceFamily\' is to be either of \'IPv4\' or \'IPv6\'');
  }
  if (networkFamily != null && !_.isString(networkFamily)) {
    throw new Error('\'networkFamily\' is to be String');
  }
  if (networkFamily != null && _.indexOf(['IPv4', 'IPv6'], networkFamily) === -1) {
    throw new Error('\'networkFamily\' is to be either of \'IPv4\' or \'IPv6\'');
  }

  let connectNetworkFamily = 0;
  if (networkFamily === 'IPv4') {
    connectNetworkFamily = 4;
  } else if (networkFamily === 'IPv6') {
    connectNetworkFamily = 6;
  }

  // eslint-disable-next-line node/no-deprecated-api
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

      const connectParams = { port: defaultPort, host: hostname, family: connectNetworkFamily };
      // @Laurix1983 Added capability to use specific network interface for connection check
      if (networkInterface) {
        const lAddress = getInterfaceAddress(networkInterface, networkInterfaceFamily);
        if (lAddress) { connectParams.localAddress = lAddress; } else { reject(new Error(`Network interface: '${networkInterface}' with Network Interface Family '${networkInterfaceFamily}' not found, canceling test`)); }
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
      return await connectPromise.timeout(timeout);
    } catch (ex) {
      if (i === (retries - 1)) {
        throw ex;
      }
    }
  }
}

module.exports = checkInternetConnected;
