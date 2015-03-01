var UPDATER = (function(my) {
    var fs = require("fs")
    var path = require("path")
    var remote = require("remote")

    var pathtoserver = "http://localhost:44444" // replace with path to your express server of course
    //var pathtoserver = "https://obscure-forest-8712.herokuapp.com"

    // to determine where our app.asar lies we need a bit of trickery (for OSX at least)
    var findlocal = function() {
        if (process.platform != "darwin")
            return path.join(path.dirname(process.execPath),"resources")
        else
            return path.join(process.execPath.substr(0,process.execPath.indexOf("node-webkit.app")),"Contents","Resources") // I'm open to better ways of doing that
    }

    var mypath = findlocal()

    my.update = function(author,repo) {
        try {
            var xhreq = new XMLHttpRequest();
            xhreq.open("GET", pathtoserver + "/updater?author=" + author + "&repo=" + repo + "&tag=" + (localStorage.UPDATERversion||""), true);
            xhreq.responseType = "arraybuffer";
            xhreq.onload = function (oEvent) {
                var arrayBuffer = xhreq.response;
                console.log(xhreq.getAllResponseHeaders())
                var newvers = xhreq.getAllResponseHeaders().match(/app\.asar\.([^\"]+)"/)
                if (arrayBuffer.byteLength && newvers && newvers.length) {
                    localStorage.UPDATERversion = newvers[1]
                    var byteArray = new Uint8Array(arrayBuffer);
                    var buffer = new Buffer(byteArray.length);
                    for (var i = 0; i < byteArray.length; i++)
                        buffer.writeUInt8(byteArray[i], i);
                    fs.writeFile(path.join(mypath,"app.asar.new"), buffer,function(err) {
                        if (!err) {
                            if (fs.existsSync(path.join(mypath,"app.asar.old")))
                                fs.unlinkSync(path.join(mypath,"app.asar.old")) // remove 'old old'
                            if (fs.existsSync(path.join(mypath,"app.asar")))
                                fs.renameSync(path.join(mypath,"app.asar"),path.join(mypath,"app.asar.old")) // rename to old
                            fs.renameSync(path.join(mypath,"app.asar.new"),path.join(mypath,"app.asar")) // move in new
                        }
                        my.restart()
                    })
                } else {
                    console.log("No update available for " + localStorage.UPDATERversion)
                }
            };
            xhreq.send(null);
        } catch(e) {
            console.log("Error caught in update check")
            console.log(e)
        }
    }

    my.restart = function() {
        var child_process = require("child_process");
        var child = child_process.spawn(remote.require("app").getPath("exe"), [], {detached: true});
        child.unref();
        remote.getCurrentWindow().close()
    }

    return my

}(UPDATER||{}));