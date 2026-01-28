function bindAutoSave() {
    const elements = document.querySelectorAll(
        "input, select, textarea"
    );

    elements.forEach(el => {
        if (!el.id) return; // 沒 id 不處理

        const handler = async () => {
            let value;
            //console.log("saving config")
            if (el.type === "checkbox") {
                value = String(el.checked);
            } else {
                value = el.value;
            }

            await window.config.set(el.id, value);
        };

        el.addEventListener("change", handler);
        el.addEventListener("input", handler); // for text / range
    });
}

function hideLogin(user){
    document.getElementById("login_success").style.display = "block";
    document.getElementById("login_options").style.display = "none";
    document.getElementById("user").innerHTML = user;
}
function showLogin(){
    document.getElementById("login_success").style.display = "none";
    document.getElementById("login_options").style.display = "block";
}
const user = await window.config.get("login_user")
if(user){
    hideLogin(user);
}else{
    showLogin(user);
}
window.auth.onStatus(async ({ status }) => {
	if(status == "logged_out"){
		showLogin();
	}else if(status == "logged_in"){
		hideLogin(await window.config.get("login_user"))
	}
})

window.auth.onResult(async ({ status }) => {
	console.log(status)
	if(status == "success"){
		hideLogin(await window.config.get("login_user"));
	}else{
		showLogin()
	}
})

document.getElementById("logout").addEventListener("click", async () => {
    await window.auth.logout()
})

document.getElementById("restart").addEventListener("click", () => {
    window.system.restart();
})
// 載入設定值
const config = await window.config.getAll();

if(config.server.http == "http://RFEQSERVER.myqnapcloud.com"){
    document.getElementById("server_select").value = "RFEQSERVER.myqnapcloud.com";
}else if(config.server.http == "http://rexisstudio.tplinkdns.com"){
    document.getElementById("server_select").value = "rexisstudio.tplinkdns.com";
}
document.getElementById("userlat").value = config.user.lat;
document.getElementById("userlon").value = config.user.lon;


if(config.system.enableGPU){
    document.getElementById("enable_gpu").checked = true;
}
if(config.system.autoLaunch){
    document.getElementById("enable_autolaunch").checked = true;
}
if(config.system.minimizeToTray){
    document.getElementById("minimize_to_tray").checked = true;
}
if(config.system.windowPopup){
    document.getElementById("enable_window_popup").checked = true;
}
if(config.weather.enabled){
    document.getElementById("enable_weather").checked = true;
}

if(config.tsunami.enabled){
    document.getElementById("enable_tsunami").checked = true;
}
if(config.weather.typhoon.enabled != "false"){
    document.getElementById("enable_ty").checked = true;
}
if(config.weather.typhoon.analysis){
    document.getElementById("enable_ty_analysis").checked = true;
}
if(config.shindo.enabled){
    document.getElementById("enable_PGA").checked = true;
}
/*
if(config.shindo.pgaWarnOnly){
    document.getElementById("PGA_warn_only").checked = true;
}
if(config.user.localOnly){
    document.getElementById("local_only").checked = true;
}
    */
if(config.shindo.warningArea){
    document.getElementById("enable_warningArea").checked = true;
}
if(config.wave.enabled){
    document.getElementById("enable_wave").checked = true;
}
if(config.system.enableNotification){
    document.getElementById("enable_notification").checked = true;
}
///////////音效/////////////
if(config.sound.twEEW){
    document.getElementById("enable_tw_eew_sound").checked = true;
}
if(config.sound.jpEEW){
    document.getElementById("enable_jp_eew_sound").checked = true;
}
if(config.sound.shindo["1"]){
    document.getElementById("enable_shindo_sounds_1").checked = true;
}
if(config.sound.shindo["2"]){
    document.getElementById("enable_shindo_sounds_2").checked = true;
}
if(config.sound.shindo["3"]){
    document.getElementById("enable_shindo_sounds_3").checked = true;
}
if(config.sound.shindo["4"]){
    document.getElementById("enable_shindo_sounds_4").checked = true;
}
if(config.sound.shindo["5-"]){
    document.getElementById("enable_shindo_sounds_5-").checked = true;
}
if(config.sound.shindo["5+"]){
    document.getElementById("enable_shindo_sounds_5+").checked = true;
}
if(config.sound.shindo["6-"]){
    document.getElementById("enable_shindo_sounds_6-").checked = true;
}
if(config.sound.shindo["6+"]){
    document.getElementById("enable_shindo_sounds_6+").checked = true;
}
if(config.sound.shindo["7"]){
    document.getElementById("enable_shindo_sounds_7").checked = true;
}
///////////////////////////////
/*
if(enable_shindo_TREM != "false"){
    document.getElementById("enable_PGA_TREM").checked = true;
}*/
if(config.eew.jp){
    document.getElementById("enable_eew_jp").checked = true;
}
if(config.eew.tw){
    document.getElementById("enable_eew_tw").checked = true;
}
if(config.eew.rfplus){
    document.getElementById("enable_RFPLUS").checked = true;
}
/*
if(config.eew.rfplusType == "RFPLUS2"){
    document.getElementById("RFPLUS_type_2").checked = true;
}else{
    document.getElementById("RFPLUS_type_3").checked = true;
}
    */
if(config.sound.twRead){
    document.getElementById("enable_eew_tw_read").checked = true;
}
if(config.system.opacity != null){
    document.getElementById("opacity").value = config.system.opacity;
}
document.getElementById("webhook_url_shindo_sokuho").value = config.webhook.shindo.url;
document.getElementById("webhook_header_shindo_sokuho").value = config.webhook.shindo.header;
document.getElementById("webhook_url_TW_EEW").value = config.webhook.twEEW.url;
document.getElementById("webhook_text_TW_EEW").value = config.webhook.twEEW.text;

await bindAutoSave();

/*
document.getElementById("RFPLUS_type_2").addEventListener("change", async (e) => {
    if (e.target.checked) {
        await window.config.set("RFPLUS_type", "RFPLUS2");
    }
});

document.getElementById("RFPLUS_type_3").addEventListener("change", async (e) => {
    if (e.target.checked) {
        await window.config.set("RFPLUS_type", "RFPLUS3");
    }
});
*/
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
        let id = time.toString();
        let report_num = "999";
        let max_shindo = "不明";
        let epicenter = "自定義震央";
        
        let eew = {
            "id": id,
            "type": "eew-test",
            "time": time,
            "center": {
                "lon": EEWsim_lon,
                "lat": EEWsim_lat,
                "depth": EEWsim_depth,
                "cname": epicenter,
            },
            "scale": Number(EEWsim_magnitude),
            "report_num": parseInt(report_num),
            "id": "1120405",
            "cancel": false,
            "max": 5,
            "alert":true
        }
        window.eq.sendEEWsim(eew)
    }
}
document.getElementById("EEWsim").addEventListener("click", EEWsim)