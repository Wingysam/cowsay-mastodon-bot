const Mastodon = require('mastodon-api');
const path = require('path');
const env = require('dotenv').config();
const fs = require('fs');
const glob = require('glob');


var instance = "https://botsin.space/api/v1/";
const M = new Mastodon({
    client_secret: process.env.CLIENT_SECRET,
    client_key: process.env.CLIENT_KEY,
    access_token: process.env.AUTH_TOKEN,
    api_url: instance, // optional, defaults to https://mastodon.social/api/v1/
});

console.log("Mastodon bot starting. . . ");


function toot(text) {
    const params = {
        status: text
    }
    
    M.post('statuses', params, (error, data) => {
        if (error){
            console.error(error);
        } else {
            //fs.writeFileSync(`data${data.created_at}.json`, JSON.stringify(data, null, 2));
            console.log("Successful at " + data.created_at + " with ID " + data.id);
        }
    });
}

function tootImage(png, text, delFiles) {
    M.post('media', { file: fs.createReadStream(png) }).then(resp => {
        const id = resp.data.id;
        M.post('statuses', { status: text, media_ids: [id] })
    }).then(function() {
        console.log("Done tooting!")
        setTimeout(delFiles, 2500);
    });
}

function search(nameKey, myArray){
    for (var i=0; i < myArray.length; i++) {
        if (myArray[i].name === nameKey) {
            return true;
        }
    }
}

function executeCMD(cmd, args) {
    return require('child_process').execFileSync(cmd, args, {encoding: 'utf8'});
}

function listen() {
    
    const listener = M.stream('streaming/user');
    
    console.log("Listening for mentions and follows on  Bot \"@TheDevMinerTV_Bot\"");
    listener.on('error', err => console.log(err));
    listener.on('message', msg => {
        
        fs.writeFileSync("json.json", JSON.stringify(msg));
        
        if (msg.event === 'notification') {
            if (msg.data.type === 'mention') {
                
                var cmdArgs = msg.data.status.content.split("</span>");
                var cmdArgs = cmdArgs[2];
                var cmd = cmdArgs.substring(2, 8);
                var args = cmdArgs.substring(9, (cmdArgs.length - 4)).split(" ");
                
                console.log(`@${msg.data.account.acct} mentioned me with ${cmdArgs}HHH`);
                console.log(cmd + " - " + JSON.stringify(args));
                
                if (cmd === "cowsay") {
                    var defaultMSG = `Output from ${cmd} ${args}`;
                    
                    var output = executeCMD("cowsay", args);                    
                    console.log("Executed!!!\n\nOutput was \n" + output + "\nNumber of characters " + output.length);

                    toot(`@${msg.data.account.acct} Here is your cowsay!\n${output}`);

                } else {
                    console.log(`${msg.data.account.acct} mentioned with ${res}`);
                }
            }   
        }
    });
}


listen();
