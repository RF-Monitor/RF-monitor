import { InfoUpdate_full_ws, mapRendererInitialize } from './renderer/report.js';
import { EEWTWManager } from './renderer/EEWTW.js';
import { RFPLUSManager } from './renderer/RFPLUS.js';
import { pgaManager, Flasher } from './renderer/pga.js';
import { TsunamiManager } from './renderer/tsunami.js';
import { WeatherManager } from './renderer/weather.js';
import { locations } from "./data/location.js";
import { switchPage } from './renderer/ui.js';
import { formatShindoTitle, shindo2float } from './renderer/utils/shindo.js';
import { emitConfigChange, onConfigChange } from './renderer/utils/configWatcher.js';
function showLogin(){
  document.getElementById("login").style.display = "block"
}
function hideLogin(){
  document.getElementById("login").style.display = "none"
}
function login(username, password){
	window.auth.login(username, password);
}

/*----------初始化設定值以及變化監聽器----------*/
let cfg = await window.config.getAll();
console.log(cfg)
window.config.onChange((data) => {
  // data = { key, value }
  emitConfigChange(data);
});

// 建立三個地圖
var bounds = L.latLngBounds(L.latLng(90, 360), L.latLng(-90, -180));
/*
var map_shakingArea = L.map('map_shakingArea', { maxBounds: bounds,maxBoundsViscosity: 1.0,zoomControl: false,attributionControl:false,zoomDelta: 0.1 }).setView([23.7, 120.924610], 8);
var osm = new L.TileLayer(osmUrl, { minZoom: 3, maxZoom: 16 });
map_shakingArea.addLayer(osm);*/
var map = L.map('mapid', { maxBounds: bounds,maxBoundsViscosity: 1.0,zoomControl: false ,attributionControl:false,zoomDelta: 0.1}).setView([23.7, 120.924610], 8);
var osmUrl = 'http://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png';
var osm = new L.TileLayer(osmUrl, { minZoom: 3, maxZoom: 16 });
map.addLayer(osm);
var map2 = L.map('map2', { maxBounds: bounds,maxBoundsViscosity: 1.0,zoomControl: false ,attributionControl:false,zoomDelta: 0.1}).setView([23.7, 120.924610], 8);
osmUrl = 'http://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png';
osm = new L.TileLayer(osmUrl, { minZoom: 3, maxZoom: 16 });
map2.addLayer(osm);

var map3 = L.map('map3', { maxBounds: bounds,maxBoundsViscosity: 1.0,zoomControl: false ,attributionControl:false,zoomDelta: 0.1}).setView([23.7, 120.924610], 8);
osmUrl = 'http://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png';
osm = new L.TileLayer(osmUrl, { minZoom: 3, maxZoom: 16 });
map3.addLayer(osm);

// 地理資料
var town_line = {};
var town_ID_list = [];
var country_geojson = {};

await $.getJSON("json/TOWN_MOI.json", function (r) {
	country_geojson = r;
	for (let i = 0; i < r["features"].length; i++) {
		town_line[r["features"][i]["properties"]["TOWNCODE"]] = r["features"][i]
	}
});
//town_ID
await $.getJSON("json/Town_ID.json", function (r) {
	town_ID_list = r;
})

var country_list = ["基隆市", "臺北市", "新北市", "桃園市", "新竹縣", "新竹市", "苗栗縣", "臺中市", "彰化縣", "雲林縣", "嘉義縣", "嘉義市", "臺南市", "高雄市", "屏東縣", "臺東縣", "花蓮縣", "宜蘭縣", "澎湖縣", "金門縣", "連江縣", "南投縣"];
var country_count = 0
var geojson_list = {};

$.ajaxSettings.async = false;

for (let i = 0; i < country_list.length; i++) {
	country_count = i
	await $.getJSON("json/countries/" + country_list[i] + ".json", function (r) {
		geojson_list[country_list[country_count]] = r;
	});
};

//panes
	map.createPane("RFPLUS_shindo_list_layer");
	map.createPane('eew_RF_shindo_list_layer');
	map.createPane('eew_tw_shindo_list_layer');
	map.createPane('countyline');
	map.createPane('wave_layer');
	map.createPane('shindo_icon_disconnected');
	map.createPane('shindo_icon_0');
	map.createPane('shindo_icon_0_0');
	map.createPane('shindo_icon_0_1');
	map.createPane('shindo_icon_0_2');
	map.createPane('shindo_icon_0_3');
	map.createPane('shindo_icon_1');
	map.createPane('shindo_icon_2');
	map.createPane('shindo_icon_3');
	map.createPane('shindo_icon_4');
	map.createPane('shindo_icon_5-');
	map.createPane('shindo_icon_5+');
	map.createPane('shindo_icon_6-');
	map.createPane('shindo_icon_6+');
	map.createPane('shindo_icon_7');
	map2.createPane('shindo_icon_0');
	map2.createPane('shindo_icon_1');
	map2.createPane('shindo_icon_2');
	map2.createPane('shindo_icon_3');
	map2.createPane('shindo_icon_4');
	map2.createPane('shindo_icon_5-');
	map2.createPane('shindo_icon_5+');
	map2.createPane('shindo_icon_6-');
	map2.createPane('shindo_icon_6+');
	map2.createPane('shindo_icon_7');
	map3.createPane('weather_warning_layers');
	map3.createPane('typhoon_layer');
	map.getPane("eew_RF_shindo_list_layer").style.zIndex = 300;
	map.getPane("RFPLUS_shindo_list_layer").style.zIndex = 310;
	map.getPane('eew_tw_shindo_list_layer').style.zIndex = 410;
	map.getPane('countyline').style.zIndex = 420;
	map.getPane('wave_layer').style.zIndex = 450;
	map.getPane('shindo_icon_0').style.zIndex = 601;
	map.getPane('shindo_icon_disconnected').style.zIndex = 600;
	map.getPane('shindo_icon_0_0').style.zIndex = 601;
	map.getPane('shindo_icon_0_1').style.zIndex = 602;
	map.getPane('shindo_icon_0_2').style.zIndex = 603;
	map.getPane('shindo_icon_0_3').style.zIndex = 604;
	map.getPane('shindo_icon_1').style.zIndex = 605;
	map.getPane('shindo_icon_2').style.zIndex = 610;
	map.getPane('shindo_icon_3').style.zIndex = 615;
	map.getPane('shindo_icon_4').style.zIndex = 620;
	map.getPane('shindo_icon_5-').style.zIndex = 625;
	map.getPane('shindo_icon_5+').style.zIndex = 630;
	map.getPane('shindo_icon_6-').style.zIndex = 635;
	map.getPane('shindo_icon_6+').style.zIndex = 640;
	map.getPane('shindo_icon_7').style.zIndex = 645;
	map.getPane('wave_layer').style.zIndex = 450;
	map2.getPane('shindo_icon_0').style.zIndex = 600;
	map2.getPane('shindo_icon_1').style.zIndex = 605;
	map2.getPane('shindo_icon_2').style.zIndex = 610;
	map2.getPane('shindo_icon_3').style.zIndex = 615;
	map2.getPane('shindo_icon_4').style.zIndex = 620;
	map2.getPane('shindo_icon_5-').style.zIndex = 625;
	map2.getPane('shindo_icon_5+').style.zIndex = 630;
	map2.getPane('shindo_icon_6-').style.zIndex = 635;
	map2.getPane('shindo_icon_6+').style.zIndex = 640;
	map2.getPane('shindo_icon_7').style.zIndex = 645;
	map3.getPane('weather_warning_layers').style.zIndex = 430;
	map3.getPane('typhoon_layer').style.zIndex = 440;

  $.ajaxSettings.async = true;

	//Layers
	var eew_tw_shindo_list_layer = L.layerGroup().addTo(map);
	$.getJSON("json/taiwan_ADB.geojson", function (r) {
		var countyline = L.layerGroup([L.geoJSON(r, { color: "#D0D0D0", weight: 1 ,pane:"countyline"})]).addTo(map);
		var countyline2 = L.layerGroup([L.geoJSON(r, { color: "#D0D0D0", weight: 1 })]).addTo(map2);
		var countyline3 = L.layerGroup([L.geoJSON(r, { color: "#D0D0D0", weight: 1 })]).addTo(map3);
	});
	
	var weather_warning_layers = L.layerGroup().addTo(map3);
	var typhoon_layer = L.layerGroup().addTo(map3);
	var distributedLayer = L.layerGroup();

// managers
let EEWTWmanager = new EEWTWManager(map,locations,town_ID_list,town_line,L,{
	onNewAlert: (alert) => {
		Flasher.stop();
		window.notify.send(
			"中央氣象署地震速報",
			`預計震度${formatShindoTitle(alert.localshindo)}，規模${alert.scale}`,
			`shindo_icon/selected/${alert.localshindo}.png`
		)
	},
	
	onAlertEnd: () => {
		if(EEWTWmanager.hasAlert() || RFPLUSmanager.hasAlert()){
			Flasher.stop();
		}else{
			Flasher.start();
		}
	}
});
setInterval(async () => {
	EEWTWmanager.tick(await window.time.now())
},100)
let RFPLUSmanager = new RFPLUSManager(map,locations,town_ID_list,town_line,L,{
	onNewAlert: (alert) => {
		Flasher.stop();
		window.notify.send(
			"中央氣象署地震速報",
			`預計震度${formatShindoTitle(alert.localshindo)}，規模${alert.scale}`,
			`shindo_icon/selected/${alert.localshindo}.png`
		)
	},
	onAlertEnd: () => {
		if(EEWTWmanager.hasAlert() || RFPLUSmanager.hasAlert()){
			Flasher.stop();
		}else{
			Flasher.start();
		}
	}
});
setInterval(async () => {
	RFPLUSmanager.tick(await window.time.now())
},100)
let PGAmanager = new pgaManager(map, L, {
	onStationSelect: (name) => {
        window.config.set("selected_station", name);
        // 或之後改成：
        // window.api.stationSelected(name)
    },
	onShindoReport: (values) => {
		let url = window.config.get("webhook_url_shindo_sokuho");
		let header =  window.config.get("webhook_header_shindo_sokuho");
		let text = `>>> # ${header}\n`;
		const shindoGroups = new Map();
		for (const station of values) {
			if (!shindoGroups.has(station.maxShindo)) {
				shindoGroups.set(station.maxShindo, []);
			}
			shindoGroups.get(station.maxShindo).push(station);
		}

		const sortedShindos = Array.from(shindoGroups.keys()).sort((a, b) => {
			return shindo2float(b) - shindo2float(a);
		});

		for (const shindo of sortedShindos) {
			console.log(formatShindoTitle(shindo));
			text += ( formatShindoTitle(shindo) + "\n" )

			for (const station of shindoGroups.get(shindo)) {
				text += (station.cname + "\n")
				console.log(`${station.cname}`);
			}
		}

		window.webhook.send(url, text);
	}
});
/*
*/
mapRendererInitialize(map2, L);

let tsunamiManager = new TsunamiManager({
	openExternal: (url) => shell.openExternal(url)
});

let weatherManager = new WeatherManager(geojson_list, locations, map3, L);

class CommonMapRenderer{
	constructor(map, leaflet){
		this.map = map;
        this.L = leaflet;
		this.home = this.L.marker([0, 0], { icon: this.L.icon({ iconUrl: "shindo_icon/house.png", iconSize: [10, 10] }), }).addTo(this.map);;
	}
	setHomeLatLon(location){
		this.home.setLatLng(location);
	}
}


const commonMapRenderer = new CommonMapRenderer(map, L);
commonMapRenderer.setHomeLatLon([cfg.user.lat, cfg.user.lon]);
onConfigChange('userlat', async (value) => {
	let cfg = await window.config.getAll();
	commonMapRenderer.setHomeLatLon([cfg.user.lat, cfg.user.lon]);
})
onConfigChange('userlon', async (value) => {
	let cfg = await window.config.getAll();
	commonMapRenderer.setHomeLatLon([cfg.user.lat, cfg.user.lon]);
})

//ws events
if (!window.ws) {
    console.error('window.ws not available');
}
window.ws.onEEWTW(async (data) => {
	if(await window.config.get("enable_eew_tw")){
		EEWTWmanager.handleAlert(cfg.user.lat,cfg.user.lon,data);
	}
});
window.eq.onEEWsim((data) => {
	EEWTWmanager.handleAlert(cfg.user.lat,cfg.user.lon,data);
})
window.ws.onRFPLUS3(async (data) => {
	if(await window.config.get("enable_RFPLUS")){
		RFPLUSmanager.handleAlert(cfg.user.lat,cfg.user.lon,data);
	}
    
});
let data = {
                        "id":"1749301625",
                        "type":"RFPLUS3",
                        "time": 1767460264000,
                        "center":{
                            "lat":24.818,//float
                            "lon":121.02,///float
                            "cname":"新竹縣竹北市",//float
                            "depth":10
                        },
                        "scale":5.123456789,
                        "rate":0,
                        "report_num":1,
                        "final":false
                    }
					let data2 = {
                        "id":"888",
                        "type":"RFPLUS2",
                        "time": 1767460264000,
                        "center":{
                            "lat":25.818,//float
                            "lon":120.02,///float
                            "cname":"新竹縣竹北市",//float
                            "depth":10
                        },
                        "rate":5000,
                        "report_num":1,
                        "final":false
                    }
/*
setTimeout(() => RFPLUSmanager.handleAlert(cfg.user.lat,cfg.user.lon,data),5000)
setTimeout(() => RFPLUSmanager.handleAlert(cfg.user.lat,cfg.user.lon,data2),10000)
*/

window.ws.onPGA(async (data) => {
	const [enable, now, selected] = await Promise.all([
		window.config.get("enable_shindo"),
		window.time.now(),
		window.config.get("selected_station")
	]);

	if (!enable) return;

	PGAmanager.handle(data, now);
	PGAmanager.ui.update(data, selected, now);
});


window.ws.onTsunami(async (data) => {
	const [enable, now] = await Promise.all([
		window.config.get("enable_tsunami"),
		window.time.now()
	]);
	if(!enable) return;
		
	tsunamiManager.handle(data, now);
});

window.ws.onWeather(async (data) => {
	weatherManager.updateWeather(data);
});
window.ws.onTyphoon(async (data) => {
	const enableAnalysis = await window.config.get("enable_ty_analysis");
	weatherManager.updateTyphoon(data, enableAnalysis);
});

window.ws.onReport((data) => {
    InfoUpdate_full_ws(data, async (id) => {
		// 取得震度分布的程式
		return await window.eq.getInfoDistribution(id);
	});
});



//UI events
document.getElementById("nav_eew").addEventListener("click",() => {switchPage("page1", map, map2, map3)})
document.getElementById("nav_report").addEventListener("click",() => {switchPage("page2", map, map2, map3)})
document.getElementById("nav_weather").addEventListener("click",() => {switchPage("page3", map, map2, map3)})
document.getElementById('page2').style.display = "none";
document.getElementById('page3').style.display = "none";
document.getElementById("nav_eew").style.borderBottomColor = "#00FFFF";

document.getElementById("login_btn").addEventListener("click", () => {
	let username = document.getElementById("email").value;
	let password = document.getElementById("password").value;
	login(username, password);
})

//時間
setInterval(async () => {
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
	document.getElementById("nowDiv").innerHTML = formatTimestamp(await window.time.now());
},1000)

let closeBtn = document.querySelector('#setting');
let joinBtn = document.querySelector('#announcement');

closeBtn.addEventListener('click', () => {
    window.windowControl.showSetting();
});

joinBtn.addEventListener('click', () => {
	window.windowControl.showAnnouncement();
});

window.auth.onStatus(({ status }) => {
	if(status == "logged_out"){
		showLogin();
	}else if(status == "logged_in"){
		hideLogin()
	}
})

window.auth.onResult(({ status }) => {
	console.log(status)
	if(status == "success"){
		hideLogin();
	}else{
		showLogin()
	}
})

window.update.onStatus(({status, ver}) => {
	if(status == "New update available"){
		document.getElementById("ver").innerHTML = `<p style='color:white;position:absolute;right:0;bottom: 0;margin-bottom: 0;' onclick='downnewver()'>點擊此處下載更新</p>`;
	}else{
		document.getElementById("ver").innerHTML = "<p style='color:white;position:absolute;right:0;bottom: 0;margin-bottom: 0;'>目前為最新版本</p>";
	}
})


