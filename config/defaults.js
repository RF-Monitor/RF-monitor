const storage = require('electron-localstorage');
const { app } = require('electron');
const isDevelopment = process.env.NODE_ENV !== "production";
/*----------設定預設值----------*/
function applyDefaults(){
    if(storage.getItem('server_url')  === ""){
    storage.setItem('server_url','http://RFEQSERVER.myqnapcloud.com')
    }
    if(storage.getItem('ws_server_url')  === ""){
    storage.setItem('ws_server_url','ws://RFEQSERVER.myqnapcloud.com')
    }
    console.log(storage.getItem('server_url'));
    if(storage.getItem('enable_gpu')  === ""){
    storage.setItem('enable_gpu',"true")
    }
    if(storage.getItem('userlat')  === ""){
    storage.setItem('userlat',"25.033319")
    }
    if(storage.getItem('userlon')  === ""){
    storage.setItem('userlon',"121.564306")
    }
    if(storage.getItem('enable_autolaunch')  === ""){
    storage.setItem('enable_autolaunch',"true")
    }
    if(storage.getItem('enable_window_popup')  === ""){
    storage.setItem('enable_window_popup',"true")
    }
    if(storage.getItem('enable_weather')  === ""){
    storage.setItem('enable_weather',"true")
    }
    if(storage.getItem('enable_typhoon')  === ""){
    storage.setItem('enable_typhoon',"true")
    }
    if(storage.getItem('enable_ty_analysis')  === ""){
    storage.setItem('enable_ty_analysis',"true")
    }
    if(storage.getItem('enable_tsunami')  === ""){
    storage.setItem('enable_tsunami',"true")
    }
    if(storage.getItem('enable_shindo')   === ""){
    storage.setItem('enable_shindo',"true")
    }
    if(storage.getItem('PGA_warn_only')   === ""){
    storage.setItem('PGA_warn_only',"true")
    }

    if(storage.getItem('enable_warningArea')   === ""){
    storage.setItem('enable_warningArea',"true")
    }
    if(storage.getItem('local_only')   === ""){
    storage.setItem('local_only',"false")
    }
    if(storage.getItem('enable_wave')   === ""){
    storage.setItem('enable_wave',"false")
    }
    if(storage.getItem('enable_notification')  === ""){
    storage.setItem('enable_notification',"true")
    }
    /////////音效
    if(storage.getItem('enable_jp_eew_sound')  === ""){
    storage.setItem('enable_jp_eew_sound',"false")
    }
    if(storage.getItem('enable_tw_eew_sound')  === ""){
    storage.setItem('enable_tw_eew_sound',"true")
    }
    if(storage.getItem('enable_eew_tw_read')  === ""){
    storage.setItem('enable_eew_tw_read',"true")
    }
    if(storage.getItem('enable_shindo_sounds_1')  === ""){
    storage.setItem('enable_shindo_sounds_1',"true")
    }
    if(storage.getItem('enable_shindo_sounds_2')  === ""){
    storage.setItem('enable_shindo_sounds_2',"true")
    }
    if(storage.getItem('enable_shindo_sounds_3')  === ""){
    storage.setItem('enable_shindo_sounds_3',"true")
    }
    if(storage.getItem('enable_shindo_sounds_4')  === ""){
    storage.setItem('enable_shindo_sounds_4',"true")
    }
    if(storage.getItem('enable_shindo_sounds_5-')  === ""){
    storage.setItem('enable_shindo_sounds_5-',"true")
    }
    if(storage.getItem('enable_shindo_sounds_5+') === ""){
    storage.setItem('enable_shindo_sounds_5+',"true")
    }
    if(storage.getItem('enable_shindo_sounds_6-') === ""){
    storage.setItem('enable_shindo_sounds_6-',"true")
    }
    if(storage.getItem('enable_shindo_sounds_6+') === ""){
    storage.setItem('enable_shindo_sounds_6+',"true")
    }
    if(storage.getItem('enable_shindo_sounds_7') === ""){
    storage.setItem('enable_shindo_sounds_7',"true")
    }
    /////////

    if(storage.getItem('shindo_mode')  === ""){
    storage.setItem('shindo_mode',"shindo")
    }
    if(storage.getItem('enable_shindo_TREM')  === ""){
    storage.setItem('enable_shindo_TREM',"true")
    }
    if(storage.getItem('enable_eew_jp')  === ""){
    storage.setItem('enable_eew_jp',"true")
    }
    if(storage.getItem('enable_eew_tw')  === ""){
    storage.setItem('enable_eew_tw',"true")
    }
    if(storage.getItem('enable_RFPLUS')  === ""){
    storage.setItem('enable_RFPLUS',"false")
    }
    if(storage.getItem('RFPLUS_type')  === ""){
    storage.setItem('RFPLUS_type',"RFPLUS2")
    }

    if(storage.getItem('opacity')  === ""){
    storage.setItem('opacity',0.7)
    }

    if(storage.getItem('minimize_to_tray') === ""){
    storage.setItem("minimize_to_tray",'false')
    }


    if(!storage.getItem('enable_gpu')){
        app.disableHardwareAcceleration()
    }
    if(!storage.getItem('enable_autolaunch') || !isDevelopment){
        app.setLoginItemSettings({openAtLogin:true}); 
    }else{
        app.setLoginItemSettings({openAtLogin:false});
    }

    if(storage.getItem('webhook_url_shindo_sokuho')  === ""){
    storage.setItem('webhook_url_shindo_sokuho','')
    }
    if(storage.getItem('webhook_header_shindo_sokuho')  === ""){
    storage.setItem('webhook_header_shindo_sokuho','RF震度速報')
    }
    if(storage.getItem('webhook_url_TW_EEW')  === ""){
    storage.setItem('webhook_url_TW_EEW','')
    }
    /*
    if(storage.getItem('webhook_text_shindo_sokuho')  === ""){
    storage.setItem('webhook_text_shindo_sokuho','')
    }
    */
    if(storage.getItem('webhook_text_TW_EEW')  === ""){
    storage.setItem('webhook_text_TW_EEW','%T發生有感地震 第%N報 規模:M%M 最大震度:%I')
    }
    /* %N = 第N報
    %T = 時間
    %L = 震央
    %M = 規模
    %D = 深度
    %I = 最大震度
    %LAT = lat
    %LON = lon
    */
    if(storage.getItem('selected_station')  === ""){
    storage.setItem('selected_station',"Zhubei_Rexi0026")
    }
    //波型測站
    if(storage.getItem('Canvas1Sta')  === ""){
    storage.setItem('Canvas1Sta',"6050_0021")
    }
    if(storage.getItem('Canvas2Sta')  === ""){
    storage.setItem('Canvas2Sta',"6050_0011")
    }
    if(storage.getItem('Canvas3Sta')  === ""){
    storage.setItem('Canvas3Sta',"6050_0007")
    }
    if(storage.getItem('Canvas4Sta')  === ""){
    storage.setItem('Canvas4Sta',"6050_0003")
    }
}
module.exports = {
    applyDefaults,
};