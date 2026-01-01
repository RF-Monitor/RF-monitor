const storage = require('electron-localstorage');
const fs = require('fs');
const path = require('path');
const defaults = require('./defaults');
const config = require("./config");
const configFolderPath = path.join(__dirname, '../../../../RF-Monitor_config/')
const configFilePath = path.join(__dirname, '../../../../RF-Monitor_config/config.json')

/*----------創建config資料夾----------*/
if (!fs.existsSync(configFolderPath)){
  fs.mkdirSync(configFolderPath);
}
/*----------創建config檔案----------*/
/*
if (!fs.existsSync(configFilePath)) {
    fs.writeFileSync(configFilePath, "{}", "utf8");
}*/
/*----------指定config資料夾----------*/
storage.setStoragePath(configFilePath);
console.log(storage.getStoragePath());
console.log("server url:",storage.getItem('server_url'));

/*----------config檔案損毀處理----------*/
function repairIfBroken() {
    const fileAPath = path.join(__dirname, '../../../../RF-Monitor_config/config.json');
    const fileBPath = path.join(__dirname, '../../../../RF-Monitor_config/config_backup.json');
    if (storage.getItem('server_url') === null) {
    console.log("config.json is broken,using backup file.")
    // 删除文件A
    fs.unlinkSync(fileAPath);
    console.log('File A deleted successfully.');
    // 重命名文件B为config.json
    fs.renameSync(fileBPath, fileAPath);
    console.log("Backup config file successfully used.")
    }
}

function applyDefaults(){
    defaults.applyDefaults()
}
function backupConfig() {
    /*----------備份config.json----------*/
    const sourcePath = path.join(__dirname, '../../../../RF-Monitor_config/config.json');
    const destinationPath = path.join(__dirname, '../../../../RF-Monitor_config/config_backup.json');

    fs.copyFileSync(sourcePath, destinationPath);
    console.log('File copied to config_backup.json successfully.');
}
module.exports = {
    applyDefaults,
    repairIfBroken,
    backupConfig,
    get: storage.getItem,
    set: storage.setItem,
    config: config.getConfig
};