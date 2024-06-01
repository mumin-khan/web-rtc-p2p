import { WebSocket, WebSocketServer } from 'ws';

const wss = new WebSocketServer({ port: 8080 });
type WebSocketWithId = WebSocket & {id:string};
let senderSocket: null | WebSocket = null;
let receiverSockets:   WebSocketWithId[] = [];

wss.on('connection', function connection(ws) {
  ws.on('error', console.error);

  ws.on('message', function message(data: any) {
    const message = JSON.parse(data);
    if (message.type === 'sender') {
      senderSocket = ws;
    } else if (message.type === 'receiver') {
      (ws as WebSocketWithId).id = message.id
      receiverSockets.push(ws as WebSocketWithId);
      senderSocket?.send(JSON.stringify({type:'recieve',id:message.id}))
    } else if (message.type === 'createOffer') {
      if (ws !== senderSocket) {
        return;
      }
      receiverSockets?.find((r) => (r.id === message.id))?.send(JSON.stringify({ type: 'createOffer', sdp: message.sdp }));
    } else if (message.type === 'createAnswer') {
      const rs = receiverSockets.find((r)=> r === ws);
      if (!rs) {
        return;
        }
        senderSocket?.send(JSON.stringify({ type: 'createAnswer', sdp: message.sdp,id:rs.id }));
    } else if (message.type === 'iceCandidate') {
      if (ws === senderSocket) {
        console.log(receiverSockets?.find((r) => (r.id === message.id))?.id)
        receiverSockets?.find((r) => (r.id === message.id))?.send(JSON.stringify({ type: 'iceCandidate', candidate: message.candidate }));
      } else if (receiverSockets.find((r)=> r === ws)) {
        senderSocket?.send(JSON.stringify({ type: 'iceCandidate', candidate: message.candidate, id: receiverSockets.find((r)=> r === ws)?.id }));
      }
    }
  });
});