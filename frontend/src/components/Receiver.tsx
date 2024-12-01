import { useEffect } from "react";


export function Receiver(){
    // const videoRef=useRef<HTMLVideoElement>(null)

    //here we took the global variable
    let pc:RTCPeerConnection |null=null;
    useEffect(()=>{
        //at the recever side create websoket 
        const soket=new WebSocket("ws://localhost:8080");

        //if soket is connected then 
        soket.onopen=()=>{
            // tell to server it is come from receiver side so server will forward to send side
            soket.send(JSON.stringify({type:"receiver"}))
        }

        //if theer is any message  in this websoket
        soket.onmessage=async(event)=>{
            const message=JSON.parse(event.data);
            
            //means sender sent the create offer so we received
            if(message.type==='createOffer'){
                //create answer
                //create the instance of the webRTC
                 pc=new RTCPeerConnection();//stun server by default get

                //which is received the sdp from create offer from the sender
                //that save in setRemoteDescription
                pc.setRemoteDescription(message.sdp);

                // anny time new ice candidate will get the  send it to sender side
                pc.onicecandidate=(event)=>{
                    console.log(event)
                    if(event.candidate){
                        soket?.send(JSON.stringify({type:'iceCandidate',candidate:event.candidate}))
                    }
                }

                const video = document.createElement('video');
                 document.body.appendChild(video);
                //reciveing the video,audio
                //taking the video from sender and show in our page
                pc.ontrack=(event)=>{
                    video.controls=true;
                    console.log(event)
                    // if(videoRef.current){
                    //     videoRef.current.srcObject=new MediaStream([event.track])
                    // }
                   
                    video.srcObject=new MediaStream([event.track]);
                    setTimeout(()=>
                    {
                        video.play();
                    },1000)
                }


                

       

                const answer=await pc.createAnswer();
                //save in setLocalDescription
                await pc.setLocalDescription(answer);
                
                //send it to server so server will send it to sender
                //here sdp taking from the localDescription
                soket.send(JSON.stringify({type:'createAnswer',sdp:pc.localDescription}))


            }else if(message.type=="iceCandidate"){
                if(pc!==null){
                    //@ts-ignore
                    pc.addIceCandidate(message.candidate);//icecandidate from sender that icecandidate we will store in our database
                }
            }
        }
    },[])



    return<div>
        {/* <video ref={videoRef}></video>  when using useRef */}
    </div>
}