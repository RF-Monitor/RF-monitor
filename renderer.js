let ipcRenderer = require('electron').ipcRenderer;

//> close button
let closeBtn = document.querySelector('#setting');
let joinBtn = document.querySelector('#join');

closeBtn.addEventListener('click', () => {
    console.log('send');
    ipcRenderer.send('showSetting');
});

joinBtn.addEventListener('click', () => {
    console.log('send');
    ipcRenderer.send('showJoin');
});