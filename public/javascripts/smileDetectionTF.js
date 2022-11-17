/*
const faceapi = require('face-api.js')
const canvas = require('canvas')
    
    const tf = require('@tensorflow/tfjs-node')
    const AsyncHandler = require('express-async-handler')


    const checkImages = AsyncHandler(async(req, res) => {

        await faceapi.nets.faceRecognitionNet.loadFromUri('/models')
        await faceapi.nets.faceLandmark68Net.loadFromUri('/models')
        await faceapi.nets.ssdMobilenetv1.loadFromUri('/models')
      
        const result = await faceapi.detectAllFaces(tensor, optionsSSDMobileNet).withFaceLandmarks().withFaceExpressions();
    });
    //export { checkImages }
    module.exports = { checkImages }

    */
const path = require("path");

const tf = require("@tensorflow/tfjs-node");

const canvas = require("canvas");

const save = require('./saveFile');

const faceapi = require("@vladmandic/face-api/dist/face-api.node.js");
const modelPathRoot = "./models";

let optionsSSDMobileNet;

const { Canvas, Image, ImageData } = canvas;
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

async function image(file) {
    const decoded = tf.node.decodeImage(file);
    const casted = decoded.toFloat();
    const result = casted.expandDims(0);
    decoded.dispose();
    casted.dispose();
    return result;
}

async function detect(tensor) {
    const result = await faceapi.detectAllFaces(tensor, optionsSSDMobileNet).withFaceLandmarks().withFaceExpressions();
    return result;
}

async function main(file, filename) {
    console.log("FaceAPI single-process test");

    await faceapi.tf.setBackend("tensorflow");
    await faceapi.tf.enableProdMode();
    await faceapi.tf.ENV.set("DEBUG", false);
    await faceapi.tf.ready();

    console.log(
        `Version: TensorFlow/JS ${faceapi.tf?.version_core} FaceAPI ${
      faceapi.version.faceapi
    } Backend: ${faceapi.tf?.getBackend()}`
    );

    console.log("Loading FaceAPI models");
    const modelPath = path.join(__dirname, modelPathRoot);
    await faceapi.nets.ssdMobilenetv1.loadFromDisk('./models');
    optionsSSDMobileNet = new faceapi.SsdMobilenetv1Options({
        minConfidence: 0.5,
    });
    await faceapi.nets.faceLandmark68Net.loadFromDisk('./models')
    await faceapi.nets.faceExpressionNet.loadFromDisk('./models')

    const tensor = await image(file);
    const result = await detect(tensor);
    //console.log("Detected faces:", result);

    const canvasImg = await canvas.loadImage(file);
    const out = await faceapi.createCanvasFromMedia(canvasImg);
    faceapi.draw.drawDetections(out, result);
    faceapi.draw.drawFaceExpressions(out, result);
    save.saveFile(filename, out.toBuffer("image/jpeg"));
    console.log(`done, saved results to ${filename}`);

    tensor.dispose();

    return result;
}

module.exports = {
    detect: main,
};