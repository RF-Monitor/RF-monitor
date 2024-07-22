eew_hand="1110295,2,宜蘭縣 外海,7.5,50,不明,1668010873000,122.51,24.66"
/*
const path = require('path');
const { shell } = require('electron');
const storage = require('electron-localstorage');
const { resolve } = require('path');
let ipcRenderer = require('electron').ipcRenderer;
const { setFdLimit, disconnect } = require('process');
const { Serializer } = require('v8');
const bytenode = require("bytenode");
//const crypto = require('crypto');
*/


server = false;
//套用設定參數
userlat = parseFloat(storage.getItem('userlat'));
userlon = parseFloat(storage.getItem('userlon'));
enable_weather = storage.getItem('enable_weather');
enable_typhoon = storage.getItem('enable_typhoon');
enable_tsunami = storage.getItem('enable_tsunami');
enable_shindo = storage.getItem('enable_shindo');
enable_eew_jp = storage.getItem('enable_eew_jp');
enable_eew_tw = storage.getItem('enable_eew_tw');
enable_RFPLUS = storage.getItem("enable_RFPLUS");
enable_window_popup = storage.getItem("enable_window_popup");
enable_ty_analysis = storage.getItem("enable_ty_analysis");
enable_eew_tw_read = storage.getItem("enable_eew_tw_read");
enable_notification = storage.getItem("enable_notification");
enable_warningArea = storage.getItem('enable_warningArea');
enable_wave = storage.getItem('enable_wave');
PGA_warn_only = storage.getItem('PGA_warn_only');
local_only = storage.getItem("local_only");
opacity_ = storage.getItem('opacity');
selected_station = storage.getItem('selected_station');
document.querySelector(".left").style.opacity = opacity_;
document.querySelector(".right").style.opacity = opacity_;
document.querySelector(".max_shindo").style.opacity = opacity_;
document.querySelector(".selected").style.opacity = opacity_;
document.querySelector(".sta_count").style.opacity = opacity_;
document.querySelector(".time_now").style.opacity = opacity_;
server_url = storage.getItem('server_url');
ws_server_url = storage.getItem('ws_server_url');
webhook_url_shindo_sokuho = storage.getItem('webhook_url_shindo_sokuho')
webhook_header_shindo_sokuho = storage.getItem('webhook_header_shindo_sokuho')
webhook_url_TW_EEW = storage.getItem('webhook_url_TW_EEW')
webhook_text_TW_EEW = storage.getItem('webhook_text_TW_EEW')
//自動調整伺服器url
//

//----------震度音效設定參數----------//
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

//websocket即時資訊 全域
eew_tw_ws = "";
eew_jp_ws = "";
var report = "";

//eew狀態全域
EEW_TW_ing = false;

//EEWsim
ipcRenderer.on('EEWsim', (event, data) => {
	eew_tw_p2p = data;
});

//----------海岸線名稱對照----------//
tsunami_coastline_height = {
	"北部沿海地區":"tsunami_north_height",
	"東北沿海地區":"tsunami_northeast_height",
	"東南沿海地區":"tsunami_southeast_height",
	"東部沿海地區":"tsunami_east_height",
	"海峽沿海地區":"tsunami_mid_height",
	"西南沿海地區":"tsunami_southwest_height"
}
tsunami_coastline_time = {
	"北部沿海地區":"tsunami_north_time",
	"東北沿海地區":"tsunami_northeast_time",
	"東南沿海地區":"tsunami_southeast_time",
	"東部沿海地區":"tsunami_east_time",
	"海峽沿海地區":"tsunami_mid_time",
	"西南沿海地區":"tsunami_southwest_time"
}

//----------震度變數----------//
eew_tw_shindo_list = [];
max_shindo_eew = "0";//速報最大震度
max_shindo = "0";//最大震度
max_shindo_local = "0";//本地模式最大震度
max_Shindo_before = "0";//上一次最大震度
max_shindo_local_before = "";//本地模式 上一次最大震度
RF_stations = {}//測站列表
/*
{
	"6050_0007":{
		"cname":"新竹縣 竹北市";
		"name":"Zhubei_Rexi"
	}
}
*/ 
RF_alert_area_flash_controller = true;//警報範圍閃爍
RF_alert_list = [];//觸發測站列表
RF_shindo_sokuho_list = [];//震度速報列表
/*
"id","name","cname","shindo"
*/
RFPLUS_list = [];

//----------波型canvas----------//
Canvas1Sta=storage.getItem('Canvas1Sta')
Canvas2Sta=storage.getItem('Canvas2Sta')
Canvas3Sta=storage.getItem('Canvas3Sta')
Canvas4Sta=storage.getItem('Canvas4Sta')

//----------波型list----------//
wave_list = []//顯示波型列表
//wave_list=[{id : id,wave : [{x : 1 , y : 1 , z : 1 , unixTimestamp : 1},{x : 1 , y : 1 , z : 1 , unixTimestamp : 1}]} , {id : id,wave : [{x : 1 , y : 1 , z : 1 , unixTimestamp : 1},{x : 1 , y : 1 , z : 1 , unixTimestamp : 1}]}]
wave_list = [{'id':Canvas1Sta,wave : [],'motion':'x'},{'id':Canvas2Sta,wave : [],'motion':'x'},{'id':Canvas3Sta,wave : [],'motion':'x'},{'id':Canvas4Sta,wave : [],'motion':'x'}]
console.log(wave_list)

//----------震度配色----------//
shindo_color = {
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

//----------音效----------//
aud1 = new Audio("./audio/tw/shindo/1.mp3");
aud2 = new Audio("./audio/tw/shindo/2.mp3");
aud3 = new Audio("./audio/tw/shindo/3.mp3");
aud4 = new Audio("./audio/tw/shindo/4.mp3");
aud5j = new Audio("./audio/tw/shindo/5-.mp3");
aud5k = new Audio("./audio/tw/shindo/5+.mp3");
aud6j = new Audio("./audio/tw/shindo/6-.mp3");
aud6k = new Audio("./audio/tw/shindo/6+.mp3");
aud7 = new Audio("./audio/tw/shindo/7.mp3");

//震度圖標
shindo_icons = {
	"1":L.icon({iconUrl:"./shindo_icon/1.png",iconSize:[20,20]}),
	"2":L.icon({iconUrl:"./shindo_icon/2.png",iconSize:[20,20]}),
	"3":L.icon({iconUrl:"./shindo_icon/3.png",iconSize:[20,20]}),
	"4":L.icon({iconUrl:"./shindo_icon/4.png",iconSize:[20,20]}),
	"5-":L.icon({iconUrl:"./shindo_icon/5-.png",iconSize:[20,20]}),
	"5+":L.icon({iconUrl:"./shindo_icon/5+.png",iconSize:[20,20]}),
	"6-":L.icon({iconUrl:"./shindo_icon/6-.png",iconSize:[20,20]}),
	"6+":L.icon({iconUrl:"./shindo_icon/6+.png",iconSize:[20,20]}),
	"7":L.icon({iconUrl:"./shindo_icon/7.png",iconSize:[20,20]})
}

//XHR初始化
var XHR = createXHR();//Info
var XHR2 = createXHR();//jp EEW
var XHR3 = createXHR();//PGA
var XHR4 = createXHR();//TW EEW
var XHR5 = createXHR();//天氣特報
var XHR_infoDistributed = createXHR();
var XHR_tsunami = createXHR();
var XHR_typhoon = createXHR();
var XHR_others = createXHR();
var XHR_ver = createXHR();
var XHR_ntp = createXHR();

//時間差值(毫秒)
ntpoffset_ = 0;


//send_webhook(webhook_url_shindo_sokuho,"RF震度速報(測試)\n測試點1 4\n測試點2 3\n");

/*----------播放音效----------*/
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
/*----------PGA轉震度----------*/
function PGA2shindo(PGA){
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
Date.prototype.format = function (fmt) {
	var o = {
	  "M+": this.getMonth() + 1, //月份
	  "d+": this.getDate(), //日
	  "h+": this.getHours(), //小時
	  "m+": this.getMinutes(), //分
	  "s+": this.getSeconds(), //秒
	  "q+": Math.floor((this.getMonth() + 3) / 3), //季度
	  "S": this.getMilliseconds() //毫秒
	};
	if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
	for (var k in o)
	if (new RegExp("(" +  k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" +  o[k]).substr(("" + o[k]).length)));
	return fmt;
  }
  
  Date.prototype.addSeconds = function(seconds) {
	this.setSeconds(this.getSeconds() + seconds);
	return this;
  }
  
  Date.prototype.addMinutes = function(minutes) {
	this.setMinutes(this.getMinutes() + minutes);
	return this;
  }
  
  Date.prototype.addHours = function(hours) {
	this.setHours(this.getHours() + hours);
	return this;
  }
  
  Date.prototype.addDays = function(days) {
	this.setDate(this.getDate() + days);
	return this;
  }
  
  Date.prototype.addMonths = function(months) {
	this.setMonth(this.getMonth() + months);
	return this;
  }
  
  Date.prototype.addYears = function(years) {
	this.setFullYear(this.getFullYear() + years);
	return this;
  }
  
  function diffSeconds(milliseconds) {
	return Math.floor(milliseconds / 1000);
  }
  
  function diffMinutes(milliseconds) {
	return Math.floor(milliseconds / 1000 / 60);
  }
  
  function diffHours(milliseconds) {
	return Math.floor(milliseconds / 1000 / 60 / 60);
  }
  
  function diffDays(milliseconds) {
	return Math.floor(milliseconds / 1000 / 60 / 60 / 24);
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
						earthquakeInfo = JSON.parse(earthquakeInfo)
						
						let htmlText = "";
						htmlText = '';
						let color = '';
						
						for(i = 0;i < earthquakeInfo.length;i++)
						{	
							let id = earthquakeInfo[i]["id"];
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
								color = '#FF7F27';
							}
							else if(earthquakeInfo[i]["max_shindo"] == '5+')
							{
								color = '#ED1C24';
							}
							else if(earthquakeInfo[i]["max_shindo"] == '6-')
							{
								color = 'red';
							}
							else if(earthquakeInfo[i]["max_shindo"] == '6+')
							{
								color = '#A50021';
			 				}
							else if(earthquakeInfo[i]["max_shindo"] == '7')
							{
								color = 'purple';
							}
							else
							{
								color = '#63AA8B';
							}
							let url = earthquakeInfo[i]["URL"]
							htmlText = htmlText + "<table id='"+id+"' onclick='' border=0 cellpadding='0px' style='background-color:" + color + "' class='earthquake_report'><tr><td rowspan=3><p style='color:white;font-size:60px ' align='left' >" + earthquakeInfo[i]["max_shindo"] + "</p></td><td colspan=2 ><h4 style='color:white' align='left'>" + earthquakeInfo[i]["epicenter"] + "</h4></td></tr><tr><td colspan=2 ><h6 style='color:white' align='left'>" + earthquakeInfo[i]["datetime"] + "</h6></td></tr>"; 
							htmlText = htmlText + "<tr><td><h4 style='color:white' align='left'>" + earthquakeInfo[i]["magnitude"] + "</h4></td><td><h4 style='color:white' align='right'>"+earthquakeInfo[i]["depth"]+"</h4></td></tr>"
							htmlText = htmlText + '</table>';
						}
						if (htmlText!='')
						{
							document.getElementById("earthquakeInfo").innerHTML = htmlText;
							
						}
						for(i = 0;i < earthquakeInfo.length;i++)
						{	
							let id = earthquakeInfo[i]["id"];
							document.getElementById(id).onclick=function(){
								infoDistributed(id);
							};
						}
						
					}
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
						earthquakeInfo = JSON.parse(earthquakeInfo)
						
						let htmlText = "";
						htmlText = '';
						let color = '';
						
						for(i = 0;i < earthquakeInfo.length;i++)
						{	
							let id = earthquakeInfo[i]["id"];
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
								color = '#FF7F27';
							}
							else if(earthquakeInfo[i]["max_shindo"] == '5+')
							{
								color = '#ED1C24';
							}
							else if(earthquakeInfo[i]["max_shindo"] == '6-')
							{
								color = 'red';
							}
							else if(earthquakeInfo[i]["max_shindo"] == '6+')
							{
								color = '#A50021';
			 				}
							else if(earthquakeInfo[i]["max_shindo"] == '7')
							{
								color = 'purple';
							}
							else
							{
								color = '#63AA8B';
							}
							let url = earthquakeInfo[i]["URL"]
							htmlText = htmlText + "<table id='"+id+"' onclick='' border=0 cellpadding='0px' style='background-color:" + color + "' class='earthquake_report'><tr><td rowspan=3><p style='color:white;font-size:60px ' align='left' >" + earthquakeInfo[i]["max_shindo"] + "</p></td><td colspan=2 ><h4 style='color:white' align='left'>" + earthquakeInfo[i]["epicenter"] + "</h4></td></tr><tr><td colspan=2 ><h6 style='color:white' align='left'>" + earthquakeInfo[i]["datetime"] + "</h6></td></tr>"; 
							htmlText = htmlText + "<tr><td><h4 style='color:white' align='left'>" + earthquakeInfo[i]["magnitude"] + "</h4></td><td><h4 style='color:white' align='right'>"+earthquakeInfo[i]["depth"]+"</h4></td></tr>"
							htmlText = htmlText + '</table>';
						}
						if (htmlText!='')
						{
							document.getElementById("earthquakeInfo").innerHTML = htmlText;
							
						}
						for(i = 0;i < earthquakeInfo.length;i++)
						{	
							let id = earthquakeInfo[i]["id"];
							document.getElementById(id).onclick=function(){
								infoDistributed(id);
							};
						}
					}
				}
			}
		}

		function InfoUpdate_full_ws(earthquakeInfo)
		{
			if(true)
			{
				if(true)
				{
					if (true)
					{
						//let earthquakeInfo = XHR.responseText;
						earthquakeInfo = JSON.parse(earthquakeInfo)
						
						let htmlText = "";
						htmlText = '';
						let color = '';
						
						for(i = 0;i < earthquakeInfo.length;i++)
						{	
							let id = earthquakeInfo[i]["id"];
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
								color = '#FF7F27';
							}
							else if(earthquakeInfo[i]["max_shindo"] == '5+')
							{
								color = '#ED1C24';
							}
							else if(earthquakeInfo[i]["max_shindo"] == '6-')
							{
								color = 'red';
							}
							else if(earthquakeInfo[i]["max_shindo"] == '6+')
							{
								color = '#A50021';
			 				}
							else if(earthquakeInfo[i]["max_shindo"] == '7')
							{
								color = 'purple';
							}
							else
							{
								color = '#63AA8B';
							}
							let url = earthquakeInfo[i]["URL"]
							htmlText = htmlText + "<table id='"+id+"' onclick='' border=0 cellpadding='0px' style='background-color:" + color + "' class='earthquake_report'><tr><td rowspan=3><p style='color:white;font-size:60px ' align='left' >" + earthquakeInfo[i]["max_shindo"] + "</p></td><td colspan=2 ><strong><h4 style='color:white' align='left'>" + earthquakeInfo[i]["epicenter"] + "</strong></b></td></tr><tr><td colspan=2 ><h6 style='color:white' align='left'>" + earthquakeInfo[i]["datetime"] + "</h6></td></tr>"; 
							htmlText = htmlText + "<tr><td><h4 style='color:white' align='left'><strong>" + earthquakeInfo[i]["magnitude"] + "</strong></h4></td><td><h4 style='color:white' align='right'>"+earthquakeInfo[i]["depth"]+"</h4></td></tr>"
							htmlText = htmlText + '</table>';
						}
						if (htmlText!='')
						{
							document.getElementById("earthquakeInfo").innerHTML = htmlText;
							
						}
						for(i = 0;i < earthquakeInfo.length;i++)
						{	
							let id = earthquakeInfo[i]["id"];
							document.getElementById(id).onclick=function(){
								infoDistributed(id);
							};
						}
						
					}
				}
			}
		}

		/*----------震度分佈----------*/
		function infoDistributed(id){
			id = id.replace("-","")
			console.log(id);
			//XHR_infoDistributed.open('POST',server_url+':8080/cgi-bin/getDistributed.py',true);
			XHR_infoDistributed.open('GET',server_url+":8787/reportDistribution?id=" + id,true)
			XHR_infoDistributed.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
			XHR_infoDistributed.onreadystatechange = function(){
				if(XHR_infoDistributed.readyState == 4){
					if(XHR_infoDistributed.status == 200){
						distributedLayer.clearLayers();
						distributedLayer = null;
						distributedLayer = L.layerGroup();
						//json資料處理
						let info = XHR_infoDistributed.responseText;
						console.log(info);
						info = JSON.parse(info);
						//右側地震報告 資料
						let cwbno = info["info"]["cwbNo"];
						let epicenter = info["info"]["epicenter"];
						let epicenter_lat = info["info"]["lat"];//float
						let epicenter_lon = info["info"]["lon"];//float
						let datetime = info["info"]["datetime"];
						let magnitude = info["info"]["magnitude"];
						let max_shindo = info["info"]["max_shindo"];
						let depth = info["info"]["depth"];
						let max_shindo_color = "0";
						max_shindo_color = shindo_color[max_shindo]
						let epicenter_icon = L.icon({iconUrl:"./shindo_icon/epicenter_tw.png",iconSize:[30,30]});
						let epicenter_marker = L.marker([epicenter_lat,epicenter_lon],{icon : epicenter_icon,title : epicenter,opacity : 1.0});
						epicenter_marker.addTo(distributedLayer)
						//震度分布
						for(let i = 0;i<info["distributed"].length;i++){
							let name = info["distributed"][i]["name"];
							let lat = info["distributed"][i]["lat"];
							let lon = info["distributed"][i]["lon"];
							let shindo = info["distributed"][i]["shindo"];
							let pga_ew = info["distributed"][i]["pga_ew"];
							let pga_ns = info["distributed"][i]["pga_ns"];
							let pga_v = info["distributed"][i]["pga_v"];
							let pga =info["distributed"][i]["pga_sum"];
							let pgv_ew = info["distributed"][i]["pgv_ew"];
							let pgv_ns = info["distributed"][i]["pgv_ns"];
							let pgv_v = info["distributed"][i]["pgv_v"];
							let pgv = info["distributed"][i]["pgv_sum"];
							let shindo_icon = shindo_icons[shindo];
							//let shindo_icon = L.icon({iconUrl:"./shindo_icon/" + shindo + ".png",iconSize:[15,15]});
							let tooltip = "<div>"+name.toString()+"</div><div>震度:"+shindo+"</div><div>PGA:"+pga.toString()+"</div><div>PGV:"+pgv.toString()+"</div>";
							let shindopane = "shindo_icon_" + shindo
							let marker = L.marker([lat,lon],{icon : shindo_icon,title : name,opacity : 1.0,pane:shindopane}).bindTooltip(tooltip);
							marker.addTo(distributedLayer)
						}
						//右側地震報告
						document.getElementById("epitime").innerHTML = datetime;
						document.getElementById("epicenter").innerHTML = epicenter;
						document.getElementById("lat").innerHTML = epicenter_lat;
						document.getElementById("lon").innerHTML = epicenter_lon;
						document.getElementById("magnitude").innerHTML = magnitude;
						document.getElementById("depth").innerHTML = depth;
						document.getElementById("shindo").innerHTML = max_shindo;
						/*
						if(max_shindo_color != "0"){
							document.getElementById("shindo").style.color = max_shindo_color
						}
						*/
						//移動地圖
						
						//顯示地圖
						/*document.querySelector(".map_shakingArea").style.height = "100%";
						document.querySelector(".backToMap").style.display = "block";*/
						document.querySelector(".report_discription").style.display = "block";
						//distributedLayer.addTo(map_shakingArea);
						//map_shakingArea.panTo([epicenter_lat,epicenter_lon]);
						//map_shakingArea.invalidateSize(true);
						distributedLayer.addTo(map2);
						map2.panTo([epicenter_lat,epicenter_lon]);
						map2.invalidateSize(true);
					}
				}
			};
			XHR_infoDistributed.send();
		}

		function backToMap(){
			
			map_shakingArea.invalidateSize(false);
			//隱藏地圖
			document.querySelector(".map_shakingArea").style.height = "0px";
			document.querySelector(".backToMap").style.display = "none";
			document.querySelector(".report_discription").style.display = "none";
			//右側地震報告
			document.getElementById("epitime").innerHTML = "";
			document.getElementById("epicenter").innerHTML = "";
			document.getElementById("lat").innerHTML = "";
			document.getElementById("lon").innerHTML = "";
			document.getElementById("magnitude").innerHTML = "";
			document.getElementById("depth").innerHTML = "";
			document.getElementById("shindo").innerHTML = "";

			distributedLayer.setView([23.550219, 120.924610], 7);
			//map_shakingArea.panTo([epicenter_lat,epicenter_lon]);
		}

		/*----------JP EEW check----------*/
		function eewupdate_jp_ws()
		{
			if (true){
				if(true){
					if(enable_eew_jp != "false"){//only for app////////////////////////////////////
						let eew = eew_jp_ws;
						eew = eew.split(',');
						let id = '';
						let version = '';
						let epicenter = '';
						let magnitude = '';
						let depth = '';
						let shindo = '0';
						let timestamp = 0;
						let lat = 0;
						let lon = 0;
						let status_color = '#0000E3';
						let main_color = 'blue';
						let status = '';
						let status_box = null;
						let mainbox = null;

						if(true)
						{
							//沒地震
							if(eew == '')//eew == '0'
							{
								status_color = '#3c3c3c';
								main_color = 'blue';
								epicenter = '-';
								magnitude = 'M-';
								depth = '-km';
								status = '目前沒有地震速報';
								//隱藏速報資訊欄
								document.querySelector('.eew_jp_main_box').style.display = "none";
								document.querySelector('.eew_jp_status_box').style.borderBottomLeftRadius = "7px";
								document.querySelector('.eew_jp_status_box').style.borderBottomRightRadius = "7px";
								document.getElementById("eew_jp_maxshindo").src="shindo_icon/selected/0.png";
							}
							//有地震
							else
							{
								timestamp = eew[6];
								let timestamp_now = Date.now()+ntpoffset_;
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
									//報數回朔校正
									if(eew_jp_version!="" && parseInt(version) <= parseInt(eew_jp_version)){
										lat = eew_jp_lat.toString()
										lon = eew_jp_lon.toString()
										depth = eew_jp_depth.toString()+"km";
										timestamp = eew_jp_timestamp.toString();
										id = eew_jp_id;
										version = eew_jp_version;
										epicenter = eew_jp_epicenter;
										magnitude = eew_jp_magnitude;
										shindo = eew_jp_shindo;
									}
									
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
									//顯示速報資訊欄
									document.querySelector('.eew_jp_main_box').style.display = "flex";
									document.querySelector('.eew_jp_status_box').style.borderBottomLeftRadius = "0px";
									document.querySelector('.eew_jp_status_box').style.borderBottomRightRadius = "0px";
									status = '緊急地震速報(第'+version+'報)';
								}else{
									status_color = '#3c3c3c';
									main_color = 'blue';
									epicenter = '-';
									magnitude = 'M-';
									depth = '-km';
									status = '目前沒有地震速報';
									//隱藏速報資訊欄
									document.querySelector('.eew_jp_main_box').style.display = "none";
									document.querySelector('.eew_jp_status_box').style.borderBottomLeftRadius = "7px";
									document.querySelector('.eew_jp_status_box').style.borderBottomRightRadius = "7px";
									document.getElementById("eew_jp_maxshindo").src="shindo_icon/selected/0.png";
								}
							}
							status_box = document.querySelector('.eew_jp_status_box');
							status_box.style.backgroundColor = status_color;
							shindo = shindo.replace("強","+");
							shindo = shindo.replace("弱","-");
							document.getElementById("eew_jp_maxshindo").src="shindo_icon/selected/"+shindo+".png";
							//main_box = document.querySelector('.eew_jp_main_box');
							//main_box.style.backgroundColor = main_color;
							//document.getElementById("eew_tw_maxshindo").src="shindo_icon/selected/0.png";
							//主格
							document.getElementById("eew_jp_status").innerHTML = status;
							document.getElementById("eew_jp_epicenter").innerHTML = epicenter;
							document.getElementById("eew_jp_time").innerHTML = new Date(parseInt(timestamp)).format("yyyy-MM-dd hh:mm:ss");
							document.getElementById("eew_jp_magnitude").innerHTML = "M"+magnitude;
							document.getElementById("eew_jp_depth").innerHTML = depth;
							
							//全域資料
							eew_jp_lat = parseFloat(lat);
							eew_jp_lon = parseFloat(lon);
							eew_jp_depth = parseInt(depth.replace('km',''));
							eew_jp_timestamp = parseInt(timestamp);
							eew_jp_id = id;
							eew_jp_version = version;
							eew_jp_epicenter = epicenter;
							eew_jp_magnitude = magnitude;
							eew_jp_shindo = shindo;
						}
					}
				}
			}
		}
		/*----------JP EEW renderer----------*/
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
				let timestamp_now = Date.now()+ntpoffset_;//現在的timestamp
				//let elapsed = (timestamp_now - (eew_jp_timestamp - 3600000)) / 1000;//timestamp差異
				let elapsed = (timestamp_now - (eew_jp_timestamp)) / 1000;
				let p_radius = Math.sqrt(Math.pow(6.5 * elapsed,2) - Math.pow(eew_jp_depth,2));//P半徑
				let s_radius = Math.sqrt(Math.pow(3.5 * elapsed,2) - Math.pow(eew_jp_depth,2));//s半徑
				if (s_radius <= 0 || isNaN(s_radius)){
					s_radius = 0.001;
				}
				if (p_radius <= 0 || isNaN(p_radius)){
					p_radius = 0.001;
				}
				//顯示circle和震央
				eew_jp_Pcircle = L.circle([eew_jp_lat,eew_jp_lon],{color : 'blue' , radius:p_radius*1000, fill : false,pane:"wave_layer"}).addTo(map);
				eew_jp_Scircle = L.circle([eew_jp_lat,eew_jp_lon],{color : 'red' , radius:s_radius*1000,pane:"wave_layer"}).addTo(map);
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
			}else if(eew_jp_version != '' && eew_jp_version != eew_jp_version_displayed ){
				console.log(2);
				let timestamp_now = Date.now()+ntpoffset_;//現在的timestamp
				//let elapsed = (timestamp_now - (eew_jp_timestamp - 3600000)) / 1000;//timestamp差異
				let elapsed = (timestamp_now - (eew_jp_timestamp)) / 1000;
				let p_radius = Math.sqrt(Math.pow(6.5 * elapsed,2) - Math.pow(eew_jp_depth,2));//P半徑
				let s_radius = Math.sqrt(Math.pow(3.5 * elapsed,2) - Math.pow(eew_jp_depth,2));//s半徑
				if (s_radius <= 0 || isNaN(s_radius)){
					s_radius = 0.001;
				}
				if (p_radius <= 0 || isNaN(p_radius)){
					p_radius = 0.001;
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
				let timestamp_now = Date.now()+ntpoffset_;//現在的timestamp
				//let elapsed = (timestamp_now - (eew_jp_timestamp - 3600000)) / 1000;//timestamp差異
				let elapsed = (timestamp_now - (eew_jp_timestamp)) / 1000;
				let p_radius = Math.sqrt(Math.pow(6.5 * elapsed,2) - Math.pow(eew_jp_depth,2));//P半徑
				let s_radius = Math.sqrt(Math.pow(3.5 * elapsed,2) - Math.pow(eew_jp_depth,2));//s半徑
				if (s_radius <= 0 || isNaN(s_radius)){
					s_radius = 0.001;
				}
				if (p_radius <= 0 || isNaN(p_radius)){
					p_radius = 0.001;
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

		/*----------TW EEW check----------*/
		function eewupdate_tw_p2p(){
			if (true){
				if(true){
					if(enable_eew_tw != "false"){//only for app//////////////////////////////////////////////////////
						let eew = eew_tw_p2p;
						//eew = eew_hand;
						
						let id = '';
						let version = '';
						let epicenter = '';
						let magnitude = '';
						let depth = '';
						let shindo = '';
						let timestamp = 0;
						let time = "";
						let lat = 0;
						let lon = 0;
						let status_color = '#0000E3';
						let main_color = 'blue';
						let status = '';
						let status_box = null;
						let mainbox = null;
						let localshindo = "";
						let localcolor = "blue";

						if(true)
						{
							if(eew == {})
							{
								status_color = '#0000E3';
								main_color = 'blue';
								epicenter = '-';
								magnitude = '-';
								depth = '-';
								status = '目前沒有地震速報';

								document.querySelector('.eew_tw_main_box').style.display = "none";
								document.querySelector('.eew_tw_local').style.display = "none";
								document.querySelector('.eew_tw_status_box').style.border_bottom_left_radius = "7px";
								document.querySelector('.eew_tw_status_box').style.border_bottom_right_radius = "7px";
								
							}
							else
							{
								
								//eew = eew.split(',');
								timestamp = eew["time"];
								let timestamp_now = Date.now()+ntpoffset_;
								if(timestamp_now - parseInt(timestamp)  <= 200000){
									
									id = eew["id"];
									version = eew["number"].toString();
									epicenter = eew["location"];
									magnitude = eew["scale"].toString();
									depth = eew["depth"].toString();
									shindo = eew["max"].toString();
									lat = eew["lat"].toString();
									lon = eew["lon"].toString();
									let eewAlert = eew["alert"];
									time = new Date(parseInt(timestamp)).format("yyyy-MM-dd hh:mm:ss")
									if(version == "999"){
										status = '緊急地震速報(測試)';
									}else{
										status = '緊急地震速報(第'+version+'報)';
									}
									main_color = 'blue';
									if (!eewAlert)
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
										tray_localcolor = '#b40068'
										tray_localcolortext = 'white'									

									}
									document.querySelector('.eew_tw_main_box').style.display = "flex";
									document.querySelector('.eew_tw_local').style.display = "block";
									document.querySelector('.eew_tw_status_box').style.borderBottomLeftRadius = "0px";
									document.querySelector('.eew_tw_status_box').style.borderBottomRightRadius = "0px";
									
									
								}else{//沒有地震速報
									status_color = '#3c3c3c';
									main_color = 'blue';
									epicenter = '-';
									magnitude = '-';
									depth = '-';
									status = '目前沒有地震速報';
									localshindo = "";
									localcolor = "blue";

									document.querySelector('.eew_tw_main_box').style.display = "none";
									document.querySelector('.eew_tw_local').style.display = "none";
									document.querySelector('.eew_tw_status_box').style.borderBottomLeftRadius = "7px";
									document.querySelector('.eew_tw_status_box').style.borderBottomRightRadius = "7px";
								}
							}
							//狀態顏色
							status_box = document.querySelector('.eew_tw_status_box');
							status_box.style.backgroundColor = status_color;
							//最大震度顏色
							//main_box = document.querySelector('.eew_tw_main_box');
							//main_box.style.backgroundColor = main_color;
							//主格
							document.getElementById("eew_tw_status").innerHTML = status;
							document.getElementById("eew_tw_epicenter").innerHTML = epicenter;
							document.getElementById("eew_tw_magnitude").innerHTML = "M"+magnitude;
							document.getElementById("eew_tw_depth").innerHTML = depth+"km";
							document.getElementById("eew_tw_time").innerHTML = time;
							

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
							eew_tw_time = time;
							eew_tw_id = id;
							eew_tw_version = version;
							eew_tw_localshindo = localshindo;
							eew_tw_epicenter = epicenter;
						}
					}
				}
			}
		}
		/*----------TW EEW renderer----------*/
		function tw_eew_circle(){
			/*----沒地震----*/
			if(eew_tw_id == ''){
				EEW_TW_ing = false;
				//震度色塊
				eew_tw_shindo_list_layer.clearLayers();
				//震波圓
				//震波消失
				if(eew_tw_Pcircle != null || eew_tw_Scircle != null){
					max_shindo_eew = "0"
					//左側css
					//let main_box = document.querySelector('.eew_tw_main_box');
					//main_box.style.backgroundColor = "blue";
					document.getElementById("eew_tw_maxshindo").src="shindo_icon/selected/0.png";
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
			/*----新地震----*/
			}else if(eew_tw_id != eew_tw_id_displayed){
				EEW_TW_ing = false;
				max_shindo_eew = "0"
				console.log("新地震");
				eew_tw_shindo_list = [];
				//if(eew_tw_shindo_list_layer != null){
					//map.removeLayer(eew_tw_shindo_list_layer);
					//eew_tw_shindo_list_layer = null;
				//}
				
				eew_tw_shindo_list_layer.clearLayers();
				for(i = 0; i < country_list.length;i++){
					/*----計算各地震度----*/
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
						/*----加入震度色塊----*/
						if(localshindo != "0"){
							let line = town_line[town_ID];
							//console.log(town_line[[town_ID]])
							eew_tw_shindo_list_layer.addLayer(L.geoJSON(line, { color:"#5B5B5B",fillColor: localcolor,weight:1,fillOpacity:1,pane:"eew_tw_shindo_list_layer" }))
								
							
						}
						/*----最大震度----*/
						if(shindo2float(max_shindo_eew)<shindo2float(localshindo)){
							max_shindo_eew = localshindo;
						}
					}
				}

				let main_color = "#63AA8B"
				if (max_shindo_eew == '1')
				{
					main_color = 'gray';
				}
				else if (max_shindo_eew == '2')
				{
					main_color = '#0066CC';
				}
				else if (max_shindo_eew == '3')
				{
					main_color = 'green';
				}
				else if (max_shindo_eew == '4')
				{
					main_color = '#BAC000';
				}
				else if (max_shindo_eew == '5-')
				{
					main_color = 'red';
				}
				else if (max_shindo_eew == '5+')
				{
					main_color = 'red';
				}
				else if (max_shindo_eew == '6-')
				{
					main_color = 'brown';
				}
				else if (max_shindo_eew == '6+')
				{
					main_color = 'brown';
				}
				else if (max_shindo_eew == '7')
				{
					main_color = 'purple';
				}
				else 
				{
					main_color = '#63AA8B';
				}
				//let main_box = document.querySelector('.eew_tw_main_box');
				//main_box.style.backgroundColor = main_color;
				/*----最大震度圖標----*/
				document.getElementById("eew_tw_maxshindo").src="shindo_icon/selected/"+max_shindo_eew+".png";

				/*----彈出視窗----*/
				if(enable_window_popup != 'false'){
					ipcRenderer.send('showMain');
				}

				/*----播放音效----*/
				if(enable_eew_tw_read != "false"){
					playAudio_eew(['./audio/tw/eew/alert.wav',"./audio/tw/eew/local.wav","./audio/tw/eew/"+eew_tw_localshindo+".wav","./audio/tw/eew/max.wav","./audio/tw/eew/"+max_shindo_eew+".wav"]);
					//playAudio_eew(['./audio/tw/eew/alert.mp3',"./audio/tw/eew/local.mp3","./audio/tw/eew/"+eew_tw_localshindo+".mp3","./audio/tw/eew/max.mp3","./audio/tw/eew/"+max_shindo_eew+".mp3"]);
				}
				//eew_tw_shindo_list_layer = L.layerGroup(eew_tw_shindo_list).addTo(map);

				/*----移除舊震波圓----*/
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
				/*----目前時間----*/
				let timestamp_now = 0;
				if(replay_mode){//重播 設定重播timestamp
					timestamp_now = 0
				}else{
					timestamp_now = Date.now()+ntpoffset_;//現在的timestamp
				}
				/*----震波圓半徑----*/
				let elapsed = (timestamp_now - (eew_tw_timestamp)) / 1000;//timestamp差異
				let p_radius = Math.sqrt(Math.pow(6.5 * elapsed,2) - Math.pow(eew_tw_depth,2));//P半徑
				let s_radius = Math.sqrt(Math.pow(3.5 * elapsed,2) - Math.pow(eew_tw_depth,2));//s半徑
				if (s_radius <= 0 || isNaN(s_radius)){
					s_radius = 0;
				}
				if (p_radius <= 0 || isNaN(p_radius)){
					p_radius = 0;
				}
				console.log(s_radius)
				/*----顯示circle和震央----*/
				eew_tw_Pcircle = L.circle([eew_tw_lat,eew_tw_lon],{color : 'blue' , radius:p_radius*1000 , fill : false,pane:"wave_layer"}).addTo(map);
				eew_tw_Scircle = L.circle([eew_tw_lat,eew_tw_lon],{color : 'red' , radius:s_radius*1000,pane:"wave_layer"}).addTo(map);
				let epiicon = L.icon({iconUrl : 'shindo_icon/epicenter_tw.png',iconSize : [30,30],});
				eew_tw_epicenter_icon = L.marker([eew_tw_lat,eew_tw_lon],{icon : epiicon,opacity : 1.0}).addTo(map);
				/*----移動視窗----*/
				map.panTo([eew_tw_lat,eew_tw_lon]);
				map.setZoom(7);
				/*----通知----*/
				if(enable_notification != "false"){
					let notification = new Notification('地震速報(臺灣)', {
						body: eew_tw_time+"發生有感地震 本地震度"+eew_tw_localshindo+" 規模"+eew_tw_magnitude.toString()+" 最大震度"+max_shindo_eew
					})
				}
				/*----webhook----*/
				/*if(eew_tw_version == 999){//模擬報不發送*/
				if(true){
					let text = webhook_text_TW_EEW;
					text = text.replace("%N",eew_tw_version.toString()).replace("%T",eew_tw_time).replace("%L",eew_tw_epicenter).replace("%M",eew_tw_magnitude.toString()).replace("%D",eew_tw_depth.toString()).replace("%I",max_shindo_eew).replace("%LAT",eew_tw_lat.toString()).replace("%LON",eew_tw_lon.toString())
					send_webhook(webhook_url_TW_EEW,text);
				}
				//更新已顯示資料
				eew_tw_depth_displayed = eew_tw_depth;
				eew_tw_id_displayed = eew_tw_id;
				eew_tw_lat_displayed = eew_tw_lat;
				eew_tw_lon_displayed = eew_tw_lon;
				eew_tw_timestamp_displayed = eew_tw_timestamp;
				eew_tw_version_displayed = eew_tw_version;
			//更正報
			}else if(eew_tw_version != '' &&  eew_tw_version != eew_tw_version_displayed ){
				EEW_TW_ing = false;
				//震波色塊
				console.log("更正報");
				eew_tw_shindo_list = [];
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

						let surface = Math.sqrt(Math.pow(Math.abs(townlat + (eew_tw_lat * -1)) * 111, 2) + Math.pow(Math.abs(townlon + (eew_tw_lon * -1)) * 101, 2));//震央距
						let distance = Math.sqrt(Math.pow(eew_tw_depth, 2) + Math.pow(surface, 2));//震源距
						//let value = Math.round((distance - ((new Date().getTime() - json.Time) / 1000) * 3.5) / 3.5)
						let PGA = (1.657 * Math.pow(Math.E, (1.533 * eew_tw_magnitude)) * Math.pow(distance, -1.607)).toFixed(3);
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
						if(localshindo != "0"){
							let line = town_line[town_ID];
							eew_tw_shindo_list_layer.addLayer(L.geoJSON(line, { color:"#5B5B5B",fillColor: localcolor,weight:1,fillOpacity:1,pane:"eew_tw_shindo_list_layer" }))
						}
						if(shindo2float(max_shindo_eew)<shindo2float(localshindo)){
							max_shindo_eew = localshindo;
						}
					}
				}
				let main_color = "#63AA8B"
				if (max_shindo_eew == '1')
				{
					main_color = 'gray';
				}
				else if (max_shindo_eew == '2')
				{
					main_color = '#0066CC';
				}
				else if (max_shindo_eew == '3')
				{
					main_color = 'green';
				}
				else if (max_shindo_eew == '4')
				{
					main_color = '#BAC000';
				}
				else if (max_shindo_eew == '5-')
				{
					main_color = 'red';
				}
				else if (max_shindo_eew == '5+')
				{
					main_color = 'red';
				}
				else if (max_shindo_eew == '6-')
				{
					main_color = 'brown';
				}
				else if (max_shindo_eew == '6+')
				{
					main_color = 'brown';
				}
				else if (max_shindo_eew == '7')
				{
					main_color = 'purple';
				}
				else 
				{
					main_color = '#63AA8B';
				}
				let main_box = document.querySelector('.eew_tw_main_box');
				//main_box.style.backgroundColor = main_color;
				//eew_tw_shindo_list_layer = L.layerGroup(eew_tw_shindo_list).addTo(map);
				//震波圓
				document.getElementById("eew_tw_maxshindo").src="shindo_icon/selected/"+max_shindo_eew+".png";
				console.log(2);
				/*----目前時間----*/
				let timestamp_now = 0;
				if(replay_mode){//重播 設定重播timestamp
					timestamp_now = 0
				}else{
					timestamp_now = Date.now()+ntpoffset_;//現在的timestamp
				}

				let elapsed = (timestamp_now - (eew_tw_timestamp)) / 1000;//timestamp差異
				let p_radius = Math.sqrt(Math.pow(6.5 * elapsed,2) - Math.pow(eew_tw_depth,2));//P半徑
				let s_radius = Math.sqrt(Math.pow(3.5 * elapsed,2) - Math.pow(eew_tw_depth,2));//s半徑
				if (s_radius <= 0 || isNaN(s_radius)){
					s_radius = 0;
				}
				if (p_radius <= 0 || isNaN(p_radius)){
					p_radius = 0;
				}
				//更新半徑
				eew_tw_Pcircle.setRadius(p_radius * 1000);
				eew_tw_Scircle.setRadius(s_radius * 1000);
				//更新座標
				eew_tw_Pcircle.setLatLng([eew_tw_lat,eew_tw_lon]);
				eew_tw_Scircle.setLatLng([eew_tw_lat,eew_tw_lon]);
				eew_tw_epicenter_icon.setLatLng([eew_tw_lat,eew_tw_lon]);
				//通知
				if(enable_notification != "false"){
					let notification = new Notification('地震速報(臺灣)', {
						body: eew_tw_time+"發生有感地震 本地震度"+eew_tw_localshindo+" 規模"+eew_tw_magnitude.toString()+" 最大震度"+max_shindo_eew
					})
				}
				//webhook
				/*if(eew_tw_version != 999){//模擬報不發送*/
				if(true){
					let text = webhook_text_TW_EEW;
					text = text.replace("%N",eew_tw_version.toString()).replace("%T",eew_tw_time).replace("%L",eew_tw_epicenter).replace("%M",eew_tw_magnitude.toString()).replace("%D",eew_tw_depth.toString()).replace("%I",max_shindo_eew).replace("%LAT",eew_tw_lat.toString()).replace("%LON",eew_tw_lon.toString())
					send_webhook(webhook_url_TW_EEW,text);
				}
				//更新已顯示資料
				eew_tw_depth_displayed = eew_tw_depth;
				eew_tw_id_displayed = eew_tw_id;
				eew_tw_lat_displayed = eew_tw_lat;
				eew_tw_lon_displayed = eew_tw_lon;
				eew_tw_timestamp_displayed = eew_tw_timestamp;
				eew_tw_version_displayed = eew_tw_version;
			//原地震原報更新
			}else{
				EEW_TW_ing = false;
				//震波圓
				/*----目前時間----*/
				let timestamp_now = 0;
				if(replay_mode){//重播 設定重播timestamp
					timestamp_now = 0
				}else{
					timestamp_now = Date.now()+ntpoffset_;//現在的timestamp
				}
				
				let elapsed = (timestamp_now - (eew_tw_timestamp)) / 1000;//timestamp差異
				let p_radius = Math.sqrt(Math.pow(6.5 * elapsed,2) - Math.pow(eew_tw_depth,2));//P半徑
				let s_radius = Math.sqrt(Math.pow(3.5 * elapsed,2) - Math.pow(eew_tw_depth,2));//s半徑
				if (s_radius <= 0 || isNaN(s_radius)){
					s_radius = 0;
				}
				if (p_radius <= 0 || isNaN(p_radius)){
					p_radius = 0;
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
				//----------新警報----------//
				//if(newAlert && alert["id"] != "0"){
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
					let localPGA = RFPLUS_localPGA(parseFloat(userlat),parseFloat(userlon),center["lat"],center["lon"],center["pga"],rate)
					let localshindo = PGA2shindo(localPGA);
					let localcolor = shindo_color[localshindo];
					//計算各地震度
					RFPLUS_eew = RFPLUS_render(RFPLUS_eew);
					RFPLUS_list.push(RFPLUS_eew);
					//----播放音效----//
					if(1){
						playAudio_eew(['./audio/tw/eew/alert.wav']);
					}
					//UI顯示(此處沒有針對同時多警報做優化)
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
					let localPGA = RFPLUS_localPGA(parseFloat(userlat),parseFloat(userlon),center["lat"],center["lon"],center["pga"],rate)
					let localshindo = PGA2shindo(localPGA);
					let localcolor = shindo_color[localshindo];
					//計算各地震度
					RFPLUS_eew = RFPLUS_render(RFPLUS_eew);
					RFPLUS_list[key] = RFPLUS_eew;
					//UI顯示(此處沒有針對同時多警報做優化)
					document.getElementById("RFPLUS").style.display = "block";
					document.getElementById("RFPLUS_status_box").style.backgroundColor = "orange";
					document.getElementById("RFPLUS_maxshindo").src = "shindo_icon/selected/" + RFPLUS_eew["max_shindo"] + ".png";
					document.getElementById("RFPLUS_epicenter").innerHTML = center["cname"];
					document.getElementById("RFPLUS_report_num").innerHTML = report_num;
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

		function RFPLUS_localPGA2(townlat,townlon,centerlat,centerlon,centerpga,rate){
			let depth = 10;
			let distance = Math.sqrt(Math.pow(Math.abs(townlat + (centerlat * -1)) * 111, 2) + Math.pow(Math.abs(townlon + (centerlon * -1)) * 101, 2) + Math.pow(depth, 2));
			///let distance = Math.sqrt(Math.pow(depth, 2) + Math.pow(surface, 2) + Math.pow(depth, 2));
			let PGA = rate * Math.pow(distance,-1.607);
			return PGA;
		}
		
		/*----------RFPLUS 各地震度渲染----------*/
		function RFPLUS_render(RFPLUS_eew){
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
						let PGA = RFPLUS_localPGA2(townlat,townlon,center["lat"],center["lon"],center["pga"],rate);
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
		/*----------RFPLUS清除警報----------*/
		function RFPLUS_overtime(){
			for(let i = 0; i < RFPLUS_list.length; i++){
				if(Date.now() + ntpoffset_ - RFPLUS_list[i]["time"] >= 180000){//超過發震後3分鐘
					//清除地圖圖層
					RFPLUS_list[i]["shindoLayer"].clearLayers()
					map.removeLayer(RFPLUS_list[i]["center"]["icon"])
					document.getElementById("RFPLUS").style.display = "none";
				}
			}
		}
		/*----------RF station check----------*/
		async function pgaupdate_async_ws(data){
				if(1){
					document.querySelector('.disconnected').style.display = "none";
					if(enable_shindo != "false"){//only for app///////////////////////////////////////////
						let timer = Date.now();//計算500ms用 計時器
						var station_count = 0;//上線測站計數
						let stations_displayed = []//清空更新完成測站列表
						let RF_alert_list = [];//清空觸發測站列表
						let pga_list = data;//全部測站
						//console.log(pga_list)
						let shakealert = false;
						pga_list = JSON.parse(pga_list)
						/*----------警報判定----------*/
						if(pga_list["shake_alert"]){
							shakealert = true;
							replay_mode = false;//強制結束回放模式
						}
						/*----------警報範圍閃爍控制----------*/
						if(RF_alert_area_flash_controller){
							RF_alert_area_flash_controller = false;
						}else{
							RF_alert_area_flash_controller = true;
						}
						/*----------檢查每個測站----------*/
						if(!replay_mode){
							pga_list = pga_list["data"];
							for(i = 0;i < pga_list.length;i++){
								let id = pga_list[i]["id"];//測站ID
								let name = pga_list[i]["name"];//測站名稱
								let lat = parseFloat(pga_list[i]["lat"]);//測站緯度
								let lon = parseFloat(pga_list[i]["lon"]);//測站經度
								let cname = pga_list[i]["cname"];//測站行政區名
								RF_stations[id] = {"cname":cname,"name":name}
								let pga = parseFloat(pga_list[i]["pga"]);//即時PGA
								let shindo = pga_list[i]["shindo"];//即時震度
								let shindo_15 = pga_list[i]["shindo_15"];//15秒內震度
								let pga_origin = parseFloat(pga_list[i]["pga_origin"]);//即時原始PGA
								let timestamp = pga_list[i]["timestamp"];//測站最後更新時間
								let local = false;//本地測站
								let iconsizepx = 10;
								let panename = "shindo_icon_0_0";//測站點基礎pane
								let zIndexOffset = 0;
								
								//----------決定測站顯示icon----------//
								if (shindo_15 == '0' || !shakealert){

									if (pga <= 1){
										iconURL = 'shindo_icon/pga0.png';

									}else if(pga <= 1.3){
										iconURL = 'shindo_icon/pga1.png';
										zIndexOffset = 1;
										//panename = "shindo_icon_0_1";
									}else if(pga <=1.4 ){
										iconURL = 'shindo_icon/pga2.png';
										zIndexOffset = 2;
										//panename = "shindo_icon_0_2";
									}else{
										iconURL = 'shindo_icon/pga3.png';
										zIndexOffset = 3;
										//panename = "shindo_icon_0_3";
									}	
								}else{
									iconURL = 'shindo_icon/'+shindo_15+'.png';//震度icon
									zIndexOffset = map.getPane("shindo_icon_"+shindo_15).style.zIndex - 600//圖層順序
									iconsizepx = 20
								}

								//------------判斷測站是否離線-----------//
								if(Math.abs((Date.now() + ntpoffset_) - timestamp) >= 5000){
									pga = 0;
									shindo = "0";
									shindo_15 = "0";
									pga_origin = 0;
									iconURL = 'shindo_icon/disconnected.png';
									//panename = "shindo_icon_disconnected";
									zIndexOffset = -1;

									iconsizepx = 7
								}else{
									station_count++;
								}
								let displayed = false;

								//----------更新圖標----------//
								for(j = 0;j < stations.length;j++){
									if(stations[j][1] == name){
										let circleRadius = 0;
										if(shakealert && shindo_15 != '0' && enable_warningArea !='false' && RF_alert_area_flash_controller){
										//if(1){
											circleRadius = 20000;
										}
										let cusicon = L.icon({iconUrl : iconURL,iconSize : [iconsizepx,iconsizepx],});//設定icon
										stations[j][0].setIcon(cusicon);
										stations[j][0].setZIndexOffset(zIndexOffset)//設定圖層順序
										stations[j][0].setLatLng([lat,lon]);
										stations[j][2].setLatLng([lat,lon]);
										//變更測站警戒範圍圖層
										map.getPane(id).style.zIndex = map.getPane("shindo_icon_"+shindo_15).style.zIndex - 300;
										//stations[j][2].setZIndexOffset(zIndexOffset)
										displayed = true;
										stations_displayed.push([stations[j][0].setTooltipContent("<div>"+name+"</div><div>"+cname+"</div><div>PGA(原始):"+pga_origin.toString()+"</div><div>PGA(濾波):"+pga.toString()+"</div><div>震度:"+shindo_15+"</div>"),name,stations[j][2].setRadius(circleRadius).setStyle({color:shindo_color[shindo_15]})]);
										stations.splice(j,1);
									}
								}
								//-----------新增圖標----------//
								if(displayed == false){
									let circleRadius = 0;
									if(shakealert && shindo_15 != '0' && enable_warningArea !='false' && RF_alert_area_flash_controller){
										circleRadius = 20000;
									}
									//設定icon
									let cusicon = L.icon({iconUrl : iconURL,iconSize : [iconsizepx,iconsizepx],});
									//設定位置
									let position = L.latLng(lat,lon);
									//創建測站圓圈專用pane
									map.createPane(id);
									map.getPane(id).style.zIndex = map.getPane("shindo_icon_"+shindo_15).style.zIndex - 300;
									//創建測站點並加入
									stations_displayed.push([new L.marker(position,{pane:panename,icon : cusicon,title : name,opacity : 1.0}).bindTooltip("<div>"+name+"</div><div>"+cname+"</div><div>PGA(原始):"+pga_origin.toString()+"</div><div>PGA(濾波):"+pga.toString()+"</div><div>震度:"+shindo_15+"</div>",{offset:L.point(0, 8)}).addTo(map).on("click",function(e){
										let name = e.sourceTarget.options.title;
										selected_station = name;
										storage.setItem('selected_station',name);
										document.getElementById("selected_name").innerHTML = name;
									}),name,new L.circle(position,{pane:id,radius:circleRadius,color:shindo_color[shindo_15],fillOpacity:1}).addTo(map)]);
									console.log('新增:'+name);
								}
								//----------檢查是否被選取----------//
								if(name == selected_station){
									document.getElementById("selected_pgao").innerHTML = pga_origin;
									document.getElementById("selected_pga").innerHTML = pga;
									//document.getElementById("selected_magn").innerHTML = shindo.toString();
									document.getElementById("selected_shindo").innerHTML = "<img src='shindo_icon/selected/"+shindo_15.toString()+".png' style='width:50px'>"
								}
								//----------檢查是否為鄰近本地測站----------//
								if(Math.sqrt(Math.pow(Math.abs(parseFloat(userlat) + (lat * -1)) * 111, 2) + Math.pow(Math.abs(parseFloat(userlon) + (lon * -1)) * 101, 2)) <= 20){
									local = true;
								}
								//----------檢查是否是最大震度----------//
								if (shindo2float(shindo_15) > shindo2float(max_shindo)){
									max_shindo = shindo_15;
								}
								//----------檢查是否是本地最大震度----------//
								if ((shindo2float(shindo_15) > shindo2float(max_shindo_local)) && local){
									max_shindo_local = shindo_15;
								}
								//-----------加入警報列表----------//
								if(shakealert && shindo_15 != '0' ){
									RF_alert_list.push([cname,shindo_15]);
								}
								//----------加入震度速報列表----------//
								let in_sokuho_list = 0
								let sokuho_key = -1
								//尋找是否在列表內
								for(let j = 0;j < RF_shindo_sokuho_list.length ; j++){
									if(RF_shindo_sokuho_list[j]["id"] == id){
										in_sokuho_list = 1;
										sokuho_key = j
									}
								}
								//已在列表內
								if(in_sokuho_list){
									//判斷震度是否增加
									if(shindo2float(shindo_15) > shindo2float(RF_shindo_sokuho_list[sokuho_key]["shindo"])){
										RF_shindo_sokuho_list[sokuho_key]["shindo"] = shindo_15;
									}
								//不在列表內
								}else{
									if(shakealert && shindo_15 != '0' ){
										RF_shindo_sokuho_list.push({"id":id,"name":name,"cname":cname,"shindo":shindo_15});
									}
								}
							}
							//----------顯示最大震度----------//
							if(local_only != "false"){//本地模式
								document.getElementById("max_shindo_img").innerHTML = "<img src='shindo_icon/selected/"+max_shindo_local+".png' style='width: 90px;height: 90px;'>"	
							}else{//全域模式
								document.getElementById("max_shindo_img").innerHTML = "<img src='shindo_icon/selected/"+max_shindo+".png' style='width: 90px;height: 90px;'>"	
							}
							//----------顯示區域警報----------//
							//RF_alert_list = [["1","5+"],["2","5-"],["3","7"],["4","6+"],["5","4"],["6","1"],["7","2"]]
							if(shakealert){
								//篩選6個最大震度
								let RF_alert_list_display = [];
								let RF_alert_list_length = RF_alert_list.length;
								for(let j = 0;j < RF_alert_list_length;j++){
									let max_i = 0;//最大值索引值
									let max_v = 0;//最大值
									for(let k = 0;k < RF_alert_list.length;k++){
										if(shindo2float(RF_alert_list[k][1]) > max_v){
											max_i = k;
											max_v = shindo2float(RF_alert_list[k][1]);
										}
									}
									RF_alert_list_display.push(RF_alert_list[max_i])
									RF_alert_list.splice(max_i,1);
									if(j == 5){
										break;
									}
								}
								console.log(RF_alert_list_display);
								console.log("RF警報");
								//變更顏色
								if(shindo2float(max_shindo) >= 4){
									document.querySelector(".RF_list").style.backgroundColor = "red";
								}else{
									document.querySelector(".RF_list").style.backgroundColor = "#E96D07";
								}
								//變更狀態
								document.getElementById("RF_status").innerHTML = "搖晃檢知";
								//變更padding
								document.querySelector(".RF_list").style.paddingBottom = "5px";
								document.querySelector(".RF_lists").style.padding = "5px";
								for(let j = 0;j < RF_alert_list_display.length;j++){
									document.getElementById("RF_item_" + (j+1).toString()).innerHTML = "<img src='shindo_icon/selected/"+RF_alert_list_display[j][1]+".png' height='30px'><h5 style='color: white;'>"+RF_alert_list_display[j][0]+"</h5>"
									if(j == 5){
										break;
									}
								}
							}else{
								document.querySelector(".RF_list").style.backgroundColor = "#3c3c3c";
								document.getElementById("RF_status").innerHTML = "目前沒有地震速報";
								document.querySelector(".RF_list").style.paddingBottom = "0px";
								document.querySelector(".RF_lists").style.padding = "0px";
								for(let j = 0;j < 6;j++){
									document.getElementById("RF_item_" + (j+1).toString()).innerHTML = "";
								}
							}			
							//----------音效----------//
							if(local_only != "false"){//本地模式
								if((shindo2float(max_shindo_local) > shindo2float(max_shindo_local_before)) && shakealert){
									
									if(max_shindo_local == "1" && enable_shindo_sounds_1 != "false"){//only for app/////////////////////////////////////////////////
										aud1.play();
									}else if(max_shindo_local == "2" && enable_shindo_sounds_2 != "false"){//only for app/////////////////////////////////////////////////
										aud2.play();
									}else if(max_shindo_local == "3" && enable_shindo_sounds_3 != "false"){//only for app/////////////////////////////////////////////////
										aud3.play();
									}else if(max_shindo_local == "4" && enable_shindo_sounds_4 != "false"){//only for app/////////////////////////////////////////////////
										aud4.play();
									}else if(max_shindo_local == "5-" && enable_shindo_sounds_5j != "false"){//only for app/////////////////////////////////////////////////
										aud5j.play();
									}else if(max_shindo_local == "5+" && enable_shindo_sounds_5k != "false"){//only for app/////////////////////////////////////////////////
										aud5k.play();
									}else if(max_shindo_local == "6-" && enable_shindo_sounds_6j != "false"){//only for app/////////////////////////////////////////////////
										aud6j.play();
									}else if(max_shindo_local == "6+" && enable_shindo_sounds_6k != "false"){//only for app/////////////////////////////////////////////////
										aud6k.play();
									}else if(max_shindo_local == "7" && enable_shindo_sounds_7 != "false"){//only for app/////////////////////////////////////////////////
										aud7.play();
									}
									max_shindo_local_before = max_shindo_local;
								}
							}else{//全域模式
								if((shindo2float(max_shindo) > shindo2float(max_Shindo_before)) && shakealert){
									
									if(max_shindo == "1" && enable_shindo_sounds_1 != "false"){//only for app/////////////////////////////////////////////////
										aud1.play();
									}else if(max_shindo == "2" && enable_shindo_sounds_2 != "false"){//only for app/////////////////////////////////////////////////
										aud2.play();
									}else if(max_shindo == "3" && enable_shindo_sounds_3 != "false"){//only for app/////////////////////////////////////////////////
										aud3.play();
									}else if(max_shindo == "4" && enable_shindo_sounds_4 != "false"){//only for app/////////////////////////////////////////////////
										aud4.play();
									}else if(max_shindo == "5-" && enable_shindo_sounds_5j != "false"){//only for app/////////////////////////////////////////////////
										aud5j.play();
									}else if(max_shindo == "5+" && enable_shindo_sounds_5k != "false"){//only for app/////////////////////////////////////////////////
										aud5k.play();
									}else if(max_shindo == "6-" && enable_shindo_sounds_6j != "false"){//only for app/////////////////////////////////////////////////
										aud6j.play();
									}else if(max_shindo == "6+" && enable_shindo_sounds_6k != "false"){//only for app/////////////////////////////////////////////////
										aud6k.play();
									}else if(max_shindo == "7" && enable_shindo_sounds_7 != "false"){//only for app/////////////////////////////////////////////////
										aud7.play();
									}
									max_Shindo_before = max_shindo;
								}
							}
							//----------震度速報----------//
							/*RF_shindo_sokuho_list = [
								{"cname":"宜蘭縣 蘇澳鎮","shindo":"2"},
								{"cname":"宜蘭縣 蘇澳鎮", "shindo":"2"},
								{"cname":"宜蘭縣 蘇澳鎮", "shindo":"1"},
								{"cname":"宜蘭縣 蘇澳鎮", "shindo":"1"},
								{"cname":"宜蘭縣 宜蘭市", "shindo":"1"},
								{"cname":"基隆市 七堵區", "shindo":"1"},
								{"cname":"臺北市 內湖區", "shindo":"1"}
							]*/
							if(!shakealert && RF_shindo_sokuho_list.length != 0){
								//統整震度速報
								let A7 = [];
								let A6K = [];
								let A6J = [];
								let A5K = [];
								let A5J = [];
								let A4 = [];
								let A3 = [];
								let A2 = [];
								let A1 = [];

								for(let j = 0; j<RF_shindo_sokuho_list.length ;j++){
									if(RF_shindo_sokuho_list[j]["shindo"] == "7"){A7.push(RF_shindo_sokuho_list[j]["cname"])}
									if(RF_shindo_sokuho_list[j]["shindo"] == "6+"){A6K.push(RF_shindo_sokuho_list[j]["cname"])}
									if(RF_shindo_sokuho_list[j]["shindo"] == "6-"){A6J.push(RF_shindo_sokuho_list[j]["cname"])}
									if(RF_shindo_sokuho_list[j]["shindo"] == "5+"){A5K.push(RF_shindo_sokuho_list[j]["cname"])}
									if(RF_shindo_sokuho_list[j]["shindo"] == "5-"){A5J.push(RF_shindo_sokuho_list[j]["cname"])}
									if(RF_shindo_sokuho_list[j]["shindo"] == "4"){A4.push(RF_shindo_sokuho_list[j]["cname"])}
									if(RF_shindo_sokuho_list[j]["shindo"] == "3"){A3.push(RF_shindo_sokuho_list[j]["cname"])}
									if(RF_shindo_sokuho_list[j]["shindo"] == "2"){A2.push(RF_shindo_sokuho_list[j]["cname"])}
									if(RF_shindo_sokuho_list[j]["shindo"] == "1"){A1.push(RF_shindo_sokuho_list[j]["cname"])}
								}
								//構建震度速報訊息文字
								let text = ">>> # " + webhook_header_shindo_sokuho + "\n";
								if(A7.length){text = text + "**7級**\n"; for(let j = 0; j<A7.length; j++){text = text + A7[j] + "\n"}}
								if(A6K.length){text = text + "**6強**\n"; for(let j = 0; j<A6K.length; j++){text = text + A6K[j] + "\n"}}
								if(A6J.length){text = text + "**6弱**\n"; for(let j = 0; j<A6J.length; j++){text = text + A6J[j] + "\n"}}
								if(A5K.length){text = text + "**5強**\n"; for(let j = 0; j<A5K.length; j++){text = text + A5K[j] + "\n"}}
								if(A5J.length){text = text + "**5弱**\n"; for(let j = 0; j<A5J.length; j++){text = text + A5J[j] + "\n"}}
								if(A4.length){text = text + "**4級**\n"; for(let j = 0; j<A4.length; j++){text = text + A4[j] + "\n"}}
								if(A3.length){text = text + "**3級**\n"; for(let j = 0; j<A3.length; j++){text = text + A3[j] + "\n"}}
								if(A2.length){text = text + "**2級**\n"; for(let j = 0; j<A2.length; j++){text = text + A2[j] + "\n"}}
								if(A1.length){text = text + "**1級**\n"; for(let j = 0; j<A1.length; j++){text = text + A1[j] + "\n"}}
								/*
								for(j = 0;j<RF_shindo_sokuho_list.length;j++){
									text = text + RF_shindo_sokuho_list[j]["cname"] + " " + RF_shindo_sokuho_list[j]["shindo"] + "\n"
								}
								*/ 
								//發布震度速報
								send_webhook(webhook_url_shindo_sokuho,text);
								RF_shindo_sokuho_list = []
							}

							if(max_shindo == "0"){
								max_Shindo_before = "0";
							}
							if(max_shindo_local == "0"){
								max_Shindo_local_before = "0";
							}
							max_shindo = "0";
							max_shindo_local = "0";

							if(max_Shindo_before != "0"){
								console.log("max_shindo:"+max_Shindo_before);
							}
						}
						/*----------刪除剩下圖標(測站刪除)----------*/
						for(j = 0;j < stations.length;j++){
							console.log(stations_displayed);
							console.log('刪除:');
							map.removeLayer(stations[j][0]);
							map.removeLayer(stations[j][2]);
							stations.splice(j,1);
						}
						
						stations = stations_displayed;

						/*----------顯示目前測站數----------*/
						if(typeof(station_count) != "undefined"){
							//let htmlText = "<p style='color:white'>目前共有" + station_count + "個測站上線</p>";
							//document.getElementById('stations_count').innerHTML = htmlText.toString();
							document.getElementById('stations_count_online').innerHTML = station_count.toString();
						}

						let delaytime = 500 - (Date.now() - timer);//計算經過時間
						if (delaytime < 0){//delaytime不可小於0
							delaytime = 0;
						}
					}else{
						let htmlText = "<p style='color:white'>即時測站停用中</p>";
						document.getElementById('stations_count').innerHTML = htmlText;
					}
				}else{
					//document.querySelector('.disconnected').style.display = "block";
				}
		}
		/*----------波型----------*/
		async function wave_update(){
			let XHR_wave = createXHR();	
			var waveInterval = setInterval(function(){
				for(let i = 0;i < wave_list.length;i++){
					XHR_wave.open('GET',server_url+':8787/pgafull?name='+wave_list[i]['id'],false);
					/*XHR_wave.onreadystatechange = function(){
						if(XHR_wave.readyState == 4)
						{
							
						}
					};*/

					XHR_wave.send(null);
					if(XHR_wave.status ==200)
					{
							let wave_recv = JSON.parse(XHR_wave.responseText);
							if(wave_recv["status"] != "data not found"){
								let index = 0;
								let id = wave_recv["id"];
								for(let j = 0;j < wave_list.length;j++){
									if(wave_list[j]["id"] == id){
										index = j;
									}
								}
								if(typeof(wave_list[index]["wave"]) == "undefined" || wave_list[index]["wave"].length == 0){
									for(let j = 0;j < wave_recv["data"].length;j++){
										wave_list[index]["wave"].push(wave_recv["data"][j]);
									}
								}else{
									let s = 0
									for(let j = 0;j<wave_recv["data"].length;j++){
										if(wave_recv["data"][j]["unixTimestamp"] == wave_list[index]["wave"][wave_list[index]["wave"].length-1]["unixTimestamp"]){
											s = 1
										}
									}
									if(s == 0){
										for(let j = 0;j < wave_recv["data"].length;j++){
											wave_list[index]["wave"].push(wave_recv["data"][j]);
											if(wave_list[index]["wave"].length >= 600){
												for(let k = 0;k < 20;k++){
													wave_list[index]["wave"].shift();
												}
											}
										}
									}else{
										//console.log("波型重複");
									}
								}
							}		
					}
				}
				//console.log(wave_list)
				const canvas = document.getElementById("waveCanvas1");
				if(wave_list[0]["wave"] != []){
					try{
						// 取得 2D 繪圖環境
						const ctx = canvas.getContext("2d");
						ctx.clearRect(0, 0, canvas.width, canvas.height);
						// 設定線條顏色和寬度
						ctx.strokeStyle = "white";
						ctx.lineWidth = 2;
						ctx.font = '15px Arial';
						ctx.fillStyle = 'white';
						//ctx.fillText(wave_list[0]["id"], 5, 20)
						
						// 定位折線的起點
						ctx.beginPath();
						ctx.moveTo(0, wave_list[0]["wave"][0][wave_list[0]["motion"]]+49);
						// 連接折線的所有點
						for (let j = 1; j < wave_list[0]["wave"].length; j++) {
							ctx.lineTo(j, wave_list[0]["wave"][j][wave_list[0]["motion"]]+49);
						}
						// 繪製折線
						ctx.stroke();
					}catch(e){}
				}	
				if(wave_list[1]["wave"] != []){
					try{
						// 取得 canvas 元素
						const canvas2 = document.getElementById("waveCanvas2");
						// 取得 2D 繪圖環境
						const ctx2 = canvas2.getContext("2d");
						ctx2.clearRect(0, 0, canvas2.width, canvas2.height);
						// 設定線條顏色和寬度
						ctx2.strokeStyle = "white";
						ctx2.lineWidth = 2;
						ctx2.font = '15px Arial';
						ctx2.fillStyle = 'white';
						//ctx2.fillText(wave_list[1]["id"], 5, 20)
						
						// 定位折線的起點
						ctx2.beginPath();
						ctx2.moveTo(0, wave_list[1]["wave"][0][wave_list[1]["motion"]]+49);
						// 連接折線的所有點
						for (let j = 1; j < wave_list[1]["wave"].length; j++) {
							ctx2.lineTo(j, wave_list[1]["wave"][j][wave_list[1]["motion"]]+49);
						}
						// 繪製折線
						ctx2.stroke();
					}catch(e){}
				}
				if(wave_list[2]["wave"] != []){
					try{
						// 取得 canvas 元素
						const canvas3 = document.getElementById("waveCanvas3");
						// 取得 2D 繪圖環境
						const ctx3 = canvas3.getContext("2d");
						ctx3.clearRect(0, 0, canvas3.width, canvas3.height);
						// 設定線條顏色和寬度
						ctx3.strokeStyle = "white";
						ctx3.lineWidth = 2;
						ctx3.font = '15px Arial';
						ctx3.fillStyle = 'white';
						//ctx3.fillText(wave_list[2]["id"], 5, 20)
						
						// 定位折線的起點
						ctx3.beginPath();
						ctx3.moveTo(0, wave_list[2]["wave"][0][wave_list[2]["motion"]]+49);
						// 連接折線的所有點
						for (let j = 1; j < wave_list[2]["wave"].length; j++) {
							ctx3.lineTo(j, wave_list[2]["wave"][j][wave_list[2]["motion"]]+49);
						}
						// 繪製折線
						ctx3.stroke();
					}catch(e){}
				}
				if(wave_list[3]["wave"] != []){
					try{
						// 取得 canvas 元素
						const canvas4 = document.getElementById("waveCanvas4");
						// 取得 2D 繪圖環境
						const ctx4 = canvas4.getContext("2d");
						ctx4.clearRect(0, 0, canvas4.width, canvas4.height);
						// 設定線條顏色和寬度
						ctx4.strokeStyle = "white";
						ctx4.lineWidth = 2;
						ctx4.font = '15px Arial';
						ctx4.fillStyle = 'white';
						//ctx4.fillText(wave_list[2]["id"], 5, 20)
						
						// 定位折線的起點
						ctx4.beginPath();
						ctx4.moveTo(0, wave_list[3]["wave"][0][wave_list[3]["motion"]]+49);
						// 連接折線的所有點
						for (let j = 1; j < wave_list[3]["wave"].length; j++) {
							ctx4.lineTo(j, wave_list[3]["wave"][j][wave_list[3]["motion"]]+49);
						}
						// 繪製折線
						ctx4.stroke();
					}catch(e){}
				}
				
			},600)
		}
		
		
		/*----------天氣警特報----------*/
		function weatherWarning(){
			if(XHR5.readyState == 4)
			{
				if(XHR5.status ==200)
				{
					if (enable_weather != "false")//only for app/////////////////////////////////////////////////
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
								
  								weather_warning_layers.addLayer(L.geoJSON(geojson_list[name], { color: "yellow",width:2,fillOpacity: 0,pane:"weather_warning_layers" }).bindPopup(popupContent));
							}
						}
						
					}
				}
			}
		}
		function weatherWarning_ws(warnings){
			if(true)
			{
				if(true)
				{
					if (enable_weather != "false")//only for app/////////////////////////////////////////////////
					{
						//let weather_warning_lines_displayed = [];
						//for(i=0;i<weather_warning_lines.length;i++){
							//map.removeLayer(weather_warning_lines[i]);
						//}
						weather_warning_layers.clearLayers();
						//let warnings = XHR5.responseText;
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
								
  								weather_warning_layers.addLayer(L.geoJSON(geojson_list[name], { color: "yellow",width:2,fillOpacity: 0.5 ,pane:"weather_warning_layers"}).bindPopup(popupContent));
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
					if(enable_tsunami != "false"){//only for app/////////////////////////////////////////////////
						let type = "";
						let color = "";
						let content = "";
						let tsunamiInfo = XHR_tsunami.responseText;
						//let tsunamiInfo = a;
						tsunamiInfo = JSON.parse(tsunamiInfo);
						let tsunamireport = tsunamiInfo["report"];
						let wave = tsunamiInfo["wave"];
						let timestamp = parseFloat(tsunamireport[0]["timestamp"]);
						if (((Date.now()+ntpoffset_)/1000)-timestamp <= 172800) {
							
							type = tsunamireport[0]["type"];
							content = tsunamireport[0]["content"];
							document.querySelector(".tsunami_coastline").style.display = "block";
							document.querySelector(".tsunami_content").style.display = "block";
							document.querySelector(".left").style.height = "100%";
							for(let i = 0;i<wave.length;i++){
								document.getElementById(tsunami_coastline_height[wave[i]["name"]]).innerHTML = wave[i]["height"];
								document.getElementById(tsunami_coastline_time[wave[i]["name"]]).innerHTML = wave[i]["time"];
							}

							
						}else{
							type = "目前沒有海嘯相關資訊";
							content = "無";
							document.querySelector(".tsunami_coastline").style.display = "none";
							document.querySelector(".tsunami_content").style.display = "none";
							document.querySelector(".left").style.height = "fit-content";

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
					if(enable_typhoon != "false"){//only for app/////////////////////////////////////////////////
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

		function getVersion(){
			if(XHR_ver.readyState == 4)
			{
				if(XHR_ver.status ==200)
				{
					let newver = XHR_ver.responseText;
					let ver = "2.5.3";
					//newver = newver.substring(0, newver.length - 2);
					console.log('最新版本:',newver)
					console.log('目前版本:',ver)
					if(newver != ver){
						document.getElementById("ver").innerHTML = "<p style='color:white;position:absolute;right:0;bottom: 0;margin-bottom: 0;' onclick='downnewver()'>點擊此處下載更新</p>";
					}else{
						document.getElementById("ver").innerHTML = "<p style='color:white;position:absolute;right:0;bottom: 0;margin-bottom: 0;'>目前為最新版本</p>";
					}
				}
			}
		}
		
		function downnewver(){
			shell.openExternal(server_url+":8080/downloads/RF-monitor.exe");
		}
		function register_google(){
			shell.openExternal("https://rfeqserver.myqnapcloud.com/RFEQservice/register.html");
		}
		//only for app/////////////////////////////////////////////////////////////////////////////////////////////////////////////
		//function palert(){

		//}
		/*----------NTP對時----------*/
		function ntp(){
			if(!EEW_TW_ing){
				try{
					XHR_ntp.open('GET','http://worldtimeapi.org/api/timezone/Asia/Taipei',false);
					XHR_ntp.send(null);
					if(XHR_ntp.status ==200){
						let ntpnum = XHR_ntp.responseText;
						ntpnum = JSON.parse(ntpnum);
						ntpnum = ntpnum["unixtime"] * 1000;
						ntpoffset_ = ntpnum - Date.now();
						console.log("NTP offset:"+ntpoffset_.toString());
					}
				}catch(e){
					setTimeout(() => {ntp()},1000)
				}
			}
		}
		function update()
		{
				if(count % 100 == 0){
					ntp();
				}
				
				if(count % 10 == 0){
					//地震速報jp
					eewupdate_jp_ws()
					
					//地震速報tw
					eewupdate_tw_p2p();

					//RFPLUS警報過期檢查
					RFPLUS_overtime();
				}

				if (count % 100 == 0){
					//檢查更新
					XHR_ver.open('GET',server_url+':8787/monitorVersion',true);
					XHR_ver.onreadystatechange = getVersion;
					XHR_ver.send(null);
				}
				if (count % 300 == 0){
					//海嘯
					XHR_tsunami.open('GET',server_url+':8080/cgi-bin/get_tsunami.py',true);
					XHR_tsunami.onreadystatechange = TsunamiUpdate;
					XHR_tsunami.send(null);
					//颱風
					XHR_typhoon.open('GET',server_url+':8080/cgi-bin/get_typhoon.py',true);
					XHR_typhoon.onreadystatechange = typhoon_update;
					XHR_typhoon.send(null);
				}

				//地震速報渲染
				jp_eew_circle()
				tw_eew_circle()

				count++;
				if(count == 600){
					count = 0;
				}
		}

		
		function ws_connect(){
			let socket = new WebSocket(ws_server_url+":8788");//ws://RFEQSERVER.myqnapcloud.com:8788
			let publicKey = ""
			let verifyKey = storage.getItem('verifyKey')
			storage.setItem('login_user',"")//清空使用者名稱
			socket.onopen = function() {
				document.getElementById("websocket_status").innerHTML = "正常";
				document.getElementById("websocket_status").style.color = "green";
				//dev//////////////////////////////////////
				if(server){
					socket.send('{"request":"record_mode"}');
				}
				///////////////////////////////////////////
				//已經登入
				if(verifyKey != ""){
					//請求登入碼登入
					document.getElementById("loading_text").innerHTML = "正在登入...";
					socket.send('{"request":"getKey"}');
					console.log("request key");
					hideLogin();
				}else{
					//已登出 顯示登入提示框
					showLogin();
				}
			}
			socket.onmessage = function(event) {
				let data = event.data;
				data = JSON.parse(data);
				//臺灣速報
				if(data["type"] == "eew_tw"){
					console.log(data["content"])
					eew_tw_ws = data["content"];
					eew_tw_p2p = data["content"];
				}
				//日本速報
				if(data["type"] == "eew_jp"){
					eew_jp_ws = data["content"];
				}
				/*
				if(data["type"] == "RFPLUS"){
					RFPLUS(data["content"])
				}
				*/
				if(data["type"] == "RFPLUS2"){
					RFPLUS(data["content"])
				}
				//地震報告
				if(data["type"] == "report"){
					console.log(data["content"]);
					let report = JSON.stringify(data["content"]);
					InfoUpdate_full_ws(report);
				}
				//天氣警特報
				if(data["type"] == "weather"){
					console.log(data["content"])
					let weather_ws = JSON.stringify(data["content"])
					weatherWarning_ws(weather_ws);
				}
				//測站
				if(data["type"] == "pga"){
					console.log(data["content"])
					let content = JSON.stringify(data["content"])
					pgaupdate_async_ws(content)
				}
				//要求公鑰 並嘗試登入
				if(data["type"] == "key"){
					//publicKey =crypto.createPublicKey(data["key"]);
					publicKey = data["key"]; 
					let verifyKey_encrypted = crypto.publicEncrypt(publicKey,Buffer.from(verifyKey,'utf8')).toString('base64');
					let sendtext = JSON.stringify({"request":"verify","key":verifyKey_encrypted});
					socket.send(sendtext);
				}
				if(data["type"] == "login"){
					let login_status = data["status"];
					if(login_status == "success"){
						console.log("logged in");
						storage.setItem('login_user',data["user"]);
					}else{
						console.log("login failed");
						storage.setItem('login_user',"");
						showLogin();
					}
				}
			};
			socket.onclose = () => {
				document.getElementById("websocket_status").innerHTML = "離線";
				document.getElementById("websocket_status").style.color = "red";
				ws_connect();
			}
		}
		//更新測站列表清單(用於測站波型選單)
		function updateStaList(){
			try{
				XHR3.open('GET',server_url+':8787/PGA',false);
				//http://RFEQSERVER.myqnapcloud.com:8787/PGA
				XHR3.send(null);
				if(XHR3.status ==200){			
						let pga_list = XHR3.responseText;
						let shakealert = false;
						pga_list = JSON.parse(pga_list)
						if(true){
							pga_list = pga_list["data"];
							for(i = 0;i < pga_list.length;i++){
								let id = pga_list[i]["id"];
								let name = pga_list[i]["name"];
								let cname = pga_list[i]["cname"];
								RF_stations[id] = {"cname":cname,"name":name}
							}
						}
						CanvasStaListUpdate(1);
						CanvasStaListUpdate(2);
						CanvasStaListUpdate(3);
						CanvasStaListUpdate(4);
						changeWaveSelectedSta();
						document.querySelector('.disconnected').style.display = "none";
				}else{
					//document.querySelector('.disconnected').style.display = "block";
					updateStaList()
				}
			}catch(error){
				//document.querySelector('.disconnected').style.display = "block";
				setTimeout(updateStaList,1000);
			}
		}



/*----------main----------*/
		document.getElementById("loading_text").innerHTML = "正在取得測站列表...";
		updateStaList();
		document.getElementById("loading_text").innerHTML = "正在校正時間...";
		ntp();
		timeUpdate();
		if(enable_wave != "false"){
			wave_update();
		}else{
			document.getElementById("wave").style.display = "none";
		}
		document.getElementById("loading_text").innerHTML = "正在連線到websocket伺服器...";
		ws_connect();