import WebSocket = require('../../node_modules/@types/ws');

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
const initWS = () => {
  const ws = new WebSocket('ws://31.220.7.239:8080/web-socket', {
    perMessageDeflate: false,
  });

  console.log('dwadwa');
  ws.on('open', function open() {
    console.log('HALOOO');
    ws.send('client testi');
  });

  ws.on('message', function incoming(data) {
    console.log(data);
  });
};

export default initWS;
