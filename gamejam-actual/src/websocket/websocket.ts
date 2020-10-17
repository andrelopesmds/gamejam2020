import { Chance } from 'chance';

export const initWS = (onMessageEvent) => {
  const ws = new WebSocket('ws://31.220.7.239:8080/web-socket');

  ws.onmessage = onMessageEvent;

  ws.onopen = () => {
    ws.send('open-' + new Chance().name());
  };
};
