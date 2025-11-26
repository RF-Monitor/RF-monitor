const path = require('path');
const {app} = require('electron')
const storage = require('electron-localstorage');
const ipcRenderer = require('electron').ipcRenderer;
const ganhua = ["緊急地震慢報","反白很重要!","最大震度9級","千萬不要把RF-monitor所有功能關掉","乾真大","やりたいこと最優先","有玩csgo的各位大佬快加我好友","兩大過兩小過兩警告",""];
storage.setStoragePath(path.join(__dirname, '../../../../RF-Monitor_config/config.json'));
//////////////此處有幹話
ganhua_i = Math.floor(Math.random()*(ganhua.length-1));
document.getElementById("ganhua").innerHTML=ganhua[ganhua_i]

function submit(){
    let server_select = document.querySelector("#server_select").value
    if(server_select == "RFEQSERVER.myqnapcloud.com"){
        storage.setItem('server_url','http://RFEQSERVER.myqnapcloud.com')
        storage.setItem('ws_server_url','ws://RFEQSERVER.myqnapcloud.com')
    }else if(server_select == "rexisstudio.tplinkdns.com"){
        storage.setItem('server_url','http://rexisstudio.tplinkdns.com')
        storage.setItem('ws_server_url','ws://rexisstudio.tplinkdns.com')
    }
    storage.setItem('userlat',document.querySelector("#lat").value);
    storage.setItem('userlon',document.querySelector("#lon").value);
    if(document.querySelector("#enable_gpu").checked){
        storage.setItem('enable_gpu',true);
        console.log(storage.getItem('enable_gpu'))
    }else{
        storage.setItem('enable_gpu',"false");
        console.log(storage.getItem('enable_gpu')) 
    }
    if(document.querySelector("#enable_autolaunch").checked){
        storage.setItem('enable_autolaunch',true);
    }else{
        storage.setItem('enable_autolaunch',"false");
    }
    if(document.querySelector("#minimize_to_tray").checked){
        storage.setItem('minimize_to_tray',true);
    }else{
        storage.setItem('minimize_to_tray',"false");
    }
    if(document.querySelector("#enable_window_popup").checked){
        storage.setItem('enable_window_popup',true);
    }else{
        storage.setItem('enable_window_popup',"false");
    }
    if(document.querySelector("#enable_weather").checked){
        storage.setItem('enable_weather',true);
    }else{
        storage.setItem('enable_weather',"false");
    }
    if(document.querySelector("#enable_ty").checked){
        storage.setItem('enable_typhoon',true);
    }else{
        storage.setItem('enable_typhoon',"false");
    }
    if(document.querySelector("#enable_ty_analysis").checked){
        storage.setItem('enable_ty_analysis',true);
    }else{
        storage.setItem('enable_ty_analysis',"false");
    }
    if(document.querySelector("#enable_tsunami").checked){
        storage.setItem('enable_tsunami',true);
    }else{
        storage.setItem('enable_tsunami',"false");
    }
    if(document.querySelector("#enable_warningArea").checked){
        storage.setItem('enable_warningArea',true);
    }else{
        storage.setItem('enable_warningArea',"false");
    }
    if(document.querySelector("#enable_wave").checked){
        storage.setItem('enable_wave',true);
    }else{
        storage.setItem('enable_wave',"false");
    }
    if(document.querySelector("#enable_PGA").checked){
        storage.setItem('enable_shindo',true);
    }else{
        storage.setItem('enable_shindo',"false");
    }

    if(document.querySelector("#PGA_warn_only").checked){
        storage.setItem('PGA_warn_only',true);
    }else{
        storage.setItem('PGA_warn_only',"false");
    }
    if(document.querySelector("#local_only").checked){
        storage.setItem('local_only',true);
    }else{
        storage.setItem('local_only',"false");
    }
    
    if(document.querySelector("#enable_notification").checked){
        storage.setItem('enable_notification',true);
    }else{
        storage.setItem('enable_notification',"false");
    }
    //////////////////////
    if(document.querySelector("#enable_tw_eew_sound").checked){
        storage.setItem('enable_tw_eew_sound',true);
    }
    if(document.querySelector("#enable_jp_eew_sound").checked){
        storage.setItem('enable_jp_eew_sound',true);
    }
    if(document.querySelector("#enable_int_1").checked){
        storage.setItem('enable_shindo_sounds_1',true);
    }else{
        storage.setItem('enable_shindo_sounds_1',"false");
    }
    if(document.querySelector("#enable_int_2").checked){
        storage.setItem('enable_shindo_sounds_2',true);
    }else{
        storage.setItem('enable_shindo_sounds_2',"false");
    }
    if(document.querySelector("#enable_int_3").checked){
        storage.setItem('enable_shindo_sounds_3',true);
    }else{
        storage.setItem('enable_shindo_sounds_3',"false");
    }
    if(document.querySelector("#enable_int_4").checked){
        storage.setItem('enable_shindo_sounds_4',true);
    }else{
        storage.setItem('enable_shindo_sounds_4',"false");
    }
    if(document.querySelector("#enable_int_5-").checked){
        storage.setItem('enable_shindo_sounds_5-',true);
    }else{
        storage.setItem('enable_shindo_sounds_5-',"false");
    }
    if(document.querySelector("#enable_int_5k").checked){
        storage.setItem('enable_shindo_sounds_5+',true);
    }else{
        storage.setItem('enable_shindo_sounds_5+',"false");
    }
    if(document.querySelector("#enable_int_6-").checked){
        storage.setItem('enable_shindo_sounds_6-',true);
    }else{
        storage.setItem('enable_shindo_sounds_6-',"false");
    }
    if(document.querySelector("#enable_int_6k").checked){
        storage.setItem('enable_shindo_sounds_6+',true);
    }else{
        storage.setItem('enable_shindo_sounds_6+',"false");
    }
    if(document.querySelector("#enable_int_7").checked){
        storage.setItem('enable_shindo_sounds_7',true);
    }else{
        storage.setItem('enable_shindo_sounds_7',"false");
    }

    //////////////////////
    storage.setItem("shindo_mode",document.querySelector("#station_select").value);
    if(document.querySelector("#enable_PGA_TREM").checked){
        storage.setItem('enable_shindo_TREM',true);
    }else{
        storage.setItem('enable_shindo_TREM',"false");
    }
    if(document.querySelector("#enable_jp_eew").checked){
        storage.setItem('enable_eew_jp',true);
    }else{
        storage.setItem('enable_eew_jp',"false");
    }
    if(document.querySelector("#enable_tw_eew").checked){
        storage.setItem('enable_eew_tw',true);
    }else{
        storage.setItem('enable_eew_tw',"false");
    }
    if(document.querySelector("#enable_RFPLUS").checked){
        storage.setItem("enable_RFPLUS",true);
    }else{
        storage.setItem("enable_RFPLUS","false");
    }
    let RFPLUS_type_selected = document.querySelector('input[name="RFPLUS_type"]:checked')
    if(RFPLUS_type_selected){
        storage.setItem("RFPLUS_type",RFPLUS_type_selected.value);
    }
    if(document.querySelector("#enable_eew_tw_read").checked){
        storage.setItem('enable_eew_tw_read',true);
    }else{
        storage.setItem('enable_eew_tw_read',"false");
    }

    storage.setItem('webhook_url_shindo_sokuho',document.querySelector("#webhook_url_shindo_sokuho").value);
    storage.setItem('webhook_header_shindo_sokuho',document.querySelector("#webhook_header_shindo_sokuho").value);
    storage.setItem('webhook_url_TW_EEW',document.querySelector("#webhook_url_TW_EEW").value);
    storage.setItem('webhook_text_TW_EEW',document.querySelector("#webhook_text_TW_EEW").value);

    storage.setItem('opacity',document.querySelector("#opacity").value);
    console.log(storage.getStoragePath());
    ipcRenderer.send('restart');
}
function cancel(){
    ipcRenderer.send('hideSetting');
}
//初始化設定
let server_select = storage.getItem('server_url');
let enable_gpu = storage.getItem('enable_gpu');
let enable_autolaunch = storage.getItem('enable_autolaunch');
let minimize_to_tray = storage.getItem('minimize_to_tray');
let userlat = storage.getItem('userlat');
let userlon = storage.getItem('userlon');
let enable_window_popup = storage.getItem('enable_window_popup');
let enable_weather = storage.getItem('enable_weather');
let enable_typhoon = storage.getItem('enable_typhoon');
let enable_ty_analysis = storage.getItem('enable_ty_analysis');
let enable_tsunami = storage.getItem('enable_tsunami');
let enable_shindo = storage.getItem('enable_shindo');

let PGA_warn_only = storage.getItem('PGA_warn_only');
let enable_warningArea = storage.getItem("enable_warningArea");
let local_only = storage.getItem("local_only");

let enable_wave = storage.getItem("enable_wave");
let enable_notification = storage.getItem("enable_notification");
///////////音效/////////////
let enable_tw_eew_sound = storage.getItem('enable_tw_eew_sound');
let enable_jp_eew_sound = storage.getItem('enable_jp_eew_sound');
let enable_eew_tw_read = storage.getItem("enable_eew_tw_read");
let enable_shindo_sounds_1 = storage.getItem('enable_shindo_sounds_1');
let enable_shindo_sounds_2 = storage.getItem('enable_shindo_sounds_2');
let enable_shindo_sounds_3 = storage.getItem('enable_shindo_sounds_3');
let enable_shindo_sounds_4 = storage.getItem('enable_shindo_sounds_4');
let enable_shindo_sounds_5j = storage.getItem('enable_shindo_sounds_5-');
let enable_shindo_sounds_5k = storage.getItem('enable_shindo_sounds_5+');
let enable_shindo_sounds_6j = storage.getItem('enable_shindo_sounds_6-');
let enable_shindo_sounds_6k = storage.getItem('enable_shindo_sounds_6+');
let enable_shindo_sounds_7 = storage.getItem('enable_shindo_sounds_7');
/////////////////////////////////
let shindo_mode = storage.getItem('shindo_mode');
let enable_shindo_TREM = storage.getItem('enable_shindo_TREM');
let enable_eew_jp = storage.getItem('enable_eew_jp');
let enable_eew_tw = storage.getItem('enable_eew_tw');
let enable_RFPLUS = storage.getItem('enable_RFPLUS');
let RFPLUS_type = storage.getItem('RFPLUS_type');

let opacity = storage.getItem('opacity');
let webhook_url_shindo_sokuho = storage.getItem('webhook_url_shindo_sokuho');
let webhook_header_shindo_sokuho = storage.getItem('webhook_header_shindo_sokuho');
let webhook_url_TW_EEW = storage.getItem('webhook_url_TW_EEW');
let webhook_text_TW_EEW = storage.getItem('webhook_text_TW_EEW');


if(server_select == "http://RFEQSERVER.myqnapcloud.com"){
    document.getElementById("server_select").value = "RFEQSERVER.myqnapcloud.com";
}else if(server_select == "http://rexisstudio.tplinkdns.com"){
    document.getElementById("server_select").value = "rexisstudio.tplinkdns.com";
}
document.getElementById("lat").value = userlat;
document.getElementById("lon").value = userlon;


if(enable_gpu != "false"){
    document.getElementById("enable_gpu").checked = true;
}
if(enable_autolaunch != "false"){
    document.getElementById("enable_autolaunch").checked = true;
}
if(minimize_to_tray != "false"){
    document.getElementById("minimize_to_tray").checked = true;
}
if(enable_window_popup != "false"){
    document.getElementById("enable_window_popup").checked = true;
}
if(enable_weather != "false"){
    document.getElementById("enable_weather").checked = true;
}

if(enable_tsunami != "false"){
    document.getElementById("enable_tsunami").checked = true;
}
if(enable_typhoon != "false"){
    document.getElementById("enable_ty").checked = true;
}
if(enable_ty_analysis != "false"){
    document.getElementById("enable_ty_analysis").checked = true;
}
if(enable_shindo != "false"){
    document.getElementById("enable_PGA").checked = true;
}
if(PGA_warn_only != "false"){
    document.getElementById("PGA_warn_only").checked = true;
}
if(local_only != "false"){
    document.getElementById("local_only").checked = true;
}
if(enable_warningArea != "false"){
    document.getElementById("enable_warningArea").checked = true;
}
if(enable_wave != "false"){
    document.getElementById("enable_wave").checked = true;
}
if(enable_notification != "false"){
    document.getElementById("enable_notification").checked = true;
}
///////////音效/////////////
if(enable_tw_eew_sound != "false"){
    document.getElementById("enable_tw_eew_sound").checked = true;
}
if(enable_jp_eew_sound != "false"){
    document.getElementById("enable_jp_eew_sound").checked = true;
}
if(enable_shindo_sounds_1 != "false"){
    document.getElementById("enable_int_1").checked = true;
}
if(enable_shindo_sounds_2 != "false"){
    document.getElementById("enable_int_2").checked = true;
}
if(enable_shindo_sounds_3 != "false"){
    document.getElementById("enable_int_3").checked = true;
}
if(enable_shindo_sounds_4 != "false"){
    document.getElementById("enable_int_4").checked = true;
}
if(enable_shindo_sounds_5j != "false"){
    document.getElementById("enable_int_5-").checked = true;
}
if(enable_shindo_sounds_5k != "false"){
    document.getElementById("enable_int_5k").checked = true;
}
if(enable_shindo_sounds_6j != "false"){
    document.getElementById("enable_int_6-").checked = true;
}
if(enable_shindo_sounds_6k != "false"){
    document.getElementById("enable_int_6k").checked = true;
}
if(enable_shindo_sounds_7 != "false"){
    document.getElementById("enable_int_7").checked = true;
}
///////////////////////////////
if(shindo_mode == "shindo"){
    document.getElementById("station_select_shindo").selected = true;
}else if(shindo_mode == "pga"){
    document.getElementById("station_select_pga").selected = true;
}
if(enable_shindo_TREM != "false"){
    document.getElementById("enable_PGA_TREM").checked = true;
}
if(enable_eew_jp != "false"){
    document.getElementById("enable_jp_eew").checked = true;
}
if(enable_eew_tw != "false"){
    document.getElementById("enable_tw_eew").checked = true;
}
if(enable_RFPLUS != "false"){
    document.getElementById("enable_RFPLUS").checked = true;
}
if(RFPLUS_type == "RFPLUS2"){
    document.getElementById("RFPLUS_type_2").checked = true;
}else{
    document.getElementById("RFPLUS_type_3").checked = true;
}
if(enable_eew_tw_read != "false"){
    document.getElementById("enable_eew_tw_read").checked = true;
}
if(opacity != null){
    document.getElementById("opacity").value = opacity;
}
document.getElementById("webhook_url_shindo_sokuho").value = webhook_url_shindo_sokuho;
document.getElementById("webhook_header_shindo_sokuho").value = webhook_header_shindo_sokuho;
document.getElementById("webhook_url_TW_EEW").value = webhook_url_TW_EEW;
document.getElementById("webhook_text_TW_EEW").value = webhook_text_TW_EEW;

function generateRandomString(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      result += characters.charAt(randomIndex);
    }
  
    return result;
  }

function EEWsim(){
    
    let EEWsim_magnitude = document.getElementById("EEWsim_magnitude").value;
    let EEWsim_depth = document.getElementById("EEWsim_depth").value;
    let EEWsim_lat = document.getElementById("EEWsim_lat").value;
    let EEWsim_lon = document.getElementById("EEWsim_lon").value;
    if(EEWsim_magnitude != "" && EEWsim_depth != "" && EEWsim_lat != "" && EEWsim_lon != "" ){
        /*
        let EEWsim_y = date.getFullYear(); 
        let EEWsim_m = date.getMonth(); 
        let EEWsim_d = date.getDate();
        let EEWsim_H = date.getHours()
        let EEWsim_M = date.getMinutes();
        let EEWsim_S = date.getSeconds();
        */
        let time = (Date.now());
        let id = generateRandomString(20);
        let report_num = "999";
        let max_shindo = "不明";
        let epicenter = "自定義震央";
        
        let eew = {
            "type": "eew-cwa",
            "time": time,
            "center": {
                "lon": EEWsim_lon,
                "lat": EEWsim_lat,
                "depth": EEWsim_depth,
                "cname": epicenter,
            },
            "scale": EEWsim_magnitude,
            "report_num": parseInt(report_num),
            "id": "1120405",
            "cancel": false,
            "max": 5,
            "alert":true
        }
        
        ipcRenderer.send('EEWsim_sub', eew);
    }
}
function logout(){
    storage.setItem('verifyKey',"");
    storage.setItem('login_user',"");
    ipcRenderer.send('restart');
}

setInterval(()=>{
    let user = storage.getItem('login_user')
    if(user != ""){
        document.getElementById("login_success").style.display = "block";
        document.getElementById('login_options').style.display = "none";
        document.getElementById("user").innerHTML = user;
    }else{
        document.getElementById("login_success").style.display = "none";
        document.getElementById('login_options').style.display = "block";
    }
},2000)