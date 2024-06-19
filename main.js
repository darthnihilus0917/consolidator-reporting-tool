const dotenv = require("dotenv");
dotenv.config();

const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const express = require('express');
const cors = require('cors');

const { buildPorkmeat, buildPoultry, buildSwine } = require('./src/scripts/lib/processes/buildSOTC');
const { generatePorkmeat, generatePoultry, generateSwine } = require('./src/scripts/lib/processes/generateDataSource');
// const { appLabels } = require('./src/scripts/lib/constants/constants');

function createWindow() {
    const win = new BrowserWindow({
        width: 700,
        height: 650,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            enableRemoteModule: false,
            preload: path.join(__dirname, 'preload.js')
        },
        autoHideMenuBar: false,
        icon: path.join(__dirname, './src/assets/favicon-32x32.png')
    });

    win.loadFile('index.html');
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

ipcMain.on('close-window', (event) => {
    BrowserWindow.fromWebContents(event.sender).close();
});

const expressApp = express();
expressApp.use(cors());
expressApp.use(express.json());

expressApp.post('/load', async(req, res) => {
    const { action, consolidatedFile } = req.body;
    let response = `This is LOAD`;
    console.log(response);
    res.json({ msg: response });
});

expressApp.post('/purge', async(req, res) => {
    const { action, consolidatedFile } = req.body;
    let response = `This is PURGE`;
    console.log(response);
    res.json({ msg: response });
});

expressApp.listen(process.env.SERVER_PORT, () => {
    console.log(`Express server listening on port ${process.env.SERVER_PORT}`);
});