let ipcRenderer = require('electron').ipcRenderer;

//> close button
let closeBtn = document.querySelector('#setting');
let joinBtn = document.querySelector('#announcement');

closeBtn.addEventListener('click', () => {
    console.log('send');
    ipcRenderer.send('showSetting');
});

joinBtn.addEventListener('click', () => {
    console.log('send');
    ipcRenderer.send('showAnnouncement');
});