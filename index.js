var http = require('http');
var spawn = require('child_process').spawn;
var spawnSync = require('child_process').spawnSync;
var path = require('path');
var backend = require('git-http-backend');
var zlib = require('zlib');
var fs = require('fs');
console.log('hey'); 
var server = http.createServer(function (req, res) {
        var repo = req.url.split('/')[1];
        console.log('repo ' + repo);
        var dir = path.join(__dirname, 'repos', repo);
        console.log('dirname + ' + path.join(__dirname));
        console.log('dir ' + dir);
        if (!fs.existsSync(dir)) {
            initBareRepository(repo, dir);
            movePostReceiveHook(repo, dir);
            chmodPostReceiveHook(repo, dir);
        }

        var reqStream = req.headers['content-encoding'] == 'gzip' ? req.pipe(zlib.createGunzip()) : req;
        
        reqStream.pipe(backend(req.url, function (err, service) {
                    if (err) return res.end(err + '\n');
                    
                    res.setHeader('content-type', service.type);
                    console.log(service.action, repo, service.fields);
                    
                    var ps = spawn(service.cmd, service.args.concat(dir));
                    ps.stdout.pipe(service.createStream()).pipe(ps.stdin);
                    
                })).pipe(res);
});
server.listen(8080);


function initBareRepository(repo, dir) {
    var ps = spawnSync('git', ['init', '--bare', dir]);
    ps.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
    });
    ps.stderr.on('data', (data) => {
        console.log(`stderr: ${data}`);
    });
}

function movePostReceiveHook(repo, dir) {
    console.log('post receive hook location ' + path.join(__dirname, 'post-receive'));
    var movePostReceiveHook = spawnSync('cp', [path.join(__dirname, 'post-receive'), dir + '/hooks/post-receive']);
    movePostReceiveHook.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
    });
    movePostReceiveHook.stderr.on('data', (data) => {
        console.log(`stderr: ${data}`);
    });
}

function chmodPostReceiveHook(repo, dir) {
    var chmodPostReceiveHook = spawnSync('chmod', ['a+x', dir + '/hooks/post-receive']);
    chmodPostReceiveHook.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
    });
    chmodPostReceiveHook.stderr.on('data', (data) => {
        console.log(`stderr: ${data}`);
    });
}
