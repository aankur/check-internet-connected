# check-internet-connected
A node module that queries DNS to check whether we are connected to Internet or not

Usage:- 

#### npm install check-internet-connected

``` javascript
const checkInternetConnected = require('check-internet-connected');
checkInternetConnected()
  .then((result) => {
    console.log(result);//list of A and AAAA records, connected to internet
  })
  .catch((ex) => {
    console.log(ex); // cannot resolve DNS
  });
```

##### Additional Config

``` javascript
const config = {
  timeout: 5000, //timeout connecting to each server(A and AAAA), each try
  retries: 5,//number of retries to do before failing
  domain: 'apple.com',//the domain to check DNS record of
  servers: ['8.8.8.8'],//string array of rfc5952 formatted addresses of DNS servers, default uses the inbuilt system DNS servers.
}
checkInternetConnected(config);
```
