const Mastodon = require('mastodon-api');
const path = require('path');
const env = require('dotenv').config();
const fs = require('fs');


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
        console.log("Done tooting!");
        setTimeout(delFiles, 2500);
    });
}

function deleteFiles() {
    console.log("Deleting leftover files. . .");
    if (fs.existsSync(__dirname + "/out.png")){
        fs.unlinkSync(__dirname + "/out.png");      
    }
    console.log("Deleted leftover files successfully!");
}

function executeCMD(cmd, args) {
    return require('child_process').execFileSync(cmd, args, {encoding: 'utf8'});
}

function listen() {
    var cmdArgs = 0;
    var cmd = "";
    var cmdConvert = "";
    
    const listener = M.stream('streaming/user');
    
    console.log("Listening for mentions and follows on  Bot \"@TheDevMinerTV_Bot\"");
    listener.on('error', err => console.log(err));
    listener.on('message', msg => {
        
        if (msg.event === 'notification') {
            if (msg.data.type === 'mention') {
                fs.writeFileSync("data.json", JSON.stringify(msg, null, 2));
                
                cmdArgs = msg.data.status.content.split("</span>");
                cmdArgs = cmdArgs[2];
                cmdArgs = cmdArgs.substring(1);
                cmdArgs = cmdArgs.split(" ");
                
                cmd = cmdArgs[0].substring(1);
                cmdConvert = " ";
                for (let i = 1; i < cmdArgs.length; i++) {
                    cmdConvert = cmdConvert + " " + cmdArgs[i];
                }
                cmdConvert = cmdConvert.substring(1, cmdConvert.length - 4);
                
                console.log(`@${msg.data.account.acct} mentioned me with ${cmdArgs[0]} ${cmdArgs[1]} ${cmdArgs[2]}HHH`);
                console.log(JSON.stringify(cmdConvert));
                
                if (cmd === "cowsay") {
                    cmdConvert = cmd  + " " + cmdConvert;
                    executeCMD("./cmd2png.sh", [cmdConvert]);                    
                    console.log("Executed!!!");
                    tootImage(__dirname + "/out.png", `@${msg.data.account.acct} Here is your cowsay!`, deleteFiles);
                    
                } else if (cmd === "cowthink") {
                    cmdConvert = cmd  + " " + cmdConvert;
                    executeCMD("./cmd2png.sh", [cmdConvert]);                    
                    console.log("Executed!!!");
                    tootImage(__dirname + "/out.png", `@${msg.data.account.acct} Here is your cowthink!`, deleteFiles);
                    
                } else if (cmd === "figlet") {
                    cmdConvert = cmd  + " " + cmdConvert;
                    executeCMD("./cmd2png.sh", [cmdConvert]);                    
                    console.log("Executed!!!");
                    tootImage(__dirname + "/out.png", `@${msg.data.account.acct} Here is your figlet!`, deleteFiles);
                    
                } else if (cmd === "fortune") {
                    var arr = cmdConvert.split(" ");
                    if (arr[1] === "|" && (arr[2] === "cowsay" || arr[2] === "cowthink")) {
                        
                        var output = executeCMD("fortune");
                        
                        if (arr[2] === "cowsay") {
                            executeCMD("./cmd2png.sh", ["cowsay " + output]); 
                            console.log("Chose cowsay!");                  
                        } else {
                            executeCMD("./cmd2png.sh", ["cowthink " + output]);
                            console.log("Chose cowthink!");
                        }
                        tootImage(__dirname + "/out.png", `@${msg.data.account.acct} Here is your fortune with some milk!`, deleteFiles);
                        
                    } else {
                        
                        executeCMD("./cmd2png.sh", [cmd]);                    
                        tootImage(__dirname + "/out.png", `@${msg.data.account.acct} Here is your fortune!`, deleteFiles);
                        
                    }
                    console.log("Executed!!!");
                    
                } else if (cmd === "toilet") {
                    cmdConvert = cmd  + " " + cmdConvert;
                    executeCMD("./cmd2png.sh", [cmdConvert]);                    
                    console.log("Executed!!!");
                    tootImage(__dirname + "/out.png", `@${msg.data.account.acct} Here is your toilet (paper)!`, deleteFiles);
                    
                } else {
                    console.log(`${msg.data.account.acct} mentioned with ${cmdArgs}`);
                }
                
                cmdArgs = 0;
                cmd = "";
                cmdConvert = "";
            }   
        }
    });
}


listen();
