//Node Server
//Brendan Weirtz - 3/27/23

const { spawn } = require('child_process');
const { ripFiles, eventEmitter } = require('./file-ripper');
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const server = express();
const inputFolder = 'applications/book-utility/files/input';
const outputFolder = 'applications/book-utility/files/output';
const hostURL = "localhost"
const log = [];
var port = process.argv[2];
let isReadyOne = false;
let isReadyTwo = false;

console.log("Port received: " + port);

// // Add headers before the routes are defined
server.use(function (req, res, next) {
//   // Website you wish to allow to connect
  res.setHeader('Access-Control-Allow-Origin', 'http://' + hostURL + ':' + port);
//   // Request methods you wish to allow
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
//   // Request headers you wish to allow
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
//   // Set to true if you need the website to include cookies in the requests sent
//   // to the API (e.g. in case you use sessions)
  res.setHeader('Access-Control-Allow-Credentials', true);
//   // Pass to next layer of middleware
  next();
});

//-------------------------------------------
// CONSOLE LOGGER
//-------------------------------------------
const ripper = spawn('node', ['./applications/book-utility/file-ripper.js']);

eventEmitter.on('log', (msg) => {
  const timestamp = new Date().toLocaleTimeString();
  log.push("<span class='log-grey'>" + timestamp + ": </span> &emsp;" + msg);
});

// Redirect console output to the log array
const oldConsoleLog = console.log;
console.log = (msg) => {
  oldConsoleLog.apply(console, arguments);
  const timestamp = new Date().toLocaleTimeString();
  log.push("<span class='log-grey'>" +timestamp + ": </span> &emsp;" + msg);
};

// Serve the log array as a JSON endpoint
server.get('/log', (req, res) => {
  // console.log("Pinging console log...");
  res.json(log);
});

ripper.stdout.on('data', (data) => {
  log.push(data.toString());
  process.stdout.write(data);
});


//----------------------------------------
//                Routes
//----------------------------------------

server.use(express.static('/public'));
// app.use(express.static(path.join(__dirname, 'public')));

server.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

server.get('/style.css', (req, res) => {
  res.type('text/css');
  res.sendFile(__dirname + '/public/style.css');
});

server.post('/upload-files', (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error uploading file');
      console.log('Error transferring files');
    } else {
      console.log('Files successfully trasnferred to \\files\\input');
      res.redirect(307,'/process-files');
    }
  });
});

server.post('/delete-files', (req, res) => {
  fs.readdir(inputFolder, (err, files) => {
    // Loop through each file and delete it
    for (const file of files) {
      fs.unlink(path.join(inputFolder, file), (err) => {
        if (err) throw err;
        console.log(`Removed ${file}`);
      });
    }
    if (err) {
      console.error(err);
      res.status(500).send('Error deleting file');
      console.log('Error deleting file');
    } else {
      console.log('Requesting to purge input files...');
    }
    isReady(1);
  });

  fs.readdir(outputFolder, (err, files) => {
    // Loop through each file and delete it
    for (const file of files) {
      fs.unlink(path.join(outputFolder, file), (err) => {
        if (err) throw err;
        console.log(`Removed ${file}`);
      });
    }
    if (err) {
      console.error(err);
      res.status(500).send('Error deleting file');
      console.log('Error deleting file');
    } else {
      console.log('Requesting to purge output files...');
    }
    isReady(2);
  });
});

server.get('/download', (req, res) => {
  const filePath = 'applications/book-utility/files/output/cubeview-names.xlsx';
  res.download(filePath, (err) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error saving file');
      console.log('Error saving file');
    } else {
      console.log('File saved successfully!');
    }
  });
});
  
server.post('/process-files', (req, res) => {
    ripFiles((filesRipped) => {
      if (filesRipped) {
        console.log('file-ripper.js exited with code 0: success');
        console.log('Report ready to save...');
        res.send('Files ripped successfully!');
      } else {
        console.log('Error ripping files, see logs for details.');
        res.status(500).send('Error ripping files!');
      }
    });
});

server.post('/check-download', (req, res) => {
  fs.readdir(outputFolder, (err, files) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error reading directory');
      return;
    }
    // Check if there are any files in the directory
    if (files.length > 0) {
      // Send back a response indicating that there are files
      res.send({ hasFiles: true });
    } else {
      // Send back a response indicating that there are no files
      res.send({ hasFiles: false });
    }
  });
});

//----------------------------------------
//                Port
//----------------------------------------

server.listen(port, () => {
  console.log('Server running at: http://' + hostURL + ":" + port);
})

//Check if application is ready
function isReady(num){
  if (num === 1){
    isReadyOne = true
  }else if(num === 2){
    isReadyTwo = true
  }
  if(isReadyOne && isReadyTwo){
    console.log('<span class="log-green">Application ready!</span>');
    isReadyOne = false;
    isReadyTwo = false;
  }
}

//----------------------------------------
//           Multer Storage
//----------------------------------------

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, inputFolder);
    },
    filename: (req, file, cb) => {
      cb(null, file.originalname);
    }
  });

const upload = multer({ storage: storage }).array('pdfBookFiles'); 