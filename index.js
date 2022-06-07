const url = require('url');
const Promise = require('bluebird');
const net = require('net');

Promise.config({
  cancellation: true
});

async function checkInternetConnected (config = {}) {
  const { timeout = 5000, retries = 5, domain = 'https://apple.com' } = config;
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
      client.connect({ port: defaultPort, host: hostname }, () => {
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
