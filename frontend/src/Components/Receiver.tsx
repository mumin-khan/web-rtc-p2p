import { useEffect, useState } from "react"


export const Receiver = () => {
    const [socket,setSocket] = useState<WebSocket|null>(null)    
    const id = Math.floor(Math.random()*100)
    useEffect(() => {
        const socket = new WebSocket('ws://localhost:8080');
        
        setSocket(socket)
    }, []);

    function startReceiving(socket: null|WebSocket) {
        if(!socket)
            {
                return
            }
            socket.send(JSON.stringify({
                    type: 'receiver',
                    id:id
                }));
            
        const video = document.createElement('video');
        document.body.appendChild(video);
        const pc = new RTCPeerConnection();
        pc.ontrack = (event) => {
            video.srcObject = new MediaStream([event.track]);
            video.play();
        }
        pc.onicecandidate = (event) => {
            if (event.candidate) {
                socket?.send(JSON.stringify({
                    type: 'iceCandidate',
                    candidate: event.candidate
                }));
            }
        }

        socket.onmessage = (event) => {
            const message = JSON.parse(event.data);
            if (message.type === 'createOffer') {
                pc.setRemoteDescription(message.sdp).then(() => {
                    pc.createAnswer().then((answer) => {
                        pc.setLocalDescription(answer);
                        socket.send(JSON.stringify({
                            type: 'createAnswer',
                            sdp: answer
                        }));
                    });
                });
            } else if (message.type === 'iceCandidate') {
                pc.addIceCandidate(message.candidate);
            }
        }

        getCameraStreamAndSend(pc);
    }

    const getCameraStreamAndSend = (pc: RTCPeerConnection) => {
        navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
            const text = document.createElement('p')
            text.innerText = "my"
            document.body.appendChild(text)
            const video = document.createElement('video');
            video.srcObject = stream;
            video.play();
            document.body.appendChild(video);
            stream.getTracks().forEach((track) => {
                pc?.addTrack(track);
            });
        });
    }

    

    return <div>
        <button onClick={()=>{startReceiving(socket)}}>Recieve</button>
    </div>
}