/*----------EEW_TW----------*/
function EEW_TW(alert){
    if(enable_eew_tw != "false"){

        //----------檢查是不是新警報----------//
        let newAlert = true;
        for(let i = 0; i < EEW_TW_list.length; i++){
            if(EEW_TW_list[i]["id"] == alert["id"]){
                newAlert = false;
            }
        }

        console.log("EEW_TW executing");
        if(newAlert && alert["id"] != "0" && Date.now() + ntpoffset_ - alert["time"] < 180000){
            console.log("EEW_TW new alert");
            let EEW_TW = alert;
            let time = alert["time"];
            let id = alert["id"];
            let center = alert["center"];
            let scale = alert["scale"];
            let depth = center["depth"];
            let report_num = alert["report_num"];
            //添加假想震央icon
            let icon = L.icon({iconUrl : 'shindo_icon/epicenter_tw.png',iconSize : [30,30],});
            let center_icon = L.marker([center["lat"],center["lon"]],{icon : icon,opacity : 1.0}).addTo(map);
            EEW_TW["center"]["icon"] = center_icon;
            //初始化震波圓
            let Pwave =  L.circle([center["lat"],center["lon"]],{color : 'blue' , radius:0 , fill : false,pane:"wave_layer"}).addTo(map);
            let Swave = L.circle([center["lat"],center["lon"]],{color : 'red' , radius:0,pane:"wave_layer"}).addTo(map);
            EEW_TW["center"]["Pwave"] = Pwave;
            EEW_TW["center"]["Swave"] = Swave;
                
            //計算本地震度
            let localPGA = EEW_TW_localPGA(parseFloat(userlat),parseFloat(userlon),center["lat"],center["lon"],scale)
            let localshindo = PGA2shindo(localPGA);
            let localcolor = shindo_color[localshindo];
            EEW_TW["localshindo"] = localshindo;
            //計算各地震度
            EEW_TW = EEW_TW_render(EEW_TW);
            EEW_TW_list.push(EEW_TW);
            //----播放音效----//
            if(enable_tw_eew_sound != "false"){
                if(enable_eew_tw_read != "false"){
                    playAudio_eew(['./audio/tw/eew/new/EEW.mp3' ,'./audio/tw/eew/new/' +localshindo+ '.mp3']);
                }else{
                    playAudio_eew(['./audio/tw/eew/new/EEW.mp3']);
                }
            }
            //UI顯示(此處沒有針對同時多警報做優化)
            document.getElementById("RFPLUS").style.display = "none";//強制取消顯示RFPLUS2

            document.getElementById("RFPLUS3").style.display = "block";
            document.getElementById("RFPLUS3_status_box").style.backgroundColor = "orange";
            document.getElementById("RFPLUS3_maxshindo").src = "shindo_icon/selected/" + EEW_TW["max_shindo"] + ".png";
            document.getElementById("RFPLUS3_epicenter").innerHTML = EEW_TW["center"]["cname"];
            document.getElementById("RFPLUS3_time").innerHTML = formatTimestamp(EEW_TW["time"]);
            document.getElementById("RFPLUS3_report_num").innerHTML = report_num;
            document.getElementById("RFPLUS3_scale").innerHTML = Math.floor(EEW_TW["scale"] * 10) / 10;
                
        }else if(alert["id"] != "0" && Date.now() + ntpoffset_ - alert["time"] < 180000){
            console.log("EEW_TW update");
            let EEW_TW  = alert;
            let time = alert["time"];
            let id = alert["id"];
            let center = alert["center"];
            let scale = alert["scale"];
            let depth = center["depth"];
            let report_num = alert["report_num"];
            //尋找警報列表中該警報的上一報
            let key = 0;
            for(let i = 0; i < EEW_TW_list.length; i++){
                if(EEW_TW_list[i]["id"] == alert["id"]){
                    key = i;
                }
            }
            //繼承部分舊報內容
            EEW_TW["shindoLayer"] = EEW_TW_list[key]["shindoLayer"]
                
            //更新假想震央icon
            EEW_TW["center"]["icon"] = EEW_TW_list[key]["center"]["icon"].setLatLng([alert["center"]["lat"],alert["center"]["lon"]]);

            //更新震波圓位置
            if(!EEW_TW_list[key]["center"]["Pwave"]){
                EEW_TW["center"]["Pwave"] = L.circle([alert["center"]["lat"],alert["center"]["lon"]],{color : 'blue' , radius:0 , fill : false,pane:"wave_layer"}).addTo(map);
            }else{
                EEW_TW["center"]["Pwave"] = EEW_TW_list[key]["center"]["Pwave"].setLatLng([alert["center"]["lat"],alert["center"]["lon"]]);
            }
            if(!EEW_TW_list[key]["center"]["Swave"]){
                EEW_TW["center"]["Swave"] = L.circle([alert["center"]["lat"],alert["center"]["lon"]],{color : 'red' , radius:0,pane:"wave_layer"}).addTo(map);
            }else{
                EEW_TW["center"]["Swave"] = EEW_TW_list[key]["center"]["Swave"].setLatLng([alert["center"]["lat"],alert["center"]["lon"]]);
            }

            //計算本地震度
            let localPGA = EEW_TW_localPGA(parseFloat(userlat),parseFloat(userlon),center["lat"],center["lon"],scale);
            let localshindo = PGA2shindo(localPGA);
            let localcolor = shindo_color[localshindo];
            if(EEW_TW_list[key]["localshindo"] != localshindo){
                //----播放音效----//
                if(enable_tw_eew_sound != "false"){
                    if(enable_eew_tw_read != "false"){
                        playAudio_eew(['./audio/tw/eew/new/' +localshindo+ '.mp3']);
                    }
                }
            }
            //計算各地震度
            EEW_TW = EEW_TW_render(EEW_TW);
            EEW_TW_list[key] = EEW_TW;
            //UI顯示(此處沒有針對同時多警報做優化)
            document.getElementById("RFPLUS").style.display = "none";//強制取消顯示RFPLUS2

            document.getElementById("RFPLUS3").style.display = "block";
            document.getElementById("RFPLUS3_status_box").style.backgroundColor = "orange";
            document.getElementById("RFPLUS3_maxshindo").src = "shindo_icon/selected/" + EEW_TW["max_shindo"] + ".png";
            document.getElementById("RFPLUS3_epicenter").innerHTML = EEW_TW["center"]["cname"];
            document.getElementById("RFPLUS3_time").innerHTML = formatTimestamp(EEW_TW["time"]);
            document.getElementById("RFPLUS3_report_num").innerHTML = report_num;
            document.getElementById("RFPLUS3_scale").innerHTML = Math.floor(EEW_TW["scale"] * 10) / 10;  
        }
    }
}
/*----------EEW_TW 計算PGA----------*/
function EEW_TW_localPGA(townlat,townlon,centerlat,centerlon,scale){
    let depth = 10;
    let distance = Math.sqrt(Math.pow(Math.abs(townlat + (centerlat * -1)) * 111, 2) + Math.pow(Math.abs(townlon + (centerlon * -1)) * 101, 2) + Math.pow(depth, 2));
    ///let distance = Math.sqrt(Math.pow(depth, 2) + Math.pow(surface, 2) + Math.pow(depth, 2));
    let PGA = (1.657 * Math.pow(Math.E, (1.533 * scale)) * Math.pow(distance, -1.607)).toFixed(3);
    return PGA;
}

/*----------EEW_TW 各地震度渲染----------*/
function EEW_TW_render(RFPLUS_eew){
    let max_shindo_RFPLUS = "0";
    let time = RFPLUS_eew["time"];
    let id = RFPLUS_eew["id"];
    let center = RFPLUS_eew["center"];
    let scale = RFPLUS_eew["scale"];
    //----------檢查layer是否已創建(是)----------//
    if(RFPLUS_eew.hasOwnProperty("shindoLayer")){
        RFPLUS_eew["shindoLayer"].clearLayers();
    //----------若無 創建layer----------//
    }else{
        RFPLUS_eew["shindoLayer"] = L.layerGroup().addTo(map);
    }
    
    //----------各縣市----------//
    for(i = 0; i < country_list.length;i++){
        //----------各鄉鎮市區----------//
        for(var key of Object.keys(locations["towns"][country_list[i]])){
            let town_ID = null;
            let townlat = locations["towns"][country_list[i]][key][1];
            let townlon = locations["towns"][country_list[i]][key][2];
            let countryname = country_list[i];
            let townname = key;
            for(j = 0;j < town_ID_list.length;j++){
                if(countryname == town_ID_list[j]["COUNTYNAME"] && townname == town_ID_list[j]["TOWNNAME"]){
                    town_ID = town_ID_list[j]["TOWNCODE"].toString();
                }
            }
            //計算pga
            let PGA = RFPLUS3_localPGA(townlat,townlon,center["lat"],center["lon"],scale);
            //確認震度顏色
            let localshindo = PGA2shindo(PGA);
            let localcolor = shindo_color[localshindo];
            //加入震度色塊
            if(localshindo != "0"){
                let line = town_line[town_ID];
                //console.log(town_line[[town_ID]])
                RFPLUS_eew["shindoLayer"].addLayer(L.geoJSON(line, { color:"#5B5B5B",fillColor: localcolor,weight:1,fillOpacity:1,pane:"RFPLUS_shindo_list_layer" }))
            }
            //判斷是否是最大震度
            if(shindo2float(localshindo) > shindo2float(max_shindo_RFPLUS)){max_shindo_RFPLUS = localshindo;}
        }
    }
    RFPLUS_eew["max_shindo"] = max_shindo_RFPLUS;
    return RFPLUS_eew;
}
function EEW_TW_circleRender(){
    for (let i = 0; i < EEW_TW_list.length; i++) {
        const alert = EEW_TW_list[i];
        const elapsed = timestampNow() - alert["time"];
        const P_radius = elapsed * 6;
        const S_radius = elapsed * 3.5;

        alert["center"]["Pwave"].setRadius(P_radius);
        alert["center"]["Swave"].setRadius(S_radius);  
    }
}
/*----------RFPLUS清除警報----------*/
function EEW_TW_overtime(){
    for(let i = 0; i < EEW_TW_list.length; i++){
        if(Date.now() + ntpoffset_ - EEW_TW_list[i]["time"] >= 180000){//超過發震後3分鐘
            console.log("RFPLUS end");
            if(EEW_TW_list[i]["center"]["Pwave"]){
                EEW_TW_list[i]["center"]["Pwave"].remove();
            }
            if(EEW_TW_list[i]["center"]["Swave"]){
                EEW_TW_list[i]["center"]["Swave"].remove();
            }
            EEW_TW_list[i]["shindoLayer"].clearLayers()//清除地圖圖層
            map.removeLayer(EEW_TW_list[i]["center"]["icon"])//清除地圖icon
            EEW_TW_list.splice(i,1);//移除警報
            document.getElementById("RFPLUS").style.display = "none";//未針對多警報優化
            document.getElementById("RFPLUS3").style.display = "none";//未針對多警報優化
        }
    }
}

function formatTimestamp(timestamp) {
  const date = new Date(timestamp);

  const YYYY = date.getFullYear();
  const MM = String(date.getMonth() + 1).padStart(2, '0'); // 月份從0開始
  const dd = String(date.getDate()).padStart(2, '0');
  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  const ss = String(date.getSeconds()).padStart(2, '0');

  return `${YYYY}-${MM}-${dd} ${hh}:${mm}:${ss}`;
}