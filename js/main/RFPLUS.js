/*----------RFPLUS----------*/
function RFPLUS(alert){
    if(enable_RFPLUS != "false"){

        //----------檢查是不是新警報----------//
        let newAlert = true;
        for(let i = 0; i < RFPLUS_list.length; i++){
            if(RFPLUS_list[i]["id"] == alert["id"]){
                newAlert = false;
            }
        }

        //----------RFPLUS3---------//
        if(alert["type"] == "RFPLUS3"){
            console.log("RFPLUS3 executing");
            if(newAlert && alert["id"] != "0" && Date.now() + ntpoffset_ - alert["time"] < 180000){
                console.log("RFPLUS3 new alert");
                let RFPLUS_eew = alert;
                let time = alert["time"];
                let id = alert["id"];
                let center = alert["center"];
                let scale = alert["scale"];
                let depth = center["depth"];
                let report_num = alert["report_num"];
                //添加假想震央icon
                let icon = L.icon({iconUrl : 'shindo_icon/epicenter_tw.png',iconSize : [30,30],});
                let center_icon = L.marker([center["lat"],center["lon"]],{icon : icon,opacity : 1.0}).addTo(map);
                RFPLUS_eew["center"]["icon"] = center_icon;
                //初始化震波圓
                let Pwave =  L.circle([center["lat"],center["lon"]],{color : 'blue' , radius:0 , fill : false,pane:"wave_layer"}).addTo(map);
                let Swave = L.circle([center["lat"],center["lon"]],{color : 'red' , radius:0,pane:"wave_layer"}).addTo(map);
                RFPLUS_eew["center"]["Pwave"] = Pwave;
                RFPLUS_eew["center"]["Swave"] = Swave;
                
                //計算本地震度
                let localPGA = RFPLUS3_localPGA(parseFloat(userlat),parseFloat(userlon),center["lat"],center["lon"],scale)
                let localshindo = PGA2shindo(localPGA);
                let localcolor = shindo_color[localshindo];
                //計算各地震度
                RFPLUS_eew = RFPLUS3_render(RFPLUS_eew);
                RFPLUS_list.push(RFPLUS_eew);
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
                document.getElementById("RFPLUS3_maxshindo").src = "shindo_icon/selected/" + RFPLUS_eew["max_shindo"] + ".png";
                document.getElementById("RFPLUS3_epicenter").innerHTML = "臺灣附近";
                document.getElementById("RFPLUS3_report_num").innerHTML = report_num;
                document.getElementById("RFPLUS3_scale").innerHTML = RFPLUS_eew["scale"]
                
            }else if(alert["id"] != "0" && Date.now() + ntpoffset_ - alert["time"] < 180000){
                console.log("RFPLUS3 update");
                let RFPLUS_eew = alert;
                let time = alert["time"];
                let id = alert["id"];
                let center = alert["center"];
                let scale = alert["scale"];
                let depth = center["depth"];
                let report_num = alert["report_num"];
                //尋找警報列表中該警報的上一報
                let key = 0;
                for(let i = 0; i < RFPLUS_list.length; i++){
                    if(RFPLUS_list[i]["id"] == alert["id"]){
                        key = i;
                    }
                }
                //繼承部分舊報內容
                RFPLUS_eew["shindoLayer"] = RFPLUS_list[key]["shindoLayer"]
                
                //更新假想震央icon
                RFPLUS_eew["center"]["icon"] = RFPLUS_list[key]["center"]["icon"].setLatLng([alert["center"]["lat"],alert["center"]["lon"]]);

                //更新震波圓位置
                if(!RFPLUS_list[key]["center"]["Pwave"]){
                    RFPLUS_eew["center"]["Pwave"] = L.circle([alert["center"]["lat"],alert["center"]["lon"]],{color : 'blue' , radius:0 , fill : false,pane:"wave_layer"}).addTo(map);
                }else{
                    RFPLUS_eew["center"]["Pwave"] = RFPLUS_list[key]["center"]["Pwave"].setLatLng([alert["center"]["lat"],alert["center"]["lon"]]);
                }
                if(!RFPLUS_list[key]["center"]["Swave"]){
                    RFPLUS_eew["center"]["Swave"] = L.circle([alert["center"]["lat"],alert["center"]["lon"]],{color : 'red' , radius:0,pane:"wave_layer"}).addTo(map);
                }else{
                    RFPLUS_eew["center"]["Swave"] = RFPLUS_list[key]["center"]["Swave"].setLatLng([alert["center"]["lat"],alert["center"]["lon"]]);
                }

                //計算本地震度
                let localPGA = RFPLUS3_localPGA(parseFloat(userlat),parseFloat(userlon),center["lat"],center["lon"],scale);
                let localshindo = PGA2shindo(localPGA);
                let localcolor = shindo_color[localshindo];
                //計算各地震度
                RFPLUS_eew = RFPLUS3_render(RFPLUS_eew);
                RFPLUS_list[key] = RFPLUS_eew;
                //UI顯示(此處沒有針對同時多警報做優化)
                document.getElementById("RFPLUS").style.display = "none";//強制取消顯示RFPLUS2

                document.getElementById("RFPLUS3").style.display = "block";
                document.getElementById("RFPLUS3_status_box").style.backgroundColor = "orange";
                document.getElementById("RFPLUS3_maxshindo").src = "shindo_icon/selected/" + RFPLUS_eew["max_shindo"] + ".png";
                document.getElementById("RFPLUS3_epicenter").innerHTML = "臺灣附近";
                document.getElementById("RFPLUS3_report_num").innerHTML = report_num;
                document.getElementById("RFPLUS3_scale").innerHTML = RFPLUS_eew["scale"]
                
            }
        //----------RFPLUS2---------//
        }else{
            //----------新警報----------//
            if(newAlert && alert["id"] != "0" && Date.now() + ntpoffset_ - alert["time"] < 180000){
                let RFPLUS_eew = alert;
                let time = alert["time"];
                let id = alert["id"];
                let center = alert["center"];
                let rate = alert["rate"];
                let depth = 10;
                let report_num = alert["report_num"];
                //添加假想震央icon
                let icon = L.icon({iconUrl : 'shindo_icon/epicenter_tw.png',iconSize : [30,30],});
                let center_icon = L.marker([center["lat"],center["lon"]],{icon : icon,opacity : 1.0}).addTo(map);
                RFPLUS_eew["center"]["icon"] = center_icon;
                //計算本地震度
                let localPGA = RFPLUS2_localPGA(parseFloat(userlat),parseFloat(userlon),center["lat"],center["lon"],rate)
                let localshindo = PGA2shindo(localPGA);
                let localcolor = shindo_color[localshindo];
                //計算各地震度
                RFPLUS_eew = RFPLUS2_render(RFPLUS_eew);
                RFPLUS_list.push(RFPLUS_eew);
                //----播放音效----//
                if(enable_tw_eew_sound != "false"){
                    if(enable_eew_tw_read != "false"){
                        playAudio_eew(['./audio/tw/eew/new/EEW.mp3' ,'./audio/tw/eew/new/' +localshindo+ '.mp3']);
                    }else{
                        playAudio_eew(['./audio/tw/eew/new/EEW.mp3']);
                    }
                }
                //UI顯示(此處沒有針對同時多警報做優化)
                document.getElementById("RFPLUS").style.display = "none";//強制取消顯示RFPLUS3

                document.getElementById("RFPLUS").style.display = "block";
                document.getElementById("RFPLUS_status_box").style.backgroundColor = "orange";
                document.getElementById("RFPLUS_maxshindo").src = "shindo_icon/selected/" + RFPLUS_eew["max_shindo"] + ".png";
                document.getElementById("RFPLUS_epicenter").innerHTML = center["cname"];
                document.getElementById("RFPLUS_report_num").innerHTML = report_num;

            //----------更正報----------//
            }else if(alert["id"] != "0" && Date.now() + ntpoffset_ - alert["time"] < 180000){
                let RFPLUS_eew = alert;
                let time = alert["time"];
                let id = alert["id"];
                let center = alert["center"];
                let rate = alert["rate"];
                let depth = 10;
                let report_num = alert["report_num"];
                //尋找警報列表中該警報的上一報
                let key = 0;
                for(let i = 0; i < RFPLUS_list.length; i++){
                    if(RFPLUS_list[i]["id"] == alert["id"]){
                        key = i;
                    }
                }
                //繼承部分舊報內容
                RFPLUS_eew["shindoLayer"] = RFPLUS_list[key]["shindoLayer"]
                //更新假想震央icon
                RFPLUS_eew["center"]["icon"] = RFPLUS_list[key]["center"]["icon"].setLatLng([alert["center"]["lat"],alert["center"]["lon"]]);
                //計算本地震度
                let localPGA = RFPLUS2_localPGA(parseFloat(userlat),parseFloat(userlon),center["lat"],center["lon"],rate)
                let localshindo = PGA2shindo(localPGA);
                let localcolor = shindo_color[localshindo];
                //計算各地震度
                RFPLUS_eew = RFPLUS2_render(RFPLUS_eew);
                RFPLUS_list[key] = RFPLUS_eew;
                //UI顯示(此處沒有針對同時多警報做優化)
                document.getElementById("RFPLUS").style.display = "none";//強制取消顯示RFPLUS3

                document.getElementById("RFPLUS").style.display = "block";
                document.getElementById("RFPLUS_status_box").style.backgroundColor = "orange";
                document.getElementById("RFPLUS_maxshindo").src = "shindo_icon/selected/" + RFPLUS_eew["max_shindo"] + ".png";
                document.getElementById("RFPLUS_epicenter").innerHTML = center["cname"];
                document.getElementById("RFPLUS_report_num").innerHTML = report_num;
            }
        }
    }
}
/*----------RFPLUS 計算PGA----------*/
function RFPLUS_localPGA(townlat,townlon,centerlat,centerlon,centerpga,rate){
    let depth = 10;
    let distance = Math.sqrt(Math.pow(Math.abs(townlat + (centerlat * -1)) * 111, 2) + Math.pow(Math.abs(townlon + (centerlon * -1)) * 101, 2) + Math.pow(depth, 2));
    //let distance = Math.sqrt(Math.pow(depth, 2) + Math.pow(surface, 2));
    let PGA = centerpga - distance * rate;
    return PGA;
}

function RFPLUS2_localPGA(townlat,townlon,centerlat,centerlon,rate){
    let depth = 10;
    let distance = Math.sqrt(Math.pow(Math.abs(townlat + (centerlat * -1)) * 111, 2) + Math.pow(Math.abs(townlon + (centerlon * -1)) * 101, 2) + Math.pow(depth, 2));
    ///let distance = Math.sqrt(Math.pow(depth, 2) + Math.pow(surface, 2) + Math.pow(depth, 2));
    let PGA = rate * Math.pow(distance,-1.607);
    return PGA;
}
function RFPLUS3_localPGA(townlat,townlon,centerlat,centerlon,scale){
    let depth = 10;
    let distance = Math.sqrt(Math.pow(Math.abs(townlat + (centerlat * -1)) * 111, 2) + Math.pow(Math.abs(townlon + (centerlon * -1)) * 101, 2) + Math.pow(depth, 2));
    ///let distance = Math.sqrt(Math.pow(depth, 2) + Math.pow(surface, 2) + Math.pow(depth, 2));
    let PGA = (1.657 * Math.pow(Math.E, (1.533 * scale)) * Math.pow(distance, -1.607)).toFixed(3);
    return PGA;
}

/*----------RFPLUS 各地震度渲染----------*/
function RFPLUS2_render(RFPLUS_eew){
        let max_shindo_RFPLUS = "0";
        let time = RFPLUS_eew["time"];
        let id = RFPLUS_eew["id"];
        let center = RFPLUS_eew["center"];
        let rate = RFPLUS_eew["rate"];
        //----------檢查layer是否已創建(是)----------//
        if(RFPLUS_eew.hasOwnProperty("shindoLayer")){
            RFPLUS_eew["shindoLayer"].clearLayers()
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
                let PGA = RFPLUS2_localPGA(townlat,townlon,center["lat"],center["lon"],rate);
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
function RFPLUS3_render(RFPLUS_eew){
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
function RFPLUS_circleRender(){
    for (let i = 0; i < RFPLUS_list.length; i++) {
        const alert = RFPLUS_list[i];
        if(alert["type"] == "RFPLUS3"){
            const elapsed = timestampNow() - alert["time"];
            const P_radius = elapsed * 6;
            const S_radius = elapsed * 3.5;

            alert["center"]["Pwave"].setRadius(P_radius);
            alert["center"]["Swave"].setRadius(S_radius);
        }
        
        
}
}
/*----------RFPLUS清除警報----------*/
function RFPLUS_overtime(){
    for(let i = 0; i < RFPLUS_list.length; i++){
        if(Date.now() + ntpoffset_ - RFPLUS_list[i]["time"] >= 180000){//超過發震後3分鐘
            console.log("RFPLUS end");
            if(RFPLUS_list[i]["center"]["Pwave"]){
                RFPLUS_list[i]["center"]["Pwave"].remove();
            }
            if(RFPLUS_list[i]["center"]["Swave"]){
                RFPLUS_list[i]["center"]["Swave"].remove();
            }
            RFPLUS_list[i]["shindoLayer"].clearLayers()//清除地圖圖層
            map.removeLayer(RFPLUS_list[i]["center"]["icon"])//清除地圖icon
            RFPLUS_list.splice(i,1);//移除警報
            document.getElementById("RFPLUS").style.display = "none";//未針對多警報優化
            document.getElementById("RFPLUS3").style.display = "none";//未針對多警報優化
        }
    }
}