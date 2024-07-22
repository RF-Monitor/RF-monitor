const storage = require('electron-localstorage');
const path = require('path')
const ipcRenderer = require('electron').ipcRenderer;
storage.setStoragePath(path.join(__dirname, '../../../../RF-Monitor_config/config.json'));

server_url = storage.getItem("server_url");

function update(){
    XHR = createXHR();
    //XHR.open("GET",server_url+":8787/getAnnouncement",true);
    XHR.open("GET",server_url+":8787/getAnnouncement",true);
    XHR.send();
    XHR.onreadystatechange = function() {
		if(XHR.readyState == 4 && (XHR.status == 200 || XHR.status == 304)) {
			let response = JSON.parse(XHR.responseText);
            if(response.status == "success"){
                const announcements = response.content;
                const listContainer = document.getElementById('announcement-list');
                listContainer.innerHTML = "";

                
                announcements.forEach(announcement => {
                    const announcementItem = document.createElement('div');
                    announcementItem.classList.add('announcement-item');
                    announcementItem.innerHTML = `
                        <h2>${announcement.type}</h2>
                        <p>${announcement.title}</p>
                        <div class="announcement-content">
                        <p>${announcement.content.replace(/\n/g, '<br>')}</p>
                        </div>
                        <hr>
                    `;
                    announcementItem.addEventListener('click', function() {
                        const contentDiv = this.querySelector('.announcement-content');
                        contentDiv.classList.toggle('open');
                    });
                    listContainer.appendChild(announcementItem);
                });
                
            }  
        }
    }
}

ipcRenderer.on('refresh', (event, message) => {
    update()
})
