// Video call utilities (integrating WebRTC)
export interface CallState {
  isActive: boolean;
  isMuted: boolean;
  isVideoEnabled: boolean;
  remoteStream: MediaStream | null;
  localStream: MediaStream | null;
  peerConnection: RTCPeerConnection | null;
}

/**
 * Initialize local media for a call
 * @param video Whether to include video
 * @returns A promise that resolves with the local media stream
 */
export const initializeLocalMedia = async (
  video = false
): Promise<MediaStream> => {
  try {
    console.log("Requesting media access with video:", video);
    // Request with exact constraints for better browser compatibility
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
      video: video
        ? {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: "user",
          }
        : false,
    });
    console.log("Media access granted:", stream);
    // Verify we actually got audio tracks
    const audioTracks = stream.getAudioTracks();
    if (audioTracks.length === 0) {
      throw new Error("No audio track found in the media stream");
    }
    return stream;
  } catch (error: any) {
    console.error("Error accessing media devices:", error);
    // Provide more specific error messages based on the error type
    if (
      error.name === "NotAllowedError" ||
      error.name === "PermissionDeniedError"
    ) {
      throw new Error(
        `Microphone access was denied. Please check your browser permissions and ensure your microphone is enabled.`
      );
    } else if (
      error.name === "NotFoundError" ||
      error.name === "DevicesNotFoundError"
    ) {
      throw new Error(
        `No microphone found. Please connect a microphone and try again.`
      );
    } else if (
      error.name === "NotReadableError" ||
      error.name === "TrackStartError"
    ) {
      throw new Error(
        `Your microphone is in use by another application. Please close other applications that might be using your microphone.`
      );
    } else {
      throw new Error(
        `Could not access ${
          video ? "camera and microphone" : "microphone"
        }. Error: ${error.message || error.name || "Unknown error"}`
      );
    }
  }
};

/**
 * Start audio recording for voice messages
 * @returns A promise that resolves with recording data
 */
export const startAudioRecording = async (): Promise<{
  mediaRecorder: MediaRecorder;
  audioChunks: Blob[];
  stream: MediaStream;
}> => {
  try {
    // Use more specific audio constraints for recording
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
        sampleRate: 44100,
      },
    });
    const audioChunks: Blob[] = [];
    // Check for supported MIME types
    const mimeType = getMimeType();
    // Create MediaRecorder with appropriate options
    const options = { mimeType };
    const mediaRecorder = new MediaRecorder(stream, options);
    mediaRecorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        audioChunks.push(event.data);
      }
    };
    // Start recording with 10ms timeslice for more frequent ondataavailable events
    mediaRecorder.start(10);
    return { mediaRecorder, audioChunks, stream };
  } catch (error) {
    console.error("Error starting audio recording:", error);
    throw new Error(
      "Could not access microphone for recording. Please check permissions."
    );
  }
};

/**
 * Get supported MIME type for audio recording
 * @returns The supported MIME type string
 */
const getMimeType = (): string => {
  const types = [
    "audio/webm",
    "audio/webm;codecs=opus",
    "audio/ogg;codecs=opus",
    "audio/mp4",
    "audio/wav",
  ];
  for (const type of types) {
    if (MediaRecorder.isTypeSupported(type)) {
      return type;
    }
  }
  // Fallback to default
  return "";
};

/**
 * Stop audio recording and create audio blob
 * @param mediaRecorder The MediaRecorder instance
 * @param audioChunks The collected audio chunks
 * @param stream The media stream to stop
 * @param duration The recording duration in seconds
 * @returns A promise that resolves with the recording data
 */
export const stopAudioRecording = async (
  mediaRecorder: MediaRecorder,
  audioChunks: Blob[],
  stream: MediaStream,
  duration: number
): Promise<{ url: string; blob: Blob; duration: number }> => {
  return new Promise((resolve, reject) => {
    // If already stopped, don't try to stop again
    if (mediaRecorder.state === "inactive") {
      const audioBlob = new Blob(audioChunks, {
        type: mediaRecorder.mimeType || "audio/webm",
      });
      const audioUrl = URL.createObjectURL(audioBlob);
      // Stop all tracks
      stream.getTracks().forEach((track) => track.stop());
      resolve({ url: audioUrl, blob: audioBlob, duration });
      return;
    }
    // Set up the onstop handler before stopping
    mediaRecorder.onstop = () => {
      try {
        const audioBlob = new Blob(audioChunks, {
          type: mediaRecorder.mimeType || "audio/webm",
        });
        const audioUrl = URL.createObjectURL(audioBlob);
        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop());
        resolve({ url: audioUrl, blob: audioBlob, duration });
      } catch (error) {
        console.error("Error creating audio blob:", error);
        reject(error);
      }
    };
    // Handle errors
    mediaRecorder.onerror = (event) => {
      console.error("MediaRecorder error:", event);
      reject(new Error("Recording failed due to MediaRecorder error"));
    };
    // Stop recording
    try {
      mediaRecorder.stop();
    } catch (error) {
      console.error("Error stopping MediaRecorder:", error);
      // Attempt to clean up even if stop fails
      stream.getTracks().forEach((track) => track.stop());
      reject(error);
    }
  });
};

/**
 * Toggle mute state for a media stream
 * @param stream The media stream
 * @param muted Whether to mute or unmute
 */
export const toggleMute = (stream: MediaStream, muted: boolean): void => {
  const audioTracks = stream.getAudioTracks();
  audioTracks.forEach((track) => {
    track.enabled = !muted;
  });
};

/**
 * Toggle video state for a media stream
 * @param stream The media stream
 * @param enabled Whether to enable or disable video
 */
export const toggleVideo = (stream: MediaStream, enabled: boolean): void => {
  const videoTracks = stream.getVideoTracks();
  videoTracks.forEach((track) => {
    track.enabled = enabled;
  });
};

/**
 * Create a peer connection with proper configuration
 * @returns RTCPeerConnection
 */
export const createPeerConnection = (): RTCPeerConnection => {
  const peerConnection = new RTCPeerConnection({
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
      { urls: "stun:stun2.l.google.com:19302" },
      {
        urls: "turn:numb.viagenie.ca",
        username: "webrtc@live.com",
        credential: "muazkh",
      },
    ],
    iceCandidatePoolSize: 10,
  });
  // Listen for ICE candidates
  peerConnection.onicecandidate = (event) => {
    if (event.candidate) {
      // Send ICE candidate to remote peer (via signaling server)
      sendIceCandidate(event.candidate);
    }
  };
  // Log connection state changes
  peerConnection.oniceconnectionstatechange = () => {
    console.log("ICE connection state:", peerConnection.iceConnectionState);
  };
  // Log connection state changes
  peerConnection.onconnectionstatechange = () => {
    console.log("Connection state:", peerConnection.connectionState);
    // Handle connection failures
    if (
      peerConnection.connectionState === "failed" ||
      peerConnection.connectionState === "disconnected" ||
      peerConnection.connectionState === "closed"
    ) {
      console.error("Connection failed or closed");
      // In a real app, you would notify the user here
    }
  };
  // Handle ICE connection state changes
  peerConnection.oniceconnectionstatechange = () => {
    console.log("ICE connection state:", peerConnection.iceConnectionState);
    if (
      peerConnection.iceConnectionState === "failed" ||
      peerConnection.iceConnectionState === "disconnected"
    ) {
      console.error("ICE connection failed or disconnected");
      // In a real app, you would handle reconnection attempts
    }
  };
  return peerConnection;
};

/**
 * Start a voice call (audio only)
 * @param localStream Local media stream (audio only)
 * @param peerConnection WebRTC peer connection
 * @returns A promise that resolves when the call is established
 */
export const startVoiceCall = async (
  localStream: MediaStream,
  peerConnection: RTCPeerConnection
): Promise<void> => {
  // Add local audio tracks to the peer connection
  localStream.getTracks().forEach((track) => {
    peerConnection.addTrack(track, localStream);
  });
  try {
    // Create and send an offer to the remote peer
    const offer = await peerConnection.createOffer({
      offerToReceiveAudio: true,
      offerToReceiveVideo: false,
    });
    await peerConnection.setLocalDescription(offer);
    // In a real app, you would send this offer to the remote peer via a signaling server
    console.log("Created and set local offer:", offer);
    // For demo purposes, we'll simulate receiving an answer after a delay
    setTimeout(async () => {
      try {
        // Create a simulated answer (in a real app, this would come from the remote peer)
        const simulatedAnswer = {
          type: "answer",
          sdp: offer.sdp?.replace("a=recvonly", "a=sendrecv") || "",
        } as RTCSessionDescriptionInit;
        // Set the remote description with the simulated answer
        await peerConnection.setRemoteDescription(simulatedAnswer);
        console.log("Set remote description with simulated answer");
      } catch (error) {
        console.error("Error handling simulated answer:", error);
      }
    }, 1000);
  } catch (error) {
    console.error("Error creating offer:", error);
    throw new Error("Failed to establish call connection");
  }
};

/**
 * Check network connectivity
 * @returns A promise that resolves with the connection status
 */
export const checkNetworkConnectivity = async (): Promise<boolean> => {
  try {
    // Try to fetch a small resource to check connectivity
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    await fetch("https://www.google.com/favicon.ico", {
      mode: "no-cors",
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return true;
  } catch (error) {
    console.error("Network connectivity check failed:", error);
    return false;
  }
};

/**
 * Start a video call
 * @param localStream Local media stream (audio/video)
 * @param peerConnection WebRTC peer connection
 * @returns A promise that resolves with the remote stream
 */
export const startCall = async (
  localStream: MediaStream,
  peerConnection: RTCPeerConnection
): Promise<MediaStream> => {
  // Add local stream tracks to the peer connection
  localStream
    .getTracks()
    .forEach((track) => peerConnection.addTrack(track, localStream));

  // Create and send an offer to the remote peer
  const offer = await peerConnection.createOffer({
    offerToReceiveAudio: true,
    offerToReceiveVideo: true,
  });
  await peerConnection.setLocalDescription(offer);

  // Send offer to remote peer via signaling server
  sendOffer(offer);

  // Set up remote stream handler
  peerConnection.ontrack = (event) => {
    const remoteStream = event.streams[0];
    console.log("Remote track received:", event.track.kind);
    // Update remote stream for displaying
    updateRemoteStream(remoteStream);
    return remoteStream;
  };

  // Create a dummy remote stream for demo purposes
  // In a real implementation, this would come from the remote peer
  const dummyRemoteStream = await createDummyRemoteStream();
  return dummyRemoteStream;
};

/**
 * Create a dummy remote stream for demonstration purposes
 * This simulates receiving a stream from a remote peer
 */
export const createDummyRemoteStream = async (): Promise<MediaStream> => {
  try {
    // For demo purposes, create a stream from a video element
    const videoElement = document.createElement("video");
    videoElement.src =
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";
    videoElement.muted = true;
    videoElement.autoplay = true;
    videoElement.loop = true;

    // Wait for video to be ready
    await new Promise<void>((resolve) => {
      videoElement.oncanplay = () => resolve();
      videoElement.load();
    });

    // Start playing
    await videoElement.play();

    // Create a canvas to capture the video frames
    const canvas = document.createElement("canvas");
    canvas.width = 640;
    canvas.height = 480;

    // Get the canvas context
    const ctx = canvas.getContext("2d");

    // Create a media stream from the canvas
    // @ts-ignore - Some browsers may not support this API
    const stream = canvas.captureStream(30); // 30 FPS

    // Add audio track if needed
    try {
      const audioStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      const audioTrack = audioStream.getAudioTracks()[0];
      if (audioTrack) {
        stream.addTrack(audioTrack);
      }
    } catch (e) {
      console.warn("Could not add audio to dummy stream:", e);
    }

    // Draw video frames to canvas
    const drawFrame = () => {
      if (ctx) {
        ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
      }
      requestAnimationFrame(drawFrame);
    };

    drawFrame();

    return stream;
  } catch (error) {
    console.error("Error creating dummy remote stream:", error);
    // Fallback to an empty stream
    const emptyStream = new MediaStream();
    return emptyStream;
  }
};

/**
 * Handle incoming offer from the remote peer
 * @param offer The SDP offer
 * @param peerConnection WebRTC peer connection
 */
export const handleIncomingOffer = async (
  offer: RTCSessionDescription,
  peerConnection: RTCPeerConnection
) => {
  // Set remote description (received offer)
  await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));

  // Create and send answer
  const answer = await peerConnection.createAnswer();
  await peerConnection.setLocalDescription(answer);

  // Send answer to the remote peer via signaling server
  sendAnswer(answer);
};

/**
 * Handle incoming answer from the remote peer
 * @param answer The SDP answer
 * @param peerConnection WebRTC peer connection
 */
export const handleIncomingAnswer = async (
  answer: RTCSessionDescription,
  peerConnection: RTCPeerConnection
) => {
  // Set remote description (received answer)
  await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
};

/**
 * Send ICE candidate to remote peer
 * @param candidate The ICE candidate
 */
export const sendIceCandidate = (candidate: RTCIceCandidate) => {
  // Send the candidate via signaling server
  // signalingChannel.send({ type: 'candidate', candidate });
  console.log("Sending ICE candidate:", candidate);
};

/**
 * Send the offer to the remote peer
 * @param offer The SDP offer
 */
export const sendOffer = (offer: RTCSessionDescription) => {
  // Send the offer via signaling server
  // signalingChannel.send({ type: 'offer', offer });
  console.log("Sending offer:", offer);
};

/**
 * Send the answer to the remote peer
 * @param answer The SDP answer
 */
export const sendAnswer = (answer: RTCSessionDescription) => {
  // Send the answer via signaling server
  // signalingChannel.send({ type: 'answer', answer });
  console.log("Sending answer:", answer);
};

/**
 * Update the remote stream UI
 * @param remoteStream The remote media stream
 */
export const updateRemoteStream = (remoteStream: MediaStream) => {
  // Implement UI update for remote stream (e.g., attach it to a video element)
  console.log("Remote stream received:", remoteStream);
  // Example: remoteVideoElement.srcObject = remoteStream;
};

/**
 * End a call and clean up resources
 * @param localStream The local media stream
 * @param remoteStream The remote media stream
 * @param peerConnection The WebRTC peer connection
 */
export const endCall = (
  localStream: MediaStream | null,
  remoteStream: MediaStream | null,
  peerConnection?: RTCPeerConnection | null
): void => {
  // Stop all tracks in the local and remote streams
  if (localStream) {
    localStream.getTracks().forEach((track) => {
      track.stop();
    });
  }
  if (remoteStream) {
    remoteStream.getTracks().forEach((track) => {
      track.stop();
    });
  }
  // Close peer connection
  if (peerConnection) {
    peerConnection.close();
  }
};
