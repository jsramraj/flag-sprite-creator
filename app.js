const http = require('http');
const express = require('express');
const fileUpload = require('express-fileupload');
const bodyParser = require('body-parser');

const mkdirp = require('mkdirp');
const path = require('path');
var fs = require('fs');

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
            var zipEntries = zip.getEntries();
            zip.extractAllTo(unzippedFolder, true);

            let width = 40;
            let height = 20;
            const canvas = createCanvas(width * 27, height * 27);
            const ctx = canvas.getContext('2d');            

            zipEntries.forEach(function(zipEntry) {
                let position = 1;
                loadImage(path.join(unzippedFolder, zipEntry.name)).then((image) => {
                    let name = zipEntry.name.replace(".png", "");
                    let xPosition = name.charCodeAt(0) - 96;
                    let yPosition = name.charCodeAt(1) - 96;
                    ctx.drawImage(image, xPosition * width, yPosition * height, width, height)
                    position ++ ;
                });
            });

            loadImage(path.join(unzippedFolder, zipEntries[0].name)).then((image) => {
                const out = fs.createWriteStream(path.join(folder, "flags-sprite.png"))
                const stream = canvas.createPNGStream()
                stream.pipe(out)
                out.on('finish', () => console.log('The PNG file was created.'))                
            })
            
        });
    });
    return res.status(200).send('File uploaded successfully');
});