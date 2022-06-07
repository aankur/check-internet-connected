# check-internet-connected

[![Codacy Badge](https://api.codacy.com/project/badge/Grade/6765d69a185d4a79953a3b91dab2b3a7)](https://app.codacy.com/gh/aankur/check-internet-connected?utm_source=github.com&utm_medium=referral&utm_content=aankur/check-internet-connected&utm_campaign=Badge_Grade_Settings)

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
