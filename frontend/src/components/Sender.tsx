import { useEffect, useState } from "react";

export function Sender() {

    const [soket, setSoket] = useState<WebSocket | null>(null)//websoket type of instance
    useEffect(() => {

        //creating  the websoket connection
        const soket = new WebSocket("ws://localhost:8080");//where 
        setSoket(soket)
        soket.onopen = () => {
            //type send so in backend will understand the who is sent the websoket. where to send the packet
            soket.send(JSON.stringify({ type: "sender" }))//send it to websoket room so websoket will understand this webRTC 
        }
    }, [])

    async function startSendingVideo() {
        if (!soket)//if soket is not found then it will return not execute below of this
        {
            return
        }
        //craete offer
        //create instance of webRTC
        const pc = new RTCPeerConnection();

        //when you add video time to time sdp will change it will keep sending
        pc.onnegotiationneeded = async () => {
            console.log("on negoitated needed")
            //create offer
            const offer = await pc.createOffer();//this is sdp
            await pc.setLocalDescription(offer)//set to localDescription
            soket?.send(JSON.stringify({ type: 'createOffer', sdp: pc.localDescription }))
        }

        //if new icecandidate will get then// webRTC will get new other ice candidate then it will tell to other side that is new ice Candidate
        //some time when we did not got at the first time we did not got the  iceCandidate then this time we will add and send it to receiver
        pc.onicecandidate = (event) => {
            console.log(event)
            if (event.candidate) {
                soket?.send(JSON.stringify({ type: 'iceCandidate', candidate: event.candidate }))
            }
        }

        //send to reciever soket this tell//backend will will forward it to receiver side


        //whenever anydata come is in this soket
        soket.onmessage = (event) => {
            const message = JSON.parse(event.data);
            //if receiver sent the crreateAnswer then 
            if (message.type === "createAnswer") {
                pc.setRemoteDescription(message.sdp)//taking the sdp of the receiver and set in remoteDescription
            }
            else if (message.type == "iceCandidate") {
                pc.addIceCandidate(message.candidate);
            }
        }

        ///after this if you will kill the backend server then also it will connect each other browser1 and browser2


        //for sending video
        // const stream=await navigator.mediaDevices.getUserMedia({video:true,audio:true});
        // pc.addTrack(stream.getVideoTracks()[0]);//here only one video that is which [0]
        // pc.addTrack(stream.getAudioTracks()[0]);//here only one audio that is which [0]

        // //showing in sender side
        // const video = document.createElement('video');
        // video.srcObject = stream;
        // video.play();
        // // this is wrong, should propogate via a component
        // document.body.appendChild(video);
        

        //sending to video
        getCameraStreamAndSend(pc);
    }



    const getCameraStreamAndSend = (pc: RTCPeerConnection) => {
        //navigator.mediaDevices.getDisplayMedia({video:tru,audio:false})//this is for screen sharig

        navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
            const video = document.createElement('video');
            video.srcObject = stream;
            video.play();
            // this is wrong, should propogate via a component
            document.body.appendChild(video);
            stream.getTracks().forEach((track) => {
                pc?.addTrack(track);
            });
        });
    }

    return <div>
        sender
        <button onClick={startSendingVideo}>send Video</button>
    </div>
}




// https://github.com/100xdevs-cohort-2/week-23-webrtc for full project