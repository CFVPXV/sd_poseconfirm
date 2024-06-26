import {
    PoseLandmarker,
    FilesetResolver,
    DrawingUtils
  } from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/vision_bundle.js";


let poseLandmarker: PoseLandmarker = undefined;
let runningMode = "VIDEO";
let webcamRunning: Boolean = true;
const videoHeight = "360px";
const videoWidth = "480px";

const createPoseLandmarker = async () => {
    const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
    );
    poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: `app\\shared\\models\\pose_landmarker_lite.task`,
      },
      runningMode: runningMode,
    });

    return poseLandmarker;
  };


function angleMeasure(XShoulder, YShoulder, XWrist, YWrist, XWaist, YWaist) {
  let WrS = Math.atan2(XWrist - XShoulder, YWrist - YShoulder);
  let WaS = Math.atan2(XWaist - XShoulder, YWaist - YShoulder);

  return WrS - WaS;
}

const video = document.getElementById("webcam") as HTMLVideoElement;
const canvasElement = document.getElementById(
  "output_canvas"
) as HTMLCanvasElement;
const canvasCtx = canvasElement.getContext("2d");
const drawingUtils = new DrawingUtils(canvasCtx);

const hasGetUserMedia = () => !!navigator.mediaDevices?.getUserMedia;

function enableCam() {
  poseLandmarker = createPoseLandmarker();
  if (!poseLandmarker) {
    console.log("Wait! poseLandmaker not loaded yet.");
    return;
  }

  const constraints = {
    video: true
  };

  // Activate the webcam stream.
  navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
    video.srcObject = stream;
    video.addEventListener("loadeddata", predictWebcam);
  });
}

enableCam();


let lastVideoTime = -1;
async function predictWebcam() {
  canvasElement.style.height = videoHeight;
  video.style.height = videoHeight;
  canvasElement.style.width = videoWidth;
  video.style.width = videoWidth;
  // Now let's start detecting the stream.
  if (runningMode === "IMAGE") {
    runningMode = "VIDEO";
    await poseLandmarker.setOptions({ runningMode: "VIDEO" });
  }
  let startTimeMs = performance.now();
  if (lastVideoTime !== video.currentTime) {
    lastVideoTime = video.currentTime;
    poseLandmarker.detectForVideo(video, startTimeMs, (result) => {
      canvasCtx.save();
      canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
      for (const landmark of result.landmarks) {
        drawingUtils.drawLandmarks(landmark, {
          radius: (data) => DrawingUtils.lerp(data.from!.z, -0.15, 0.1, 5, 1)
        });
        drawingUtils.drawConnectors(landmark, PoseLandmarker.POSE_CONNECTIONS);
      }
      console.log(angleMeasure(result.landmarks[12].x, result.landmarks[12].y, result.landmarks[16].x, result.landmarks[16].y, result.landmarks[24].x, result.landmarks[24].y))
      console.log(angleMeasure(result.landmarks[11].x, result.landmarks[11].y, result.landmarks[15].x, result.landmarks[15].y, result.landmarks[23].x, result.landmarks[23].y))
      canvasCtx.restore();
    });
  }

  // Call this function again to keep predicting when the browser is ready.
  if (webcamRunning === true) {
    window.requestAnimationFrame(predictWebcam);
  }
}
