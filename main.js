var app = require('app');  // Module to control application life.

// Report crashes to our server.
require('crash-reporter').start();

var BrowserWindow = require('browser-window');  // Module to create native browser window.

mainWindow = new BrowserWindow({width: 800, height: 600});

mainWindow.loadUrl('file://' + __dirname + '/index.html');

// Quit when all windows are closed.
app.on('window-all-closed', function() {
    if (process.platform != 'darwin')
        app.quit();
});