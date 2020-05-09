const http = require('http');
const express = require('express');
const fileUpload = require('express-fileupload');
const bodyParser = require('body-parser');

const mkdirp = require('mkdirp');
const path = require('path');
var fs = require('fs');
var Promise = require('promise');

var AdmZip = require('adm-zip');

const { createCanvas, loadImage } = require('canvas')

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

    createDirectory(folder)
        .then(result => {
            let filePath = folder + '/' + zipFile.name;
            console.log(filePath);
            return moveFile(zipFile, filePath);
        }).then(result => {
            return res.status(200).send(JSON.stringify({
                message: 'File uploaded successfully',
                path: result
            }, null, 3));
        }).catch(err => {
            return res.status(500).send(err.message);
        })
});

app.post("/convert", function (req, res) {
    console.log(req.body);
    console.log(req.body.path);

    let filePath = req.body.path;
    let parentFolder = filePath.substring(0, filePath.lastIndexOf('/'));
    let unzippedFolder = path.join(parentFolder, 'unzipped');
    unzipFlags(req.body.path, unzippedFolder)
        .then(result => {
            return drawFlagsOnCanvas(req.body.path, unzippedFolder, parseInt(req.body.width), parseInt(req.body.height));
        })
        .then(result => {
            console.log('created canvas');
            return createSpriteImage(result, unzippedFolder);
        })
        .then(result => {
            console.log('created sprite');
            return res.status(200).send(result);
        }).catch(err => {
            return res.status(500).send('Failed ' + err.message);
        })
});

function findCommon(arr) {
    var max = 1,
        m = [],
        val = arr[0],
        i, x;

    for (i = 0; i < arr.length; i++) {
        x = arr[i]
        if (m[x]) {
            ++m[x] > max && (max = m[i], val = x);
        } else {
            m[x] = 1;
        }
    } return val;
}

function createDirectory(directoryPath) {
    return new Promise(function (resolve, reject) {
        mkdirp(directoryPath, function (err) {
            if (err) {
                return reject(err)
            }
            resolve();
        });
    })
}

function moveFile(source, destination) {
    return new Promise(function (resolve, reject) {
        source.mv(destination, function (err) {
            if (err) {
                console.log('moving file failed' + err);
                return reject(err)
            }
            resolve(destination);
        });
    })
}

function unzipFlags(zipFile, destination) {
    return new Promise(function (resolve, reject) {
        mkdirp(destination, null);
        var zip = new AdmZip(zipFile);
        zip.extractAllTo(destination, true);
        resolve(destination);
    });
}

function drawFlagsOnCanvas(filePath, unzippedFolder, width, height) {
    console.log(filePath);
    console.log(width);
    console.log(height);
    return new Promise(function (resolve, reject) {
        console.log('drawing canvas')
        const canvas = createCanvas(width * 27, height * 27);
        const ctx = canvas.getContext('2d');

        var zip = new AdmZip(filePath);
        console.log('got the entries')
        var zipEntries = zip.getEntries();
        zipEntries.forEach(function (zipEntry) {
            let position = 1;
            loadImage(path.join(unzippedFolder, zipEntry.name)).then((image) => {
                let name = zipEntry.name.replace(".png", "");
                let xPosition = name.charCodeAt(0) - 96;
                let yPosition = name.charCodeAt(1) - 96;
                ctx.drawImage(image, xPosition * width, yPosition * height, width, height)
                position++;
            });
        });
        resolve(canvas);
    });
}

function createSpriteImage(canvas, unzippedFolder) {
    return new Promise(function (resolve, reject) {
        loadImage(path.join(unzippedFolder, "ad.png")).then((image) => {
            let folder = unzippedFolder.substring(0, unzippedFolder.lastIndexOf('/'));
            let spriteImagePath = path.join(folder, "flags-sprite.png")
            const out = fs.createWriteStream(spriteImagePath)
            const stream = canvas.createPNGStream()
            stream.pipe(out)
            out.on('finish', () => {
                console.log('The PNG file was created.');
                resolve(`http://${hostname}:${port}/${spriteImagePath.replace('public/', '')}`);
            });
        })
    });
}