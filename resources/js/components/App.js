import React, { Component } from "react";
import ReactDOM from "react-dom";
import MediaHandler from "../MediaHandler";
import Pusher from "pusher-js";
import Peer from "simple-peer";
const APP_KEY = "babc9ca7061ad55972b2";
import axios from "axios";

export default class App extends Component {
    constructor() {
        super();
        this.state = {
            hasMedia: false,
            otherUserId: null
        };
        this.user = window.user;
        this.user.stream = null;
        this.peers = {};
        this.mediaHandler = new MediaHandler();
        this.setUpPusher();
        this.callTo = this.callTo.bind(this);
        this.setUpPusher = this.setUpPusher.bind(this);
        this.startPeer = this.startPeer.bind(this);
        this.contactList = {}
        this.contactList = window.contactList
;
    }
    componentWillMount() {
        this.mediaHandler.getPermission().then(stream => {
            // getting permission from user for camera and microphone
            this.setState({ hasMedia: true }); // here user accepted
            this.user.stream = stream;
            try {
                //set current user video
                this.myVideo.srcObject = stream;
            } catch (error) {
                this.myVideo.src = URL.createObjectURL(stream);
            }
            this.myVideo.play();
        });
    }
    setUpPusher() {
        this.pusher = new Pusher(APP_KEY, {
            authEndpoint: "/pusher/auth",
            cluster: "mt1",
            auth: {
                params: this.user.id,
                headers: {
                    "X-CSRF-Token": window.csrfToken
                }
            }
        });
        this.channel = this.pusher.subscribe("presence-video-channel");
        this.channel.bind(`client-signal-${this.user.id}`, signal => {
            let peer = this.peers[signal.userId];
            if (peer === undefined) {
                this.setState({ otherUserId: signal.userId });
                peer = this.startPeer(signal.userId, false);
            }
            peer.signal(signal.data)
        });
    }
    startPeer(userId, initiator = true) {
        const peer = new Peer({
            initiator,
            stream: this.user.stream,
            trickle: false
        });
        peer.on("signal", data => {
            this.channel.trigger(`client-signal-${userId}`, {
                type: "signal",
                userId: this.user.id,
                data: data
            });
        });
        peer.on("stream", stream => {
            try {
                //set current user video
                this.userVideo.srcObject = stream;
            } catch (error) {
                this.userVideo.src = URL.createObjectURL(stream);
            }
            this.userVideo.play();
        });
        peer.on("close", () => {
            let peer = this.peers[userId];
            if (peer !== undefined) {
                peer.destroy();
            }
            this.peers[userId] = undefined;
        });
        return peer;
    }
    callTo(userId) {
        this.peers[userId] = this.startPeer(userId);
    }
    render() {
        return (
            <div className="container">
            {/* {[1,2,3,4].map((userId) => {
                    return this.user.id !== userId ? <button key={userId} onClick={() => this.callTo(userId)}>Call {userId}</button> : null;
                })} */}
                {this.contactList.map((user) => {
                    return <button key={user.id} onClick={() => this.callTo(user.id)}>Call {user.name}</button>
                })}
                
                <div className="video-container">
                    <video
                        className="my-video"
                        ref={ref => {
                            this.myVideo = ref;
                        }}
                    ></video>
                    <video
                        className="user-video"
                        ref={ref => {
                            this.userVideo = ref;
                        }}
                    ></video>
                </div>
            </div>
        );
    }
}

if (document.getElementById("app")) {
    ReactDOM.render(<App />, document.getElementById("app"));
}
