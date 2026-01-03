import { AudioQueue } from "./utils/audioQueue.js";
class RFPLUSManager {
    constructor(map,locations,town_ID_list,town_line,leaflet) {
        this.instances = new Map(); // id → EEW
        this.map = map;
        this.locations = locations;
        this.town_ID_list = town_ID_list;
        this.town_line = town_line;
        this.leaflet = leaflet;
    }

    handleAlert(userlat, userlon, alert) {
        if (!this.instances.has(alert.id)) {
            this.instances.set(alert.id, new RFPLUS(alert, new RFPLUSMapRenderer(this.map,this.locations,this.town_ID_list,this.town_line,this.leaflet), new RFPLUSUI));
            this.instances.get(alert.id).handleNew(userlat, userlon, alert);
        }else{
            this.instances.get(alert.id).handleUpdate(userlat, userlon, alert);
        }
        
    }

    tick(now) {
        for (const [key, EEW] of this.instances) {
            EEW.updateCircleRadius(now);
            if (EEW.checkExpired(now)) {
                EEW.destroy();          // 清理地圖/UI
                this.instances.delete(key);
            }
        }
    }

}

class RFPLUS {
    constructor(alert, renderer, ui) {
        this.alert = alert;
        this.renderer = renderer;
        this.audio = new RFPLUSaudio();
        this.ui = ui;
        this.time = 0;
        this.id = "";
        this.center = {};
        this.scale = 0;
        this.depth = 0;
        this.report_num = 0;
    }

    handleNew(userlat, userlon, alert) {
        this.alert = alert
        //添加假想震央icon //初始化震波圓
        this.renderer.initAlert(alert);

        //計算本地震度
        const localPGA = this.RFPLUS_localPGA(userlat, userlon, alert.center.lat, alert.center.lon, alert.scale);
        this.alert.localshindo = this.PGA2shindo(localPGA);

        //計算各地震度
        this.alert = this.renderer.renderShindo(this.alert);

        //UI顯示
        this.ui.init(this.alert);

        // audio
        this.audio.init(this.alert);
    }

    handleUpdate(userlat, userlon, alert) {
        this.alert = alert
        //更新假想震央icon//更新震波圓位置
        this.renderer.updateCenter(alert);
        
        //計算本地震度
        const localPGA = this.RFPLUS_localPGA(userlat, userlon, alert.center.lat, alert.center.lon, alert.scale);
        this.alert.localshindo = this.PGA2shindo(localPGA);

        //計算各地震度
        this.alert = this.renderer.renderShindo(this.alert);

        //UI顯示
        this.ui.update(this.alert);

        //audio
        this.audio.update(this.alert);
    }

    updateCircleRadius(now) {
        this.renderer.updateCircleRadius(this.alert, now);
    }

    checkExpired(now) {
        if((now - this.alert.time) >= 180000){
            
            return true;
        } // 3 分鐘
        return false;
    }
    destroy(){
        this.renderer.end();
        this.ui.end();
        this.audio = null;
    }

    RFPLUS_localPGA(townlat,townlon,centerlat,centerlon,scale){
        let depth = 10;
        let distance = Math.sqrt(Math.pow(Math.abs(townlat + (centerlat * -1)) * 111, 2) + Math.pow(Math.abs(townlon + (centerlon * -1)) * 101, 2) + Math.pow(depth, 2));
        ///let distance = Math.sqrt(Math.pow(depth, 2) + Math.pow(surface, 2) + Math.pow(depth, 2));
        let PGA = (1.657 * Math.pow(Math.E, (1.533 * scale)) * Math.pow(distance, -1.607)).toFixed(3);
        return PGA;
    }
    /*----------PGA轉震度----------*/
    PGA2shindo(PGA){
        let localcolor = '#63AA8B';
        let localshindo = '0';
        if (PGA >= 800) {
            localshindo = "7";
            localcolor = 'purple';
        } else if (800 >= PGA && 440 < PGA) {
            localshindo = "6+";
            localcolor = '#A50021';
        } else if (440 >= PGA && 250 < PGA) {
            localshindo = "6-";
            localcolor = 'red';
        } else if (250 >= PGA && 140 < PGA) {
            localshindo = "5+";
            localcolor = '#ED1C24';
        } else if (140 >= PGA && 80 < PGA) {
            localshindo = "5-";
            localcolor = '#FF7F27';
        } else if (80 >= PGA && 25 < PGA) {
            localshindo = "4";
            localcolor = '#BAC000';
        } else if (25 >= PGA && 8 < PGA) {
            localshindo = "3";
            localcolor = 'green';
        } else if (8 >= PGA && 2.5 < PGA) {
            localshindo = "2";
            localcolor = '#0066CC';
        } else if (2.5 >= PGA && 0.8 < PGA) {
            localshindo = "1";
            localcolor = 'gray';
        } else {
            localshindo = "0";
        }
        return localshindo;
    }
}

class RFPLUSMapRenderer {
    constructor(map,locations,town_ID_list,town_line,leaflet) {
        this.map = map;
        this.locations = locations;
        this.town_ID_list = town_ID_list
        this.country_list = ["基隆市", "臺北市", "新北市", "桃園市", "新竹縣", "新竹市", "苗栗縣", "臺中市", "彰化縣", "雲林縣", "嘉義縣", "嘉義市", "臺南市", "高雄市", "屏東縣", "臺東縣", "花蓮縣", "宜蘭縣", "澎湖縣", "金門縣", "連江縣", "南投縣"];
        this.town_line = town_line
        this.shindo_color = {
            "0":"white",
            "1":"white",
            "2":"#0066CC",
            "3":"green",
            "4":"#BAC000",
            "5-":"#FF7F27",
            "5+":"#ED1C24",
            "6-":"red",
            "6+":"#A50021",
            "7":"purple"
        };
        this.L = leaflet;
        this.center = {
            icon: null,
            Pwave: null,
            Swave: null
        };
    }

    initAlert(alert) {
        const icon = this.L.icon({iconUrl : 'img/shindo_icon/epicenter_tw.png',iconSize : [30,30],});
        this.center.icon = this.L.marker([alert.center.lat,alert.center.lon],{icon : icon,opacity : 1.0}).addTo(this.map);
        this.center.Pwave = this.L.circle([alert.center.lat,alert.center.lon],{color : 'blue' , radius:0 , fill : false,pane:"wave_layer"}).addTo(this.map);
        this.center.Swave = this.L.circle([alert.center.lat,alert.center.lon],{color : 'red' , radius:0,pane:"wave_layer"}).addTo(this.map);
    }

    updateCenter(alert) {
        this.center.icon.setLatLng([alert.center.lat, alert.center.lon]);
        this.center.Pwave.setLatLng([alert.center.lat, alert.center.lon]);
        this.center.Swave.setLatLng([alert.center.lat, alert.center.lon]);
    }

    renderShindo(alert) {
        let max_shindo = "0";
        let time = alert["time"];
        let id = alert["id"];
        let center = alert["center"];
        let depth = alert["depth"]
        let scale = alert["scale"]; //RFPLUS3 only
        let rate = alert["rate"]; //RFPLUS2 only
        //----------檢查layer是否已創建(是)----------//
        if(this.hasOwnProperty("shindoLayer")){
            this.shindoLayer.clearLayers();
        //----------若無 創建layer----------//
        }else{
            this.shindoLayer = this.L.layerGroup().addTo(this.map);
        }
        //----------各縣市----------//
        for(let i = 0; i < this.country_list.length;i++){
            //----------各鄉鎮市區----------//
            for(var key of Object.keys(this.locations["towns"][this.country_list[i]])){
                let town_ID = null;
                let townlat = this.locations["towns"][this.country_list[i]][key][1];
                let townlon = this.locations["towns"][this.country_list[i]][key][2];
                let countryname = this.country_list[i];
                let townname = key;
                for(let j = 0;j < this.town_ID_list.length;j++){
                    if(countryname == this.town_ID_list[j]["COUNTYNAME"] && townname == this.town_ID_list[j]["TOWNNAME"]){
                        town_ID = this.town_ID_list[j]["TOWNCODE"].toString();
                    }
                }
                //計算pga
                let PGA = 0;
                if(alert.type == "RFPLUS3"){
                    PGA = this.localPGA(townlat,townlon,center["lat"],center["lon"],{scale, depth});
                }else{
                    PGA = this.localPGA(townlat,townlon,center["lat"],center["lon"],{rate});
                }
                
                //確認震度顏色
                let localshindo = this.PGA2shindo(PGA);
                let localcolor = this.shindo_color[localshindo];
                //加入震度色塊
                if(localshindo != "0"){
                    let line = this.town_line[town_ID];
                    //console.log(town_line[[town_ID]])
                    this.shindoLayer.addLayer(this.L.geoJSON(line, { color:"#5B5B5B",fillColor: localcolor,weight:1,fillOpacity:1,pane:"RFPLUS_shindo_list_layer" }))
                }
                //判斷是否是最大震度
                if(this.shindo2float(localshindo) > this.shindo2float(max_shindo)){max_shindo = localshindo;}

            }
        }
        alert["max_shindo"] = max_shindo;
        return alert;
    }

    updateCircleRadius(alert, now) {
        const elapsed = now - alert["time"];
        const P_radius = elapsed * 6;
        const S_radius = elapsed * 3.5;

        this.center.Pwave.setRadius(P_radius);
        this.center.Swave.setRadius(S_radius);  
    }
    end(){
        if (this.shindoLayer) {
            this.map.removeLayer(this.shindoLayer);
            this.shindoLayer.clearLayers();
            this.shindoLayer = null;
        }

        if (this.center.icon) this.map.removeLayer(this.center.icon);
        if (this.center.Pwave) this.map.removeLayer(this.center.Pwave);
        if (this.center.Swave) this.map.removeLayer(this.center.Swave);
    }

    localPGA(townlat,townlon,centerlat,centerlon,{scale = null, rate = null, depth = 10}){
        let distance = Math.sqrt(Math.pow(Math.abs(townlat + (centerlat * -1)) * 111, 2) + Math.pow(Math.abs(townlon + (centerlon * -1)) * 101, 2) + Math.pow(depth, 2));
        ///let distance = Math.sqrt(Math.pow(depth, 2) + Math.pow(surface, 2) + Math.pow(depth, 2));
        let PGA = 0;
        if(scale !== null && scale !== undefined){
            PGA = (1.657 * Math.pow(Math.E, (1.533 * scale)) * Math.pow(distance, -1.607));
        }else if(rate !== null && rate !== undefined){
            PGA = rate * Math.pow(distance,-1.607);
        } 
        return PGA;
    }

    PGA2shindo(PGA){
        let localcolor = '#63AA8B';
        let localshindo = '0';
        if (PGA >= 800) {
            localshindo = "7";
            localcolor = 'purple';
        } else if (800 >= PGA && 440 < PGA) {
            localshindo = "6+";
            localcolor = '#A50021';
        } else if (440 >= PGA && 250 < PGA) {
            localshindo = "6-";
            localcolor = 'red';
        } else if (250 >= PGA && 140 < PGA) {
            localshindo = "5+";
            localcolor = '#ED1C24';
        } else if (140 >= PGA && 80 < PGA) {
            localshindo = "5-";
            localcolor = '#FF7F27';
        } else if (80 >= PGA && 25 < PGA) {
            localshindo = "4";
            localcolor = '#BAC000';
        } else if (25 >= PGA && 8 < PGA) {
            localshindo = "3";
            localcolor = 'green';
        } else if (8 >= PGA && 2.5 < PGA) {
            localshindo = "2";
            localcolor = '#0066CC';
        } else if (2.5 >= PGA && 0.8 < PGA) {
            localshindo = "1";
            localcolor = 'gray';
        } else {
            localshindo = "0";
        }
        return localshindo;
    }
    shindo2float(shindo){
        if(shindo == "5-"){
            shindo = "5"
        }
        if(shindo == "5+"){
            shindo = "5.5"
        }
        if(shindo == "6-"){
            shindo = "6"
        }
        if(shindo == "6+"){
            shindo = "6.5"
        }
        return parseFloat(shindo);
    }
}

class RFPLUSUI {
    constructor() {
        this.dom = null; // 存放對應這筆 eew 的 DOM 節點
        
    }
    init(alert) {
        const container = document.getElementById("RFPLUS_list");

        const div = document.createElement("div");
        div.className = "RFPLUS";
        div.id = `eew-${alert.id}`;

        div.innerHTML = `
					<div id="RFPLUS3_status_box" class="RFPLUS_status_box">
						<h4 style='color:white;background-color: orange;'>RFPLUS警報(第報)</h4>
					</div>
					<div class="RFPLUS_main_box">
						<div style="width:70px">
							<h6 class='lang_CNT' align="center" style="margin-bottom: 2px;">最大震度</h6>
							<h6 class='lang_ENG' align="center" style="margin-bottom: 2px;">max int.</h6>
							<h6 class='lang_JP' align="center" style="margin-bottom: 2px;">最大震度</h6>
							<h6 class='lang_CNS'  align="center" style="margin-bottom: 2px;">最大震度</h6>
							<img id="RFPLUS3_maxshindo" style="width:70px">
						</div>
						<div style="width:160px;margin-left: 10px">
							<div>
								<h4 style='color:white'>
									<span id="RFPLUS3_epicenter"></span>
								</h4>
								<h6 style='color:white'>
									<span id="RFPLUS3_time"></span>
								</h6>
							</div>
							<div class="RFPLUS3_maindown">
								<div class="RFPLUS3_scale"><h4>M<span id="RFPLUS3_scale"></span></h4></div>
								<div class="RFPLUS3_depth"><h4><span id="RFPLUS3_depth"></span></h4></div>
							</div>
						</div>
					</div>
        `

        container.appendChild(div);
        this.dom = div;
    }
    update(alert) {
        if (!this.dom) this.init(alert);

        this.dom.innerHTML += `
            <div id="RFPLUS3_status_box" class="RFPLUS_status_box">
						<h4 style='color:white;background-color: orange;'>RFPLUS警報(第報)</h4>
					</div>
					<div class="RFPLUS_main_box">
						<div style="width:70px">
							<h6 class='lang_CNT' align="center" style="margin-bottom: 2px;">最大震度</h6>
							<h6 class='lang_ENG' align="center" style="margin-bottom: 2px;">max int.</h6>
							<h6 class='lang_JP' align="center" style="margin-bottom: 2px;">最大震度</h6>
							<h6 class='lang_CNS'  align="center" style="margin-bottom: 2px;">最大震度</h6>
							<img id="RFPLUS3_maxshindo" style="width:70px">
						</div>
						<div style="width:160px;margin-left: 10px">
							<div>
								<h4 style='color:white'>
									<span id="RFPLUS3_epicenter"></span>
								</h4>
								<h6 style='color:white'>
									<span id="RFPLUS3_time"></span>
								</h6>
							</div>
							<div class="RFPLUS3_maindown">
								<div class="RFPLUS3_scale"><h4>M<span id="RFPLUS3_scale"></span></h4></div>
								<div class="RFPLUS3_depth"><h4><span id="RFPLUS3_depth"></span></h4></div>
							</div>
						</div>
					</div>
        `
    }
    end(){
        if (!this.dom) return;

        this.dom.remove();   // 從 DOM tree 移除
        this.dom = null;
    }
}

class RFPLUSaudio{
    constructor(){
        this.audioQueue = new AudioQueue();
        this.localshindo = ""
    }
    init(alert){
        this.localshindo = alert.localshindo;
        this.audioQueue.play(['./audio/tw/eew/new/EEW.mp3' ,'./audio/tw/eew/new/' +this.localshindo+ '.mp3']);
    }
    update(alert){
        if(alert.localshindo != this.localshindo){
            this.audioQueue.play(['./audio/tw/eew/new/' +alert.localshindo+ '.mp3'])
        }
        this.localshindo = alert.localshindo;
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

export { RFPLUSManager };