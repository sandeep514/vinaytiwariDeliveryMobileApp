import React from 'react';
import Nav from './routes/Nav';

//Debugger Configuration Start
// To see all the requests in the chrome Dev tools in the network tab.
XMLHttpRequest = GLOBAL.originalXMLHttpRequest
  ? GLOBAL.originalXMLHttpRequest
  : GLOBAL.XMLHttpRequest;

// fetch logger
global._fetch = fetch;
global.fetch = function (uri, options, ...args) {
  return global._fetch(uri, options, ...args).then(response => {
    return response;
  });
};

//Debugger Configuration End

export default function App() {

  return <Nav />;
}