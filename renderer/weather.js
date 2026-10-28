export class WeatherManager{
    constructor(geojson_list, locations, map, L){
        this.geojson_list = geojson_list;
        this.locations = locations;
        this.map = map;
        this.L = L;
        this.mapRenderer = new WeatherMapRenderer(this.geojson_list, this.locations, this.map, this.L)
		this.ui = new WeatherUI();

		this.enableTyAnalysis = true;
    	this.lastTyphoonInfo = null;
    }
    updateWeather(data){
        this.mapRenderer.updateWeather(data)
		this.ui.updateWeather(data);
    }
    updateTyphoon(data,enable_ty_analysis){
		this.mapRenderer.updateTyphoon(data, enable_ty_analysis);
    }
	setEnableTyAnalysis(enable) {
		this.mapRenderer.setEnableTyAnalysis(enable);
	}
}

class WeatherMapRenderer{
    constructor(geojson_list, locations, map, L){
        this.geojson_list = geojson_list;
        this.locations = locations;
        this.map = map;
        this.L = L;
        this.layer = this.L.layerGroup().addTo(this.map);
		this.typhoon_layer = this.L.layerGroup().addTo(this.map);
    }
    updateWeather(data){
        this.layer.clearLayers();
		let warnings = data;
		for(let i = 0;i < warnings.length;i++){
			let name = warnings[i]["name"];
			let lat = this.locations["country"][name]["lat"];
			let lon = this.locations["country"][name]["lon"];
			let rain = warnings[i]["rain"];
			let heavy_rain = warnings[i]["heavy_rain"];
			let super_heavy_rain = warnings[i]["super_heavy_rain"];
			let extreme_heavy_rain = warnings[i]["extreme_heavy_rain"];
			let foggy = warnings[i]["foggy"];
			let wind = warnings[i]["wind"];
			let color = "";
			let fillColor = "";
			let fillOpacity = 0;
			if(!(rain == 0 && heavy_rain == 0 && super_heavy_rain == 0 && extreme_heavy_rain == 0 && foggy == 0 && wind == 0)){
				let popupContent = "<p>"+name + "</p>";
				if(wind != 0){
					popupContent = popupContent + "<p>陸上強風特報</p>";
				}	
				if(foggy != 0){
					popupContent = popupContent + "<p>濃霧特報</p>";
					color = "white";
					fillColor = "white";
					fillOpacity = 0.5;
				}
				if(rain != 0){
					popupContent = popupContent + "<p>大雨特報</p>";
					color = "yellow";
					fillColor = "yellow";
					fillOpacity = 0.5;
				}
				if(heavy_rain != 0){
					popupContent = popupContent + "<p>豪雨特報</p>";
					color = "orange";
					fillColor = "orange";
					fillOpacity = 0.5;
				}
				if(super_heavy_rain != 0){
					popupContent = popupContent + "<p>大豪雨特報</p>";
					color = "red";
					fillColor = "red";
					fillOpacity = 0.5;
				}
				if(extreme_heavy_rain != 0){
					popupContent = popupContent + "<p>超大豪雨特報</p>";
					color = "purple";
					fillColor = "purple";
					fillOpacity = 0.5;
				}
											
  				this.layer.addLayer(
					this.L.geoJSON(
						this.geojson_list[name], 
						{ 
							color: color,
							fillColor: fillColor,
							weight:2,
							fillOpacity: fillOpacity,
							pane:"weather_warning_layers"
						}
					).bindPopup(popupContent)
				);
			}
			if(wind != 0){
				this.layer.addLayer(
					this.L.geoJSON(
						this.geojson_list[name], 
						{ 
							color: "blue",
							fillColor: "white",
							weight:3,
							fill: false,
							pane:"weather_warning_layers2",
							interactive: false
						}
					)
				);
			}
		}
    }
    updateTyphoon(typhooninfo, enable_ty_analysis = this.enableTyAnalysis){
		this.lastTyphoonInfo = typhooninfo;
  		this.enableTyAnalysis = !!enable_ty_analysis;
		try {
			this.typhoon_layer.clearLayers();

			// UI隱藏或顯示
			if(typhooninfo.length > 0){
				document.getElementById("typhoon_section").style.display = "flex";
			}else{
				document.getElementById("typhoon_section").style.display = "none";
			}
			document.getElementById("typhoon_info_list").innerHTML = "";

			for (let i = 0; i < typhooninfo.length; i++) {
				const { name, cwbname, route, tyno, tdno } = typhooninfo[i];
				const routeline = [];
				let future = false;
				const current = {}

				for (let j = 0; j < route.length; j++) {
					let circleColor = "#5A5AAD";

					const {
						lat,
						lon,
						time,
						circleof15ms_radius,
						radiusof70percentprobability,
						windspeed,
						gustspeed,
						movingprediction,
						movingdirection,
						movingspeed,
						pressure
					} = route[j];

					let radius = circleof15ms_radius;
					let popupContent = "";

					// ---- 颱風等級 ----
					let typhoonName = "";
					const ws = parseFloat(windspeed);

					if (ws <= 17.2) {
						typhoonName = "熱低壓";
					} else if (ws <= 32.6) {
						typhoonName = "輕度颱風 " + cwbname;
					} else if (ws <= 50.9) {
						typhoonName = "中度颱風 " + cwbname;
					} else {
						typhoonName = "強烈颱風 " + cwbname;
					}

					popupContent = (cwbname === "0")
					? "<p>熱低壓</p>"
					: `<b><p>${typhoonName}</p></b>`;

					// ---- 未來預測 ----
					if (future || radiusof70percentprobability !== "0") {
						popupContent += `<p>未來預測</p><p>風速${windspeed}m/s</p><p>陣風${gustspeed}m/s</p>`;
						circleColor = "gray";
						radius = radiusof70percentprobability;
					}
					// ---- 最新位置 ----
					else if (movingprediction !== "0") {
						current.lat = lat;
						current.lon = lon;
						current.movingdirection = movingdirection;
						current.windspeed = windspeed;
						current.gustspeed = gustspeed;
						current.movingspeed = movingspeed;
						current.pressure = pressure;
						current.time = time;
						current.name = typhoonName;
						
						popupContent += `<p>${time}[最新位置]</p><p>風速${windspeed}m/s</p><p>陣風${gustspeed}m/s</p>`;
						circleColor = "orange";
						future = true;

						const tyicon = this.L.icon({
							iconUrl: "shindo_icon/typhoon.png",
							iconSize: [20, 20]
						});

						this.typhoon_layer.addLayer(
							this.L.marker([lat, lon], { icon: tyicon }).bindPopup(popupContent)
						);
					}
					// ---- 歷史路徑 ----
					else {
						popupContent += `<p>${time}</p><p>風速${windspeed}m/s</p><p>陣風${gustspeed}m/s</p>`;
						if (!this.enableTyAnalysis) radius = 0;
					}

					const typhoon_circle = this.L.circle([lat, lon], {
						color: circleColor,
						radius: radius * 1000
					}).bindPopup(popupContent);

					routeline.push([lat, lon]);
					this.typhoon_layer.addLayer(typhoon_circle);
					
				}

				this.typhoon_layer.addLayer(
					this.L.polyline(routeline, { color: "white", weight: 1 })
				);

				// ---- 顯示颱風資訊 ----
				
				const htmlText = `<article class="typhoon-card ${tyno ? "" : "typhoon-card-td"}">
					<div class="typhoon-card-heading">
						<div>
							<span class="typhoon-category">${tyno ? "颱風" : "熱帶性低氣壓"}編號 ${tyno ? tyno : tdno}</span>
							<h3>${current.name} <small>${name}</small></h3>
						</div>
					</div>
					<div class="typhoon-fix-time">最後更新時間：${current.time}</div>
					<div class="typhoon-stats"><div><span>中心位置</span><strong>${current.lat}・${current.lon}</strong></div><div><span>移向／移速</span><strong>${current.movingdirection}・${current.movingspeed} km/h</strong></div><div><span>近中心最大風速</span><strong>${current.windspeed} m/s</strong></div><div><span>近中心最大陣風</span><strong>${current.gustspeed} m/s</strong></div><div><span>中心氣壓</span><strong>${current.pressure} hPa</strong></div></div>
					</article>`
				document.getElementById("typhoon_info_list").innerHTML += htmlText;
			}

		} catch (err) {
			console.error("[typhoon_update] fetch failed:", err);
		}
    }
	setEnableTyAnalysis(enable) {
		this.enableTyAnalysis = !!enable;

		// 若目前有颱風資料，直接重畫
		if (this.lastTyphoonInfo) {
			this.updateTyphoon(this.lastTyphoonInfo);
		}
	}
}

class WeatherUI{
	constructor(){
		this.typhoonSection = document.getElementById("typhoon_section");
		this.typhoonInfoList = document.getElementById("typhoon_info_list");
		this.weatherWarningList = document.getElementById("weather_warning_list");

		this.weatherList = {
			rain: [],
			heavy_rain: [],
			super_heavy_rain: [],
			extreme_heavy_rain: [],
			foggy: [],
			wind: []
		}

		this.weatherListCountiesElements = {
			rain: document.getElementById("weather_rain_counties"),
			heavy_rain: document.getElementById("weather_heavy_rain_counties"),
			super_heavy_rain: document.getElementById("weather_super_heavy_rain_counties"),
			extreme_heavy_rain: document.getElementById("weather_extreme_heavy_rain_counties"),
			foggy: document.getElementById("weather_foggy_counties"),
			wind: document.getElementById("weather_wind_counties")
		}

		this.weatherListCardElements = {
			rain: document.getElementById("weather_rain"),
			heavy_rain: document.getElementById("weather_heavy_rain"),
			super_heavy_rain: document.getElementById("weather_super_heavy_rain"),
			extreme_heavy_rain: document.getElementById("weather_extreme_heavy_rain"),
			foggy: document.getElementById("weather_foggy"),
			wind: document.getElementById("weather_wind")
		}
		this.weatherListUpdatedElements = {
			rain: document.getElementById("weather_rain_updated"),
			heavy_rain: document.getElementById("weather_heavy_rain_updated"),
			super_heavy_rain: document.getElementById("weather_super_heavy_rain_updated"),
			extreme_heavy_rain: document.getElementById("weather_extreme_heavy_rain_updated"),
			foggy: document.getElementById("weather_foggy_updated"),
			wind: document.getElementById("weather_wind_updated")
		}
	}
	updateWeather(data){
		for(const key in this.weatherList){
			this.weatherList[key] = [];
		}
		for(const county of data){
			let name = county.name;
			let rain = county.rain;
			let heavy_rain = county.heavy_rain;
			let super_heavy_rain = county.super_heavy_rain;
			let extreme_heavy_rain = county.extreme_heavy_rain;
			let foggy = county.foggy;
			let wind = county.wind;
			if(wind != 0){
				this.weatherList.wind.push(name);
			}	
			if(foggy != 0){
				this.weatherList.foggy.push(name);
			}
			if(rain != 0){
				this.weatherList.rain.push(name);
			}
			if(heavy_rain != 0){
				this.weatherList.heavy_rain.push(name);
			}
			if(super_heavy_rain != 0){
				this.weatherList.super_heavy_rain.push(name);
			}
			if(extreme_heavy_rain != 0){
				this.weatherList.extreme_heavy_rain.push(name);
			}
		}
		for(const key in this.weatherList){
			if(this.weatherList[key].length > 0){
				// Do something with the weather list
				this.weatherListCardElements[key].style.display = "block";
				this.weatherListCountiesElements[key].innerText = this.weatherList[key].join("、");
				this.weatherListUpdatedElements[key].innerText = new Date().toLocaleString();
			}else{
				this.weatherListCardElements[key].style.display = "none";
			}
		}
	}
}