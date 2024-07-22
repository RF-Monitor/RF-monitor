const path = require('path');
const { shell } = require('electron');
const storage = require('electron-localstorage');
const { resolve } = require('path');
let ipcRenderer = require('electron').ipcRenderer;
const { setFdLimit } = require('process');
storage.setStoragePath(path.join(__dirname, '../../../../RF-Monitor_config/config.json'));


userlat = storage.getItem("userlat");
userlon = storage.getItem("userlon");
enable_window_popup = storage.getItem("enable_window_popup");
enable_ty_analysis = storage.getItem("enable_ty_analysis");
enable_eew_tw_read = storage.getItem("enable_eew_tw_read");
let opacity_ = storage.getItem('opacity');
selected_station = storage.getItem('selected_station');
document.querySelector(".left").style.opacity = opacity_;
document.querySelector(".right").style.opacity = opacity_;
///////////震度音效/////////////
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
//震度變數
eew_tw_shindo_list = [];
max_shindo = "0";
max_Shindo_before = "0"; 
//音效
aud1 = new Audio("./audio/tw/shindo/1.mp3");
aud2 = new Audio("./audio/tw/shindo/2.mp3");
aud3 = new Audio("./audio/tw/shindo/3.mp3");
aud4 = new Audio("./audio/tw/shindo/4.mp3");
aud5j = new Audio("./audio/tw/shindo/5-.mp3");
aud5k = new Audio("./audio/tw/shindo/5+.mp3");
aud6j = new Audio("./audio/tw/shindo/6-.mp3");
aud6k = new Audio("./audio/tw/shindo/6+.mp3");
aud7 = new Audio("./audio/tw/shindo/7.mp3");
nowplayAud_eew = null;
audioInterval_eew = null;
audio_ended_eew = false;
function playAudio_eew2(audio){
	return new Promise(resolve=> {
		audio.play()
        audio.onended=function(){
			resolve("1")
		};
	})
}
async function playAudio_eew(path){
	console.log(path.length)
	for(l = 0;l<path.length;l++){
		console.log("start")
		nowplayAud_eew = new Audio(path[l]);
		console.log(path[l]);
		let a = await playAudio_eew2(nowplayAud_eew);
		console.log(l)
	}
	console.log("end")
}
//playAudio_eew(['./audio/tw/eew/alert.mp3',"./audio/tw/eew/local.mp3","./audio/tw/eew/7.mp3","./audio/tw/eew/max.mp3","./audio/tw/eew/7.mp3"]);
//震度轉換
function shindo2float(shindo){
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

function float2shindo(shindo){
	let ret
	if(shindo == "5"){
		ret = "5-"
	}
	if(shindo == "5.5"){
		ret = "5+"
	}
	if(shindo == "6"){
		ret = "6-"
	}
	if(shindo == "6.5"){
		ret = "6+"
	}else{
		ret = shindo.toString();
	}
	return ret;
}

function InfoUpdate()
		{
			if(XHR.readyState == 4)
			{
				if(XHR.status ==200)
				{
					if (true)
					{
						let earthquakeInfo = XHR.responseText;
						console.log(earthquakeInfo);
						earthquakeInfo = earthquakeInfo.split(';');
						let htmlText = "";
						htmlText = '';
						let color = '';
						for(i = 0;i < earthquakeInfo.length-1;i++)
						{	
							result = earthquakeInfo[i].split(',');
							if(result[2] == '1')
							{
								color = 'gray';
							}
							else if(result[2] == '2')
							{
								color = '#0066CC';
							}
							else if(result[2] == '3')
							{
								color = 'green';
							}
							else if(result[2] == '4')
							{
								color = '#BAC000';
							}
							else if(result[2] == '5-')
							{
								color = 'red';
							}
							else if(result[2] == '5+')
							{
								color = 'red';
							}
							else if(result[2] == '6-')
							{
								color = 'brown';
							}
							else if(result[2] == '6+')
							{
								color = 'brown';
			 				}
							else if(result[2] == '7')
							{
								color = 'purple';
							}
							else
							{
								color = '#63AA8B';
							}
							
							htmlText = htmlText + "<a href='"+result[6]+"'><table border=0 cellpadding='1px' style='background-color:" + color + "' class='earthquake_report'><tr><td rowspan=3><p style='color:white;font-size:60px ' align='left' >" + result[2] + "</p></td><td colspan=2 ><h4 style='color:white' align='left'>" + result[0] + "</h3></td></tr><tr><td colspan=2 ><h6 style='color:white' align='left'>" + result[4] + "</h6></td></tr>"; 
							htmlText = htmlText + "<tr><td><h4 style='color:white' align='left'>" + result[1] + "</h5></td><td><h4 style='color:white' align='right'>"+result[3]+"</h5></td></tr>"
							htmlText = htmlText + '</table></a>';
						}
						if (htmlText!='')
						{
							document.getElementById("earthquakeInfo").innerHTML = htmlText;
						}
						
					}
					//if(mode == 'eew')
					//{
						
					//}
					//if(mode == 'PGA')
					//{
					
					//}
				}
			}
		}
		function InfoUpdate_full()
		{
			if(XHR.readyState == 4)
			{
				if(XHR.status ==200)
				{
					if (true)
					{
						let earthquakeInfo = XHR.responseText;
						console.log(earthquakeInfo);
						earthquakeInfo = JSON.parse(earthquakeInfo)
						let htmlText = "";
						htmlText = '';
						let color = '';
						for(i = 0;i < earthquakeInfo.length;i++)
						{	
							if(earthquakeInfo[i]["max_shindo"] == '1')
							{
								color = 'gray';
							}
							else if(earthquakeInfo[i]["max_shindo"] == '2')
							{
								color = '#0066CC';
							}
							else if(earthquakeInfo[i]["max_shindo"] == '3')
							{
								color = 'green';
							}
							else if(earthquakeInfo[i]["max_shindo"] == '4')
							{
								color = '#BAC000';
							}
							else if(earthquakeInfo[i]["max_shindo"] == '5-')
							{
								color = 'red';
							}
							else if(earthquakeInfo[i]["max_shindo"] == '5+')
							{
								color = 'red';
							}
							else if(earthquakeInfo[i]["max_shindo"] == '6-')
							{
								color = 'brown';
							}
							else if(earthquakeInfo[i]["max_shindo"] == '6+')
							{
								color = 'brown';
			 				}
							else if(earthquakeInfo[i]["max_shindo"] == '7')
							{
								color = 'purple';
							}
							else
							{
								color = '#63AA8B';
							}
							let url = 
							htmlText = htmlText + "<table onclick='' border=0 cellpadding='1px' style='background-color:" + color + "' class='earthquake_report'><tr><td rowspan=3><p style='color:white;font-size:60px ' align='left' >" + earthquakeInfo[i]["max_shindo"] + "</p></td><td colspan=2 ><h4 style='color:white' align='left'>" + earthquakeInfo[i]["epicenter"] + "</h3></td></tr><tr><td colspan=2 ><h6 style='color:white' align='left'>" + earthquakeInfo[i]["datetime"] + "</h6></td></tr>"; 
							htmlText = htmlText + "<tr><td><h4 style='color:white' align='left'>" + earthquakeInfo[i]["magnitude"] + "</h5></td><td><h4 style='color:white' align='right'>"+earthquakeInfo[i]["depth"]+"</h5></td></tr>"
							htmlText = htmlText + '</table>';
						}
						if (htmlText!='')
						{
							document.getElementById("earthquakeInfo").innerHTML = htmlText;
						}
						
					}
					//if(mode == 'eew')
					//{
						
					//}
					//if(mode == 'PGA')
					//{
					
					//}
				}
			}
		}
		function eewupdate()
		{
			if (XHR2.readyState == 4){
				if(XHR2.status ==200){
					if(enable_eew_jp != "false"){
						let eew = XHR2.responseText;
						eew = eew.split(',');
						let id = '';
						let version = '';
						let epicenter = '';
						let magnitude = '';
						let depth = '';
						let shindo = '';
						let timestamp = 0;
						let lat = 0;
						let lon = 0;
						let status_color = '#0000E3';
						let main_color = 'blue';
						let status = '';
						let status_box = null;
						let mainbox = null;

						if(eew != '')
						{
							if(eew == '0')
							{
								status_color = '#0000E3';
								main_color = 'blue';
								epicenter = '-';
								magnitude = 'M-';
								depth = '-km';
								status = '目前沒有地震速報';
								
							}
							else
							{
								id = eew[0];
								version = eew[1];
								epicenter = eew[2];
								magnitude = eew[3];
								depth = eew[4];
								shindo = eew[5];
								timestamp = eew[6];
								lat = eew[8];
								lon = eew[7];
								status = '緊急地震速報(第'+version+'報)';
								
								main_color = 'blue';
								if (shindo == '1' || shindo == '2' || shindo == '3' || shindo == '4')
								{
									status_color = 'orange';
								}
								else
								{
									status_color = 'red';
								}
								if (shindo == '1')
								{
									main_color = 'gray';
								}
								else if (shindo == '2')
								{
									main_color = '#0066CC';
								}
								else if (shindo == '3')
								{
									main_color = 'green';
								}
								else if (shindo == '4')
								{
									main_color = '#BAC000';
								}
								else if (shindo == '5弱')
								{
									main_color = 'red';
								}
								else if (shindo == '5強')
								{
									main_color = 'red';
								}
								else if (shindo == '6弱')
								{
									main_color = 'brown';
								}
								else if (shindo == '6強')
								{
									main_color = 'brown';
								}
								else if (shindo == '7')
								{
									main_color = 'purple';
								}
								else 
								{
									main_color = '#63AA8B';
								}
								
								
							}
							status_box = document.querySelector('.eew_jp_status_box');
							status_box.style.backgroundColor = status_color;

							main_box = document.querySelector('.eew_jp_main_box');
							main_box.style.backgroundColor = main_color;

							document.getElementById("eew_jp_status").innerHTML = status;
							document.getElementById("eew_jp_epicenter").innerHTML = epicenter;
							document.getElementById("eew_jp_magnitude").innerHTML = magnitude;
							document.getElementById("eew_jp_depth").innerHTML = depth;

							
							eew_jp_lat = parseFloat(lat);
							eew_jp_lon = parseFloat(lon);
							eew_jp_depth = parseInt(depth.replace('km',''));
							eew_jp_timestamp = parseInt(timestamp);
							eew_jp_id = id;
							eew_jp_version = version;
						}
					}
				}
			}
		}
		function jp_eew_circle(){
			//沒地震
			if(eew_jp_id == ''){
				//震波消失
				if(eew_jp_Pcircle != null || eew_jp_Scircle != null){
					map.removeLayer(eew_jp_Pcircle);
					map.removeLayer(eew_jp_Scircle);
					map.removeLayer(eew_jp_epicenter_icon);
					eew_jp_Pcircle = null;
					eew_jp_Scircle = null;
					eew_jp_epicenter_icon = null;
					eew_jp_lat_displayed = 0;
					eew_jp_lon_displayed = 0;
					eew_jp_depth_displayed = 0;
					eew_jp_timestamp_displayed = 0;
					eew_jp_id_displayed = '';
					eew_jp_version_displayed = '';
				}
			//新地震
			}else if(eew_jp_id != eew_jp_id_displayed){
				console.log(1);
				if(eew_jp_Pcircle != null){//移除舊報
					map.removeLayer(eew_jp_Pcircle);
					eew_jp_Pcircle = null;
				}
				if(eew_jp_Scircle != null){
					map.removeLayer(eew_jp_Scircle);
					eew_jp_Scircle = null;
				}
				if(eew_jp_epicenter_icon != null){
					map.removeLayer(eew_jp_epicenter_icon);
					eew_jp_epicenter_icon = null;
				}
				let timestamp_now = Date.now();//現在的timestamp
				let elapsed = (timestamp_now - (eew_jp_timestamp - 3600000)) / 1000;//timestamp差異
				let p_radius = Math.sqrt(Math.pow(6.5 * elapsed,2) - Math.pow(eew_jp_depth,2));//P半徑
				let s_radius = Math.sqrt(Math.pow(3.5 * elapsed,2) - Math.pow(eew_jp_depth,2));//s半徑
				if (s_radius <= 0){
					s_radius = 0;
				}
				//顯示circle和震央
				eew_jp_Pcircle = L.circle([eew_jp_lat,eew_jp_lon],{color : 'blue' , radius:p_radius*1000}).addTo(map);
				eew_jp_Scircle = L.circle([eew_jp_lat,eew_jp_lon],{color : 'red' , radius:s_radius*1000}).addTo(map);
				let epiicon = L.icon({iconUrl : 'shindo_icon/epicenter_jp.png',iconSize : [30,30],});
				eew_jp_epicenter_icon = L.marker([eew_jp_lat,eew_jp_lon],{icon : epiicon,opacity : 1.0}).addTo(map);
				//更新已顯示資料
				eew_jp_depth_displayed = eew_jp_depth;
				eew_jp_id_displayed = eew_jp_id;
				eew_jp_lat_displayed = eew_jp_lat;
				eew_jp_lon_displayed = eew_jp_lon;
				eew_jp_timestamp_displayed = eew_jp_timestamp;
				eew_jp_version_displayed = eew_jp_version;
			//更正報
			}else if(eew_jp_version != '' && eew_jp_version != eew_jp_version_displayed){
				console.log(2);
				let timestamp_now = Date.now();//現在的timestamp
				let elapsed = (timestamp_now - (eew_jp_timestamp - 3600000)) / 1000;//timestamp差異

				let p_radius = Math.sqrt(Math.pow(6.5 * elapsed,2) - Math.pow(eew_jp_depth,2));//P半徑
				let s_radius = Math.sqrt(Math.pow(3.5 * elapsed,2) - Math.pow(eew_jp_depth,2));//s半徑
				if (s_radius <= 0){
					s_radius = 0;
				}
				//更新半徑
				eew_jp_Pcircle.setRadius(p_radius * 1000);
				eew_jp_Scircle.setRadius(s_radius * 1000);
				//更新座標
				eew_jp_Pcircle.setLatLng([eew_jp_lat,eew_jp_lon]);
				eew_jp_Scircle.setLatLng([eew_jp_lat,eew_jp_lon]);
				eew_jp_epicenter_icon.setLatLng([eew_jp_lat,eew_jp_lon]);
				//更新已顯示資料
				eew_jp_depth_displayed = eew_jp_depth;
				eew_jp_id_displayed = eew_jp_id;
				eew_jp_lat_displayed = eew_jp_lat;
				eew_jp_lon_displayed = eew_jp_lon;
				eew_jp_timestamp_displayed = eew_jp_timestamp;
				eew_jp_version_displayed = eew_jp_version;
			//原地震原報更新
			}else{
				console.log(3);
				let timestamp_now = Date.now();//現在的timestamp
				let elapsed = (timestamp_now - (eew_jp_timestamp - 3600000)) / 1000;//timestamp差異

				let p_radius = Math.sqrt(Math.pow(6.5 * elapsed,2) - Math.pow(eew_jp_depth,2));//P半徑
				let s_radius = Math.sqrt(Math.pow(3.5 * elapsed,2) - Math.pow(eew_jp_depth,2));//s半徑
				if (s_radius <= 0){
					s_radius = 0;
				}
				//更新半徑
				eew_jp_Pcircle.setRadius(p_radius * 1000);
				eew_jp_Scircle.setRadius(s_radius * 1000);
				//更新已顯示資料
				eew_jp_depth_displayed = eew_jp_depth;
				eew_jp_id_displayed = eew_jp_id;
				eew_jp_lat_displayed = eew_jp_lat;
				eew_jp_lon_displayed = eew_jp_lon;
				eew_jp_timestamp_displayed = eew_jp_timestamp;
				eew_jp_version_displayed = eew_jp_version;
			}
		}
		function eewupdate_tw(){
			if (XHR4.readyState == 4){
				if(XHR4.status ==200){
					if(enable_eew_tw != "false"){
						let eew = XHR4.responseText;
						console.log(eew,"tw")
						
						let id = '';
						let version = '';
						let epicenter = '';
						let magnitude = '';
						let depth = '';
						let shindo = '';
						let timestamp = 0;
						let lat = 0;
						let lon = 0;
						let status_color = '#0000E3';
						let main_color = 'blue';
						let status = '';
						let status_box = null;
						let mainbox = null;
						let localshindo = "";
						let localcolor = "blue";

						if(eew != '')
						{
							if(eew == '0')
							{
								status_color = '#0000E3';
								main_color = 'blue';
								epicenter = '-';
								magnitude = '-';
								depth = '-';
								status = '目前沒有地震速報';
								
							}
							else
							{
								
								eew = eew.split(',');
								timestamp = eew[6];
								let timestamp_now = Date.now();
								console.log(timestamp_now);
								if(timestamp_now - parseInt(timestamp)  <= 200000){
									
									id = eew[0];
									version = eew[1];
									epicenter = eew[2];
									magnitude = eew[3];
									depth = eew[4];
									shindo = eew[5];
									lat = eew[8];
									lon = eew[7];

									
									status = '緊急地震速報(第'+version+'報)';
									
									main_color = 'blue';
									if (shindo == '1' || shindo == '2' || shindo == '3' || shindo == '4')
									{
										status_color = 'orange';
									}
									else
									{
										status_color = 'red';
									}
									if (shindo == '1')
									{
										main_color = 'gray';
									}
									else if (shindo == '2')
									{
										main_color = '#0066CC';
									}
									else if (shindo == '3')
									{
										main_color = 'green';
									}
									else if (shindo == '4')
									{
										main_color = '#BAC000';
									}
									else if (shindo == '5弱')
									{
										main_color = 'red';
									}
									else if (shindo == '5強')
									{
										main_color = 'red';
									}
									else if (shindo == '6弱')
									{
										main_color = 'brown';
									}
									else if (shindo == '6強')
									{
										main_color = 'brown';
									}
									else if (shindo == '7')
									{
										main_color = 'purple';
									}
									else 
									{
										main_color = '#63AA8B';
									}
									//計算本地震度
									let surface = Math.sqrt(Math.pow(Math.abs(parseFloat(userlat) + (parseFloat(lat) * -1)) * 111, 2) + Math.pow(Math.abs(parseFloat(userlon) + (parseFloat(lon) * -1)) * 101, 2));
									let distance = Math.sqrt(Math.pow(parseInt(depth), 2) + Math.pow(surface, 2));
									//let value = Math.round((distance - ((new Date().getTime() - json.Time) / 1000) * 3.5) / 3.5)
									localshindo = "0";
									let PGA = (1.657 * Math.pow(Math.E, (1.533 * parseFloat(magnitude))) * Math.pow(distance, -1.607)).toFixed(3);
									console.log(userlat);
									console.log(surface);
									console.log(distance);
									console.log(PGA);
									localcolor = '#63AA8B';
									if (PGA >= 800) {
										localshindo = "7";
										localcolor = 'purple';
									} else if (800 >= PGA && 440 < PGA) {
										localshindo = "6+";
										localcolor = 'brown';
									} else if (440 >= PGA && 250 < PGA) {
										localshindo = "6-";
										localcolor = 'brown';
									} else if (250 >= PGA && 140 < PGA) {
										localshindo = "5+";
										localcolor = 'red';
									} else if (140 >= PGA && 80 < PGA) {
										localshindo = "5-";
										localcolor = 'red';
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
										localcolor = 'blue';
									}
									
									
								}else{
									status_color = '#0000E3';
									main_color = 'blue';
									epicenter = '-';
									magnitude = '-';
									depth = '-';
									status = '目前沒有地震速報';
									localshindo = "";
									localcolor = "blue";
								}
							}
							//狀態顏色
							status_box = document.querySelector('.eew_tw_status_box');
							status_box.style.backgroundColor = status_color;
							//最大震度顏色
							main_box = document.querySelector('.eew_tw_main_box');
							main_box.style.backgroundColor = main_color;
							//主格
							document.getElementById("eew_tw_status").innerHTML = status;
							document.getElementById("eew_tw_epicenter").innerHTML = epicenter;
							document.getElementById("eew_tw_magnitude").innerHTML = "M"+magnitude;
							document.getElementById("eew_tw_depth").innerHTML = depth+"km";
							//本地震度
							document.getElementById("localshindo").innerHTML = localshindo;
							let block = document.querySelector('.eew_tw_local');
							block.style.backgroundColor = localcolor;
							
							//public var
							eew_tw_magnitude = parseFloat(magnitude);
							eew_tw_lat = parseFloat(lat);
							eew_tw_lon = parseFloat(lon);
							eew_tw_depth = parseInt(depth.replace('km',''));
							eew_tw_timestamp = parseInt(timestamp);
							eew_tw_id = id;
							eew_tw_version = version;
							eew_tw_localshindo = localshindo;
						}
					}
				}
			}
		}
		
		function tw_eew_circle(){
			//沒地震
			if(eew_tw_id == ''){
				//震度色塊
				eew_tw_shindo_list_layer.clearLayers();
				//if(eew_tw_shindo_list_layer != null){
					//map.removeLayer(eew_tw_shindo_list_layer);
					//eew_tw_shindo_list_layer = null;
				//}
				//震波圓
				//震波消失
				if(eew_tw_Pcircle != null || eew_tw_Scircle != null){
					
					map.removeLayer(eew_tw_Pcircle);
					map.removeLayer(eew_tw_Scircle);
					map.removeLayer(eew_tw_epicenter_icon);
					eew_tw_Pcircle = null;
					eew_tw_Scircle = null;
					eew_tw_epicenter_icon = null;
					eew_tw_lat_displayed = 0;
					eew_tw_lon_displayed = 0;
					eew_tw_depth_displayed = 0;
					eew_tw_timestamp_displayed = 0;
					eew_tw_id_displayed = '';
					eew_tw_version_displayed = '';
				}
			//新地震
			}else if(eew_tw_id != eew_tw_id_displayed){
				let max_shindo = "0"
				console.log(11);
				eew_tw_shindo_list = [];
				//if(eew_tw_shindo_list_layer != null){
					//map.removeLayer(eew_tw_shindo_list_layer);
					//eew_tw_shindo_list_layer = null;
				//}
				
				eew_tw_shindo_list_layer.clearLayers();
				
				for(i = 0; i < country_list.length;i++){
					//震度色塊
					for(var key of Object.keys(locations["towns"][country_list[i]])){
						let town_ID = null;
						let townlat = locations["towns"][country_list[i]][key][1];
						let townlon = locations["towns"][country_list[i]][key][2];
						let countryname = country_list[i];
						let townname = key;
						console.log(townname);
						for(j = 0;j < town_ID_list.length;j++){
							if(countryname == town_ID_list[j]["COUNTYNAME"] && townname == town_ID_list[j]["TOWNNAME"]){
								town_ID = town_ID_list[j]["TOWNCODE"].toString();
							}
						}

						let surface = Math.sqrt(Math.pow(Math.abs(townlat + (eew_tw_lat * -1)) * 111, 2) + Math.pow(Math.abs(townlon + (eew_tw_lon * -1)) * 101, 2));
						let distance = Math.sqrt(Math.pow(eew_tw_depth, 2) + Math.pow(surface, 2));
						//let value = Math.round((distance - ((new Date().getTime() - json.Time) / 1000) * 3.5) / 3.5)
						let PGA = (1.657 * Math.pow(Math.E, (1.533 * eew_tw_magnitude)) * Math.pow(distance, -1.607)).toFixed(3);
						let localcolor = '#63AA8B';
						let localshindo = '0';
						if (PGA >= 800) {
							localshindo = "7";
							localcolor = 'purple';
						} else if (800 >= PGA && 440 < PGA) {
							localshindo = "6+";
							localcolor = 'brown';
						} else if (440 >= PGA && 250 < PGA) {
							localshindo = "6-";
							localcolor = 'brown';
						} else if (250 >= PGA && 140 < PGA) {
							localshindo = "5+";
							localcolor = 'red';
						} else if (140 >= PGA && 80 < PGA) {
							localshindo = "5-";
							localcolor = 'red';
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
						if(localshindo != "0"){
							let line = town_line[town_ID];
							//console.log(town_line[[town_ID]])
							console.log(town_line)
							eew_tw_shindo_list_layer.addLayer(L.geoJSON(line, { color:"#5B5B5B",fillColor: localcolor,weight:1,fillOpacity:1 }))
								
							
						}
						if(shindo2float(max_shindo)<shindo2float(localshindo)){
							max_shindo = localshindo;
						}
						
					}
					

				}
				console.log(eew_tw_localshindo)
				console.log(max_shindo)
				if(enable_window_popup != 'false'){
					ipcRenderer.send('showMain');
				}
				if(enable_eew_tw_read != "false"){
					playAudio_eew(['./audio/tw/eew/alert.mp3',"./audio/tw/eew/local.mp3","./audio/tw/eew/"+eew_tw_localshindo+".mp3","./audio/tw/eew/max.mp3","./audio/tw/eew/"+max_shindo+".mp3"]);
				}
				//eew_tw_shindo_list_layer = L.layerGroup(eew_tw_shindo_list).addTo(map);
				//震波圓
				console.log(1);
				if(eew_tw_Pcircle != null){//移除舊報
					map.removeLayer(eew_tw_Pcircle);
					eew_tw_Pcircle = null;
				}
				if(eew_tw_Scircle != null){
					map.removeLayer(eew_tw_Scircle);
					eew_tw_Scircle = null;
				}
				if(eew_tw_epicenter_icon != null){
					map.removeLayer(eew_tw_epicenter_icon);
					eew_tw_epicenter_icon = null;
				}
				let timestamp_now = Date.now();//現在的timestamp
				let elapsed = (timestamp_now - (eew_tw_timestamp)) / 1000;//timestamp差異
				let p_radius = Math.sqrt(Math.pow(6.5 * elapsed,2) - Math.pow(eew_tw_depth,2));//P半徑
				let s_radius = Math.sqrt(Math.pow(3.5 * elapsed,2) - Math.pow(eew_tw_depth,2));//s半徑
				if (s_radius <= 0){
					s_radius = 0;
				}
				//顯示circle和震央
				eew_tw_Pcircle = L.circle([eew_tw_lat,eew_tw_lon],{color : 'blue' , radius:p_radius*1000}).addTo(map);
				eew_tw_Scircle = L.circle([eew_tw_lat,eew_tw_lon],{color : 'red' , radius:s_radius*1000}).addTo(map);
				let epiicon = L.icon({iconUrl : 'shindo_icon/epicenter_tw.png',iconSize : [30,30],});
				eew_tw_epicenter_icon = L.marker([eew_tw_lat,eew_tw_lon],{icon : epiicon,opacity : 1.0}).addTo(map);
				//eew_tw_Pcircle.setZIndex(2);
				//eew_tw_Scircle.setZIndex(3);
				//eew_tw_epicenter_icon.setZIndex(4);
				//更新已顯示資料
				eew_tw_depth_displayed = eew_tw_depth;
				eew_tw_id_displayed = eew_tw_id;
				eew_tw_lat_displayed = eew_tw_lat;
				eew_tw_lon_displayed = eew_tw_lon;
				eew_tw_timestamp_displayed = eew_tw_timestamp;
				eew_tw_version_displayed = eew_tw_version;
			//更正報
			}else if(eew_tw_version != '' && eew_tw_version != eew_tw_version_displayed){
				//震波色塊
				console.log(11);
				eew_tw_shindo_list = [];
				//if(eew_tw_shindo_list_layer != null){
					//map.removeLayer(eew_tw_shindo_list_layer);
					//eew_tw_shindo_list_layer = null;
				//}
				eew_tw_shindo_list_layer.clearLayers();
				
				for(i = 0; i < country_list.length;i++){
					for(var key of Object.keys(locations["towns"][country_list[i]])){
						let town_ID = null;
						let townlat = locations["towns"][country_list[i]][key][1];
						let townlon = locations["towns"][country_list[i]][key][2];
						let countryname = country_list[i];
						let townname = key;
						console.log(townname);
						for(j = 0;j < town_ID_list.length;j++){
							if(countryname == town_ID_list[j]["COUNTYNAME"] && townname == town_ID_list[j]["TOWNNAME"]){
								town_ID = town_ID_list[j]["TOWNCODE"].toString();
							}
						}

						let surface = Math.sqrt(Math.pow(Math.abs(townlat + (eew_tw_lat * -1)) * 111, 2) + Math.pow(Math.abs(townlon + (eew_tw_lon * -1)) * 101, 2));
						let distance = Math.sqrt(Math.pow(eew_tw_depth, 2) + Math.pow(surface, 2));
						//let value = Math.round((distance - ((new Date().getTime() - json.Time) / 1000) * 3.5) / 3.5)
						let PGA = (1.657 * Math.pow(Math.E, (1.533 * eew_tw_magnitude)) * Math.pow(distance, -1.607)).toFixed(3);
						let localcolor = '#63AA8B';
						let localshindo = '0';
						if (PGA >= 800) {
							localshindo = "7";
							localcolor = 'purple';
						} else if (800 >= PGA && 440 < PGA) {
							localshindo = "6+";
							localcolor = 'brown';
						} else if (440 >= PGA && 250 < PGA) {
							localshindo = "6-";
							localcolor = 'brown';
						} else if (250 >= PGA && 140 < PGA) {
							localshindo = "5+";
							localcolor = 'red';
						} else if (140 >= PGA && 80 < PGA) {
							localshindo = "5-";
							localcolor = 'red';
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
						if(localshindo != "0"){
							let line = town_line[town_ID];
							//console.log(town_line[[town_ID]])
							console.log(town_line)
							eew_tw_shindo_list.push(L.geoJSON(line, { color:"#5B5B5B",fillColor: localcolor,weight:1,fillOpacity:1 }))
								
							
						}
						if(shindo2float(max_shindo)<shindo2float(localshindo)){
							max_shindo = localshindo;
						}
					}
				}
				eew_tw_shindo_list_layer = L.layerGroup(eew_tw_shindo_list).addTo(map);
				//震波圓
				console.log(2);
				let timestamp_now = Date.now();//現在的timestamp
				let elapsed = (timestamp_now - (eew_tw_timestamp)) / 1000;//timestamp差異

				let p_radius = Math.sqrt(Math.pow(6.5 * elapsed,2) - Math.pow(eew_tw_depth,2));//P半徑
				let s_radius = Math.sqrt(Math.pow(3.5 * elapsed,2) - Math.pow(eew_tw_depth,2));//s半徑
				if (s_radius <= 0){
					s_radius = 0;
				}
				//更新半徑
				eew_tw_Pcircle.setRadius(p_radius * 1000);
				eew_tw_Scircle.setRadius(s_radius * 1000);
				//更新座標
				eew_tw_Pcircle.setLatLng([eew_tw_lat,eew_tw_lon]);
				eew_tw_Scircle.setLatLng([eew_tw_lat,eew_tw_lon]);
				eew_tw_epicenter_icon.setLatLng([eew_tw_lat,eew_tw_lon]);
				
				//更新已顯示資料
				eew_tw_depth_displayed = eew_tw_depth;
				eew_tw_id_displayed = eew_tw_id;
				eew_tw_lat_displayed = eew_tw_lat;
				eew_tw_lon_displayed = eew_tw_lon;
				eew_tw_timestamp_displayed = eew_tw_timestamp;
				eew_tw_version_displayed = eew_tw_version;
			//原地震原報更新
			}else{
				//震波圓
				console.log(3);
				let timestamp_now = Date.now();//現在的timestamp
				let elapsed = (timestamp_now - (eew_tw_timestamp)) / 1000;//timestamp差異

				let p_radius = Math.sqrt(Math.pow(6.5 * elapsed,2) - Math.pow(eew_tw_depth,2));//P半徑
				let s_radius = Math.sqrt(Math.pow(3.5 * elapsed,2) - Math.pow(eew_tw_depth,2));//s半徑
				if (s_radius <= 0){
					s_radius = 0;
				}
				//更新半徑
				eew_tw_Pcircle.setRadius(p_radius * 1000);
				eew_tw_Scircle.setRadius(s_radius * 1000);
				//更新已顯示資料
				eew_tw_depth_displayed = eew_tw_depth;
				eew_tw_id_displayed = eew_tw_id;
				eew_tw_lat_displayed = eew_tw_lat;
				eew_tw_lon_displayed = eew_tw_lon;
				eew_tw_timestamp_displayed = eew_tw_timestamp;
				eew_tw_version_displayed = eew_tw_version;
			}
		}
		function pgaupdate(){
			if (XHR3.readyState == 4){
				if(XHR3.status ==200){
					if(enable_shindo != "false"){//only for app
						let stations_displayed = []
						let pga_list = XHR3.responseText;
						if(pga_list != '0'){
							pga_list = pga_list.split(';');
							for(i = 0;i < pga_list.length-1;i++){
								pga_list[i] = pga_list[i].split(',');
								let name = pga_list[i][0];
								let lat = parseFloat(pga_list[i][1]);
								let lon = parseFloat(pga_list[i][2]);
								let pga = parseFloat(pga_list[i][3]);
								let shindo = pga_list[i][7];
								let pga_origin = parseFloat(pga_list[i][5]);
								
								if (shindo == '0'){
									if (pga <= 1){
										iconURL = 'shindo_icon/pga0.png';
									}else if(pga <= 1.3){
										iconURL = 'shindo_icon/pga1.png';
									}else if(pga <=1.4 ){
										iconURL = 'shindo_icon/pga2.png';
									}else{
										iconURL = 'shindo_icon/pga3.png';
									}	
								}else{
									iconURL = 'shindo_icon/'+shindo+'.png';
								}
								let displayed = false;
								//更新圖標
								for(j = 0;j < stations.length;j++){
									if(stations[j][1] == name){
										console.log(stations[j]);
										let cusicon = L.icon({iconUrl : iconURL,iconSize : [10,10],});
										stations[j][0].setIcon(cusicon);
	
										displayed = true;
										stations_displayed.push([stations[j][0].setTooltipContent("<div>"+name+"</div><div>PGA(原始):"+pga_origin.toString()+"</div><div>PGA(濾波):"+pga.toString()+"</div><div>震度:"+shindo+"</div>"),name]);
										stations.splice(j,1);
										
									}
								}
								//新增圖標
								if(displayed == false){
									let cusicon = L.icon({iconUrl : iconURL,iconSize : [15,15],});
									let position = L.latLng(lat,lon);
									stations_displayed.push([new L.marker(position,{icon : cusicon,title : name,opacity : 1.0}).bindTooltip("<div>"+name+"</div><div>PGA(原始):"+pga_origin.toString()+"</div><div>PGA(濾波):"+pga.toString()+"</div><div>震度:"+shindo+"</div>",{offset:L.point(0, 8)}).addTo(map).on("click",function(e){
										let name = e.sourceTarget.options.title;
										selected_station = name;
										storage.setItem('selected_station',name);
										document.getElementById("selected_name").innerHTML = name;
									}),name]);
									console.log('新增:'+name);
								}
								//檢查是否被選取
								if(name == selected_station){
									document.getElementById("selected_pgao").innerHTML = pga_origin;
									document.getElementById("selected_pga").innerHTML = pga;
								}
								console.log(shindo2float(shindo))
								//檢查是否是最大震度
								if (shindo2float(shindo) > shindo2float(max_shindo)){
									max_shindo = shindo;
								}							
							}
							console.log(max_shindo);
							console.log(max_Shindo_before)
							if(shindo2float(max_shindo) > shindo2float(max_Shindo_before)){
								if(max_shindo == "1" && enable_shindo_sounds_1 != "false"){
									aud1.play();
								}else if(max_shindo == "2" && enable_shindo_sounds_2 != "false"){
									aud2.play();
								}else if(max_shindo == "3" && enable_shindo_sounds_3 != "false"){
									aud3.play();
								}else if(max_shindo == "4" && enable_shindo_sounds_4 != "false"){
									aud4.play();
								}else if(max_shindo == "5-" && enable_shindo_sounds_5j != "false"){
									aud5j.play();
								}else if(max_shindo == "5+" && enable_shindo_sounds_5k != "false"){
									aud5k.play();
								}else if(max_shindo == "6-" && enable_shindo_sounds_6j != "false"){
									aud6j.play();
								}else if(max_shindo == "6+" && enable_shindo_sounds_6k != "false"){
									aud6k.play();
								}else if(max_shindo == "7" && enable_shindo_sounds_7 != "false"){
									aud7.play();
								}
								max_Shindo_before = max_shindo;
							}
							if(max_shindo == "0"){
								max_Shindo_before = "0";
							}
							max_shindo = "0";
							console.log("max_shindo:"+max_Shindo_before);
						}
						//刪除剩下圖標
						for(j = 0;j < stations.length;j++){
							console.log(stations_displayed);
							console.log('刪除:');
							map.removeLayer(stations[j][0]);
							stations.splice(j,1);
						}
						stations = stations_displayed;
						console.log(stations);
						var station_count = String(stations_displayed.length);
						
						if(typeof(station_count) != "undefined"){
							let htmlText = "<p style='color:white'>目前共有"+station_count+"個測站上線</p>";
							document.getElementById('stations_count').innerHTML = htmlText;
						}
					}else{
						let htmlText = "<p style='color:white'>即時測站停用中</p>";
						document.getElementById('stations_count').innerHTML = htmlText;
					}
				}
			}			
		}
		function InfoUpdate_EXP()
		{
			if(XHR.readyState == 4)
			{
				if(XHR.status ==200)
				{
					if (true)
					{
						earthquakeInfo = XHR.responseText;
						earthquakeInfo = earthquakeInfo.split(';');
						let htmlText = "";
						let timechk = '';
						htmlText = '';
						let color = '';
						for(i = 0;i < earthquakeInfo.length-1;i++)
						{	
							result = earthquakeInfo[i].split(',');
							if(result[2] == '1')
							{
								color = 'gray';
							}
							else if(result[2] == '2')
							{
								color = '#0066CC';
							}
							else if(result[2] == '3')
							{
								color = 'green';
							}
							else if(result[2] == '4')
							{
								color = '#BAC000';
							}
							else if(result[2] == '5-')
							{
								color = 'red';
							}
							else if(result[2] == '5+')
							{
								color = 'red';
							}
							else if(result[2] == '6-')
							{
								color = 'brown';
							}
							else if(result[2] == '6+')
							{
								color = 'brown';
			 				}
							else if(result[2] == '7')
							{
								color = 'purple';
							}
							else
							{
								color = '#63AA8B';
							}
							
							timechk = result[4];//第10個報告的時間

							htmlText = htmlText + "<table border=0 cellpadding='1px' style='background-color:" + color + "' class='col-12 earthquake_report'><tr><td rowspan=3><p style='color:white;font-size:60px ' align='left' >" + result[2] + "</p></td><td colspan=2 ><h4 style='color:white' align='left'>" + result[0] + "</h3></td></tr><tr><td colspan=2 ><h6 style='color:white' align='left'>" + result[4] + "</h6></td></tr>"; 
							htmlText = htmlText + "<tr><td><h4 style='color:white' align='left'>" + result[1] + "</h5></td><td><h4 style='color:white' align='right'>"+result[3]+"</h5></td></tr>"
							htmlText = htmlText + '</table>';
						}
						htmlText = htmlText + "<div class='col-12'><h5 style='color:white'>資料來源:中央氣象局</h5><h5 style='color:white'>API提供:EXPTech探索科技</h5></div>";
						
						if (htmlText!='')
						{
							if (infoupchk != timechk && timechk != '')//以第一個報告的時間檢查資料是否有更新
							{
								console.log(timechk);
								infoupchk = timechk;
								document.getElementById("earthquakeInfo").innerHTML = htmlText;
							}
							
						}
						
					}
					//if(mode == 'eew')
					//{
						
					//}
					//if(mode == 'PGA')
					//{
					
					//}
				}
			}
		}
		function InfoUpdate_EXP_full()
		{
			if(XHR.readyState == 4)
			{
				if(XHR.status ==200)
				{
					if (true)
					{
						let earthquakeInfo = XHR.responseText;
						earthquakeInfo = earthquakeInfo.split(';');
						let htmlText = "";
						htmlText = '';
						let color = '';
						for(i = 0;i < earthquakeInfo.length-1;i++)
						{	
							result = earthquakeInfo[i].split(',');
							if(result[2] == '1')
							{
								color = 'gray';
							}
							else if(result[2] == '2')
							{
								color = '#0066CC';
							}
							else if(result[2] == '3')
							{
								color = 'green';
							}
							else if(result[2] == '4')
							{
								color = '#BAC000';
							}
							else if(result[2] == '5-')
							{
								color = 'red';
							}
							else if(result[2] == '5+')
							{
								color = 'red';
							}
							else if(result[2] == '6-')
							{
								color = 'brown';
							}
							else if(result[2] == '6+')
							{
								color = 'brown';
			 				}
							else if(result[2] == '7')
							{
								color = 'purple';
							}
							else
							{
								color = '#63AA8B';
							}
							
							htmlText = htmlText + "<table border=0 cellpadding='1px' style='background-color:" + color + "' class='col-12'><tr><td rowspan=3><p style='color:white;font-size:60px ' align='left' >" + result[2] + "</p></td><td colspan=2 ><h4 style='color:white' align='left'>" + result[0] + "</h3></td></tr><tr><td colspan=2 ><h6 style='color:white' align='left'>" + result[4] + "</h6></td></tr>"; 
							htmlText = htmlText + "<tr><td><h4 style='color:white' align='left'>" + result[1] + "</h5></td><td><h4 style='color:white' align='right'>"+result[3]+"</h5></td></tr>"
							htmlText = htmlText + '</table>';
							if(i == 0)
							{
								let timechk = result[4];//第一個報告的時間
							}
						}
						htmlText = htmlText + "<div class='col-12'><h4 style='color:white'>資料來源:EXPTech探索科技</h4></div>"
						if (htmlText!='')
						{
							if (infoupchk != timechk)//以第一個報告的時間檢查資料是否有更新
							{
								infoupchk = timechk;
								document.getElementById("earthquakeInfo").innerHTML = htmlText;
							}
							
						}
						
					}
					//if(mode == 'eew')
					//{
						
					//}
					//if(mode == 'PGA')
					//{
					
					//}
				}
			}
		}

		function weatherWarning(){
			if(XHR5.readyState == 4)
			{
				if(XHR5.status ==200)
				{
					if (enable_weather != "false")
					{
						//let weather_warning_lines_displayed = [];
						//for(i=0;i<weather_warning_lines.length;i++){
							//map.removeLayer(weather_warning_lines[i]);
						//}
						weather_warning_layers.clearLayers();
						let warnings = XHR5.responseText;
						warnings = JSON.parse(warnings);
						for(i=0;i<warnings.length;i++){
							let name = warnings[i]["name"];
							let lat = locations["country"][name]["lat"];
							let lon = locations["country"][name]["lon"];
							let rain = warnings[i]["rain"];
							let heavy_rain = warnings[i]["heavy_rain"];
							let super_heavy_rain = warnings[i]["super_heavy_rain"];
							let extreme_heavy_rain = warnings[i]["extreme_heavy_rain"];
							let foggy = warnings[i]["foggy"];
							let wind = warnings[i]["wind"];
							if(!(rain == 0 && heavy_rain == 0 && super_heavy_rain == 0 && extreme_heavy_rain == 0 && foggy == 0 && wind == 0)){
								let popupContent = "<p>"+name + "</p>";
								if(rain != 0){
									popupContent = popupContent + "<p>大雨特報</p>";
								}
								if(heavy_rain != 0){
									popupContent = popupContent + "<p>豪雨特報</p>";
								}
								if(super_heavy_rain != 0){
									popupContent = popupContent + "<p>大豪雨特報</p>";
								}
								if(extreme_heavy_rain != 0){
									popupContent = popupContent + "<p>超大豪雨特報</p>";
								}
								if(foggy != 0){
									popupContent = popupContent + "<p>濃霧特報</p>";
								}
								if(wind != 0){
									popupContent = popupContent + "<p>陸上強風特報</p>";
								}
								
  								weather_warning_layers.addLayer(L.geoJSON(geojson_list[name], { color: "yellow",width:2,fillOpacity: 0 }).bindPopup(popupContent));
							}
						}
						
					}
				}
			}
		}
		function TsunamiUpdate(){
			if(XHR_tsunami.readyState == 4)
			{
				if(XHR_tsunami.status ==200)
				{	
					if(enable_tsunami != "false"){
						let type = "";
						let color = "";
						let content = "";
						let tsunamiInfo = XHR_tsunami.responseText;
						tsunamiInfo = JSON.parse(tsunamiInfo);
						let tsunamireport = tsunamiInfo["report"];
						let timestamp = parseFloat(tsunamireport[0]["timestamp"]);
						if ((Date.now()/1000)-timestamp <= 172800) {
							
							type = tsunamireport[0]["type"];
							content = tsunamireport[0]["content"];
						}else{
							type = "目前沒有海嘯相關資訊";
							content = "無";

						}
						document.getElementById("tsunami_status").innerHTML = type;
						document.getElementById("tsunami_content").innerHTML = content;
					}
					

				}
			}
		}
		function typhoon_update(){
			if(XHR_typhoon.readyState == 4)
			{
				if(XHR_typhoon.status ==200)
				{	
					if(enable_typhoon != "false"){
						let typhoon_layer_list = []
						let typhooninfo = XHR_typhoon.responseText;
						typhooninfo = JSON.parse(typhooninfo);
						typhoon_layer.clearLayers();
						for(i = 0;i<typhooninfo.length;i++){
							let name = typhooninfo[i]["name"];
							let cwbname = typhooninfo[i]["cwbname"];
							let route = typhooninfo[i]["route"];
							let routeline = []
							let future = false;
							for(j = 0;j<route.length;j++){	
								let circleColor = '#5A5AAD';
								let lat = route[j]["lat"];
								let lon = route[j]["lon"];
								let time = route[j]["time"];
								let radius = null;
								let radius_15 = route[j]["circleof15ms_radius"];
								let radius_70p = route[j]["radiusof70percentprobability"];
								let windspeed = route[j]["windspeed"];
								let gustspeed = route[j]["gustspeed"];
								let popupContent = "";
								radius = radius_15;
								if(cwbname == "0"){
									popupContent = "<p>熱低壓</p>";
								}else{
									popupContent = "<p>颱風 "+cwbname+"</p>";
								}
								
								let movpred = route[j]["movingprediction"];
								if (future || radius_70p != "0"){
									popupContent = popupContent + "<p>未來預測</p><p>風速"+windspeed+"m/s</p><p>陣風"+gustspeed+"m/s</p>";
									circleColor = "gray";
									radius = radius_70p;
								}
								else if (movpred != "0"){
									popupContent = popupContent + "<p>"+time+"[最新位置]</p><p>風速"+windspeed+"m/s</p><p>陣風"+gustspeed+"m/s</p>";
									circleColor = "orange";
									future = true;
									let tyicon = L.icon({iconUrl: 'shindo_icon/typhoon.png',iconSize: [20, 20]});
									typhoon_layer.addLayer(L.marker([lat, lon],{icon:tyicon}).bindPopup(popupContent));
								
								}else{
									popupContent = popupContent + "<p>"+time+"</p><p>風速"+windspeed+"m/s</p><p>陣風"+gustspeed+"m/s</p>";
									if(enable_ty_analysis == "false"){
										radius = 0;
									}
								}
								
								let typhoon_circle = L.circle([lat,lon],{color : circleColor , radius:radius*1000}).bindPopup(popupContent);
								routeline.push([lat,lon]);
								typhoon_layer.addLayer(typhoon_circle);
							}
							typhoon_layer.addLayer(L.polyline(routeline, {color: 'white',weight: 1}));
						}
						//map.removeLayer(typhoon_layer);
						
						//typhoon_layer = null;
						//typhoon_layer = L.layerGroup(typhoon_layer_list).addTo(map);
					}
				}
			}
		}
		function othersUpdate(){
			if(XHR_others.readyState == 4)
			{
				if(XHR_others.status ==200)
				{
					let othersInfo = XHR_others.responseText;

				}
			}
		}
		function getVersion(){
			if(XHR_ver.readyState == 4)
			{
				if(XHR_ver.status ==200)
				{
					let newver = XHR_ver.responseText;
					let ver = "1.0.0-pre6";
					newver = newver.substring(0, newver.length - 2);
					console.log(newver)
					console.log(ver)
					console.log(newver.length)
					console.log(ver.length)
					if(newver != ver){
						document.getElementById("ver").innerHTML = "<p style='color:white;position:absolute;right:0;bottom: 0;margin-bottom: 0;' onclick='downnewver()'>有新版本可用!請點擊此處下載更新版</p>";
					}else{
						document.getElementById("ver").innerHTML = "<p style='color:white;position:absolute;right:0;bottom: 0;margin-bottom: 0;'>目前為最新版本</p>";
					}

				}
			}
		}
		function downnewver(){
			shell.openExternal("http://rexisstudio.tplinkdns.com:8787/downloads/RF-monitor.exe");
		}
		
		//function palert(){

		//}
		function update()
		{
			
			
			if(count % 10 == 0){
				//地震速報jp
				XHR2.open('GET','http://rexisstudio.tplinkdns.com:8787/eew.txt',true);
				XHR2.onreadystatechange = eewupdate;
				XHR2.send(null);
				//即時震度
				XHR3.open('GET','http://rexisstudio.tplinkdns.com:8787/getPGA.php',true);
				XHR3.onreadystatechange = pgaupdate;
				XHR3.send(null);
				//地震速報tw
				XHR4.open('GET','http://rexisstudio.tplinkdns.com:8787/cgi-bin/get_TWEEW.py',true);
				XHR4.onreadystatechange = eewupdate_tw;
				XHR4.send(null);
				//tw_eew_shindo();
			}
			//地震報告
			if (count % 100 == 0){
				//地震報告
				XHR.open('GET','http://rexisstudio.tplinkdns.com:8787/cgi-bin/get_EarthquakeReport.py',true);
				XHR.onreadystatechange = InfoUpdate_full;
				XHR.send(null);
				//檢查更新
				XHR_ver.open('GET','http://rexisstudio.tplinkdns.com:8787/cgi-bin/get_version.py',true);
				XHR_ver.onreadystatechange = getVersion;
				XHR_ver.send(null);
			}
			if (count == 0){
				//海嘯
				XHR_tsunami.open('GET','http://rexisstudio.tplinkdns.com:8787/cgi-bin/get_tsunami.py',true);
				XHR_tsunami.onreadystatechange = TsunamiUpdate;
				XHR_tsunami.send(null);
				//天氣特報
				XHR5.open('GET','http://rexisstudio.tplinkdns.com:8787/cgi-bin/get_weather_warning.py',true);
				XHR5.onreadystatechange = weatherWarning;
				XHR5.send(null);
				//颱風
				XHR_typhoon.open('GET','http://rexisstudio.tplinkdns.com:8787/cgi-bin/get_typhoon.py',true);
				XHR_typhoon.onreadystatechange = typhoon_update;
				XHR_typhoon.send(null);
				//其他
				//XHR_others.open('GET','http://rexisstudio.tplinkdns.com:8787/cgi-bin/get_others.py',true);
				//XHR_others.onreadystatechange = othersUpdate;
			}
			//地震速報JP circle
			jp_eew_circle()
			tw_eew_circle()
			
			//if(count % 10 == 0){
				
			//}
			count++;
			if(count == 600){
				count = 0;
			}	
			
		}

		
		
	