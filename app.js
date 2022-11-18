var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const fileUpload = require("express-fileupload");

const faceApiService = require("./public/javascripts/smileDetectionTF");

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
//var smileRouter = require('./routes/smileDetectionRoute');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
//app.use('/smile', smileRouter);

// catch 404 and forward to error handler
/*
app.use(function(req, res, next) {
    next(createError(404));
});
*/
// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});
// post request to check user face expressions after sending a photo
//app.post("/faceapi/:user_id", fileUpload(), async(req, res) => {

app.post("/faceapi", fileUpload(), async(req, res) => {
    try {
        console.log("************************************************")

        const { file } = req.files;


        const result = await faceApiService.detect(file.data, file.name);
        let neutral = parseFloat(result["0"]["expressions"]["neutral"]);
        let happy = parseFloat(result["0"]["expressions"]["happy"]);
        let sad = parseFloat(result["0"]["expressions"]["sad"]);
        let surprise = parseFloat(result["0"]["expressions"]["surprised"]);
        let anger = parseFloat(result["0"]["expressions"]["angry"]);
        let fear = parseFloat(result["0"]["expressions"]["fearful"]);
        let disgust = parseFloat(result["0"]["expressions"]["disgusted"]);

        let results = []
        results.push(neutral, happy, sad, surprise, anger, fear, disgust);

        const needle = 1;
        const closest = results.reduce((a, b) => {
            return Math.abs(b - needle) < Math.abs(a - needle) ? b : a;
        });

        let experssion;

        if (closest == neutral) {
            experssion = "Neutral";
        } else if (closest == happy) {
            experssion = "Happy";
        } else if (closest == sad) {
            experssion = "Sad";
        } else if (closest == surprise) {
            experssion = "Surprise";
        } else if (closest == anger) {
            experssion = "Anger";
        } else if (closest == fear) {
            experssion = "Fear";
        } else if (closest == disgust) {
            experssion = "Disgust";
        }
        let url = ''
        console.log("************************************************")
        console.log("Happy: ", happy);
        console.log("Sad: ", sad);
        console.log("Surprise: ", surprise);
        console.log("Anger: ", anger);
        console.log("Fear: ", fear);
        console.log("Disgust: ", disgust);
        console.log("Neutral: ", neutral);
        console.log("Expression: ", experssion);
        console.log("Certainty: ", closest);
        console.log("url: http://localhost:3000/out/" + file.name);
        console.log("************************************************")
            /*
            res.status(200).json({
                expression: experssion,
                certainty: closest,
                url: `http://localhost:3000/out/${file.name}`,
            });*/
        res.status(200).json(experssion);
    } catch (error) {
        console.log(error);
        console.log("Photo not recognized");
        res.status(406).json("Photo not recognized");
    }

});
module.exports = app;