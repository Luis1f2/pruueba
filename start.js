const { spawn } = require('child_process');

function runScript(scriptPath, args = []) {
    return spawn('node', [scriptPath, ...args], { stdio: 'inherit' });
}

const broker = runScript('./broker.js');
const server = runScript('./server.js');

broker.on('close', (code) => {
    console.log(`broker.js terminó con código ${code}`);
});

server.on('close',(code)=>{
    console.log(`server.js vende esto ${code}`)
})