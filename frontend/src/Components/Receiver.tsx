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
            console.log("popiu")
        const pc = new RTCPeerConnection();
        pc.ontrack = (event) => {
            console.log("yut",event.track)
            video.srcObject = new MediaStream([event.track]);
            video.play();
        }
       

        socket.onmessage = (event) => {
            const message = JSON.parse(event.data);
            console.log(message)
            if (message.type === 'createOffer') {
                pc.setRemoteDescription(message.sdp).then(() => {
                    pc.createAnswer().then((answer) => {
                        console.log("pop")
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
    }

    return <div>
        <button onClick={()=>{startReceiving(socket)}}>Recieve</button>
    </div>
}