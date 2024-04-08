"use strict";
import {
    PoseLandmarker,
    FilesetResolver,
    DrawingUtils
  } from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/vision_bundle.js";

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
//var vision_bundle_js_1 = require("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/vision_bundle.js");
var poseLandmarker = undefined;
var runningMode = "VIDEO";
var webcamRunning = true;
var videoHeight = "360px";
var videoWidth = "480px";
var createPoseLandmarker = function () { return __awaiter(void 0, void 0, void 0, function () {
    var vision;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, FilesetResolver.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm")];
            case 1:
                vision = _a.sent();
                return [4 /*yield*/, PoseLandmarker.createFromOptions(vision, {
                        baseOptions: {
                            modelAssetPath: "app\\shared\\models\\pose_landmarker_lite.task",
                        },
                        runningMode: runningMode,
                    })];
            case 2:
                poseLandmarker = _a.sent();
                return [2 /*return*/, poseLandmarker];
        }
    });
}); };
var video = document.getElementById("webcam");
var canvasElement = document.getElementById("output_canvas");
var canvasCtx = canvasElement.getContext("2d");
var drawingUtils = new DrawingUtils(canvasCtx);
var hasGetUserMedia = function () { var _a; return !!((_a = navigator.mediaDevices) === null || _a === void 0 ? void 0 : _a.getUserMedia); };
function enableCam() {
    poseLandmarker = createPoseLandmarker();
    if (!poseLandmarker) {
        console.log("Wait! poseLandmaker not loaded yet.");
        return;
    }
    var constraints = {
        video: true
    };
    // Activate the webcam stream.
    navigator.mediaDevices.getUserMedia(constraints).then(function (stream) {
        video.srcObject = stream;
        video.addEventListener("loadeddata", predictWebcam);
    });
}
enableCam();
var lastVideoTime = -1;
function predictWebcam() {
    return __awaiter(this, void 0, void 0, function () {
        var startTimeMs;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    canvasElement.style.height = videoHeight;
                    video.style.height = videoHeight;
                    canvasElement.style.width = videoWidth;
                    video.style.width = videoWidth;
                    if (!(runningMode === "IMAGE")) return [3 /*break*/, 2];
                    runningMode = "VIDEO";
                    return [4 /*yield*/, poseLandmarker.setOptions({ runningMode: "VIDEO" })];
                case 1:
                    _a.sent();
                    _a.label = 2;
                case 2:
                    startTimeMs = performance.now();
                    if (lastVideoTime !== video.currentTime) {
                        lastVideoTime = video.currentTime;
                        poseLandmarker.detectForVideo(video, startTimeMs, function (result) {
                            canvasCtx.save();
                            canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
                            for (var _i = 0, _a = result.landmarks; _i < _a.length; _i++) {
                                var landmark = _a[_i];
                                drawingUtils.drawLandmarks(landmark, {
                                    radius: function (data) { return DrawingUtils.lerp(data.from.z, -0.15, 0.1, 5, 1); }
                                });
                                drawingUtils.drawConnectors(landmark, PoseLandmarker.POSE_CONNECTIONS);
                            }
                            canvasCtx.restore();
                        });
                    }
                    // Call this function again to keep predicting when the browser is ready.
                    if (webcamRunning === true) {
                        window.requestAnimationFrame(predictWebcam);
                    }
                    return [2 /*return*/];
            }
        });
    });
}
