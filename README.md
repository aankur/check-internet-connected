# check-internet-connected
A node module that does a TCP connection to check whether we are connected to Internet or not

Usage:- 

#### npm install check-internet-connected

``` javascript
const checkInternetConnected = require('check-internet-connected');
checkInternetConnected()
  .then((result) => {
    console.log(result);//successfully connected to a server
  })
  .catch((ex) => {
    console.log(ex); // cannot connect to a server or error occurred.
  });
```

##### Additional Config

``` javascript
const config = {
  timeout: 5000, //timeout connecting to each server, each try
  retries: 5,//number of retries to do before failing
  domain: 'https://apple.com',//the domain to check DNS record of
}
checkInternetConnected(config);
```
