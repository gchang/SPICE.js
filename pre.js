/**
 * Try to make the virtual file system as transparent as possible. Given
 * Emscripten's limitation on mounting NODEFS as the root, this is the next
 * best thing. This also means that it can't read files that are in the 
 * root dir (but you really shouldn't be doing that anyway).
 */
var Module = {};
Module["preRun"] = function() {
    var fs = require('fs'),
        path = require('path');
    
    var rootdirs = fs.readdirSync("/").filter(function(file) {
        return fs.statSync(path.join("/", file)).isDirectory();
    });
    
    // It looks like there's always /dev, /proc, /home, /tmp. We can't get rid
    // of /dev, /proc, /tmp, but we can /home outta here.
    FS.rename("/home", "/tmp/home");
    rootdirs.forEach(function(dir) {
        var rootdir = "/" + dir;
        try {
            FS.mkdir(rootdir);
            FS.mount(NODEFS, { root: rootdir }, rootdir);
        } catch (err) { }
    });
}