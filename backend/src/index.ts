import { WebSocket, WebSocketServer } from 'ws';

const wss = new WebSocketServer({ port: 8080 });

let senderSocket: null | WebSocket = null;
let receiverSockets:   WebSocket[] = [];

wss.on('connection', function connection(ws) {
  ws.on('error', console.error);

  ws.on('message', function message(data: any) {
    const message = JSON.parse(data);
    if (message.type === 'sender') {
      senderSocket = ws;
    } else if (message.type === 'receiver') {
      receiverSockets.push(ws);
    } else if (message.type === 'createOffer') {
      console.log("pop")
      if (ws !== senderSocket) {
        return;
      }
      console.log("iop")
      receiverSockets?.forEach((r) => r.send(JSON.stringify({ type: 'createOffer', sdp: message.sdp })));
    } else if (message.type === 'createAnswer') {
      console.log("lol")
      if (!receiverSockets.find((r)=> r === ws)) {
        return;
        }
        console.log("fzgfdhg")
        senderSocket?.send(JSON.stringify({ type: 'createAnswer', sdp: message.sdp }));
    } else if (message.type === 'iceCandidate') {
      console.log("message",receiverSockets.length)
      if (ws === senderSocket) {
        receiverSockets?.forEach((r)=>r.send(JSON.stringify({ type: 'iceCandidate', candidate: message.candidate })));
      } else if (receiverSockets.find((r)=> r === ws)) {
        console.log("pjuio")
        senderSocket?.send(JSON.stringify({ type: 'iceCandidate', candidate: message.candidate }));
      }
    }
  });
});