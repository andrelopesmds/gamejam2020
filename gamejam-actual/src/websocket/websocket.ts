export const initWS = (onMessageEvent) => {
  const ws = new WebSocket('ws://31.220.7.239:8080/web-socket');

  ws.onmessage = onMessageEvent;
};
