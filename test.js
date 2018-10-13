var fs = require('fs');
var writeText = require('add-text-to-image');

var fileName = 'test.jpg';
var imageCaption = executeCMD("cowsay", ["Hello world to pngs"]);

writeText({path: fileName, text: imageCaption, fontSize: 32})
.then(function(result) {
    console.log('result', result);
    fs.writeFile('out.jpg', result);
})
.fail(function(err) {
    console.log('error', err);
});

function executeCMD(cmd, args) {
    return require('child_process').execFileSync(cmd, args, {encoding: 'utf8'});
}