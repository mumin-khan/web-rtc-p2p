import { useEffect, useState } from "react"


type RTCwithId = RTCPeerConnection & {id:string};
export const Sender = () => {
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const [pcs, setPCs] = useState<RTCwithId[] >([]);
    const connections:RTCwithId[] = []
    useEffect(() => {
        const socket = new WebSocket('ws://localhost:8080');
        setSocket(socket);
        socket.onopen = () => {
            socket.send(JSON.stringify({
                type: 'sender',
            }));
        }
    }, []);

    const initiateConn = async () => {

        if (!socket) {
            alert("Socket not found");
            return;
        }



        socket.onmessage = async (event) => {
            const message = JSON.parse(event.data);
            if (message.type === 'recieve')
                {
                    const pc = new RTCPeerConnection() as RTCwithId;
                    pc.id = message.id;
                    setPCs([...pcs,pc]);
                    connections.push(pc)
                    pc.onicecandidate = (event) => {
                        if (event.candidate) {
                            socket?.send(JSON.stringify({
                                type: 'iceCandidate',
                                candidate: event.candidate,
                                id:message.id
                            }));
                        }
                    }
            
                    pc.onnegotiationneeded = async () => {
                        const offer = await pc.createOffer();
                        await pc.setLocalDescription(offer);
                        socket?.send(JSON.stringify({
                            type: 'createOffer',
                            sdp: pc.localDescription,
                            id:message.id
                        }));
                    }
                     
                   
                    getCameraStreamAndSend(pc);
                }
            else if (message.type === 'createAnswer') {
                await connections.find((pc)=> pc.id === message.id)?.setRemoteDescription(message.sdp);
            } else if (message.type === 'iceCandidate') {
                await connections.find((pc)=> pc.id === message.id)?.addIceCandidate(message.candidate);
            }
        }


    }

    const getCameraStreamAndSend = (pc: RTCPeerConnection) => {
        navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
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
        Sender
        <button onClick={initiateConn}> Send data </button>
    </div>
}