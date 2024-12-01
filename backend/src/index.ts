import { WebSocket, WebSocketServer } from 'ws';

const wss = new WebSocketServer({ port: 8080 });


//take this two varibale to track is is sending who is recievvr through the ws that is why we will take two global variable
let senderSocket: null | WebSocket = null;//this is for who is sending the message on ws so it will cache like 
let receiverSocket: null | WebSocket = null;//take a variable like when we reciver send onn ws then we will distingify this is by the reciver side
//so we will send to opposite party otherwise it will be difficulty.

wss.on('connection', function connection(ws) {//connection websoket
  ws.on('error', console.error);

  ws.on('message', function message(data: any) {
    const message = JSON.parse(data);
    if (message.type === 'sender') {//if sender websoket 
        console.log("sender set")
      senderSocket = ws;//we put ws to senderWebsoket
    } else if (message.type === 'receiver') {//if websoket is reciever then 
        console.log("receiver set")
      receiverSocket = ws;//we put the websokett to recieverWebsoket
    } else if (message.type === 'createOffer') {//sender create offer
      if (ws !== senderSocket) {//if sender is the websoket who is create the offer then this case
        return;
      }
      console.log("offer recievd")
      //come here when sender  created the create offer then this 
      //then we send it to recieverSoket the create offer
      receiverSocket?.send(JSON.stringify({ type: 'createOffer', sdp: message.sdp }));
    } else if (message.type === 'createAnswer') {//if create answer then this part
        if (ws !== receiverSocket) {//if created answer is not created by the reciver the create answer then 
          return;
        }

        console.log("answer recieved")
        //come here when created ans is created by the reciver then come here
        //createAnswer will send to senderSoket
        senderSocket?.send(JSON.stringify({ type: 'createAnswer', sdp: message.sdp }));
    } else if (message.type === 'iceCandidate') {//this third step(when icecandidate exchanges)
      if (ws === senderSocket) {//if sender soket will send the ice Candidate to reciever soket
        //here we send to recieversoket 
        receiverSocket?.send(JSON.stringify({ type: 'iceCandidate', candidate: message.candidate }));//recieverSoket will recive
      } else if (ws === receiverSocket) {//if es soket is reciever soket then //if reciver send the ice candidate to sender then case
        //here we send to sender soket
        senderSocket?.send(JSON.stringify({ type: 'iceCandidate', candidate: message.candidate }));
      }
    }
  });
});