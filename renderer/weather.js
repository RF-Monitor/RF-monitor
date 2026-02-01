export class WeatherManager{
    constructor(geojson_list, locations, map, L){
        this.geojson_list = geojson_list;
        this.locations = locations;
        this.map = map;
        this.L = L;
        this.mapRenderer = new WeatherMapRenderer(this.geojson_list, this.locations, this.map, this.L)

		this.enableTyAnalysis = true;
    	this.lastTyphoonInfo = null;
    }
    updateWeather(data){
        this.mapRenderer.updateWeather(data)
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
		let warnings = data
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
  				this.layer.addLayer(this.L.geoJSON(this.geojson_list[name], { color: "yellow",width:2,fillOpacity: 0.5 ,pane:"weather_warning_layers"}).bindPopup(popupContent));
			}
		}
    }
    updateTyphoon(typhooninfo, enable_ty_analysis = this.enableTyAnalysis){
		this.lastTyphoonInfo = typhooninfo;
  		this.enableTyAnalysis = !!enable_ty_analysis;
		try {
			this.typhoon_layer.clearLayers();

			for (let i = 0; i < typhooninfo.length; i++) {
			const { name, cwbname, route } = typhooninfo[i];
			const routeline = [];
			let future = false;

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
				movingprediction
				} = route[j];

				let radius = circleof15ms_radius;
				let popupContent = "";

				// ---- 颱風等級 ----
				let typhoonName = "";
				const ws = parseFloat(windspeed);

				if (ws <= 17.2) {
				typhoonName = "熱低壓";
				} else if (ws <= 32.6) {
				typhoonName = "輕度颱風" + cwbname;
				} else if (ws <= 50.9) {
				typhoonName = "中度颱風" + cwbname;
				} else {
				typhoonName = "強烈颱風" + cwbname;
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