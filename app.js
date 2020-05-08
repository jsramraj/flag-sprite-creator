const http = require('http');
const express = require('express');
const fileUpload = require('express-fileupload');
const bodyParser = require('body-parser');

const mkdirp = require('mkdirp');
const path = require('path');
var fs = require('fs');

var AdmZip = require('adm-zip');

const hostname = '127.0.0.1';
const port = 3000;


const app = express();
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(express.static('public'))
app.set('view engine', 'ejs'); 
app.use(fileUpload());


app.listen(port, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});

app.post("/upload", function (req, res) {
    console.log('upload started');
    if (!req.files || Object.keys(req.files).length === 0) {
        console.log('No files were uploaded.');
        return res.status(400).send('No files were uploaded.');
    }
    let zipFile = req.files.file;
    var folder = path.join('public/uploads/') + Date.now();
    mkdirp(folder, function (err) {
        if (err) {
            console.log('Error creating file ' + err);
            return res.status(500).send(err.message);
        }

        let filePath = folder + '/' + zipFile.name;
        let relativeFilePath = filePath.replace('public/', '');
        console.log(filePath);

        zipFile.mv(filePath, function (err) {
            if (err) {
                console.log('moving file failed' + err);
                return res.status(500).send(err.message);
            }

            let unzippedFolder = path.join(folder, "unzipped");
            mkdirp(unzippedFolder, null);
            var zip = new AdmZip(filePath);
            zip.extractAllTo(unzippedFolder, true);

            
        });
    });
    return res.status(200).send('File uploaded successfully');
});