
export const Flasher = {
    state: false,
    flashControl: true,
    listeners: new Set(),

    update(){
        if(this.flashControl){
            this.state = !this.state
        }else{
            this.state = false;
        }
        this.notify();
		return this.state;
	},
    start(){
        this.flashControl = true;
        console.log("[PGA]Flasher start");
    },
    stop(){
        this.flashControl = false;
        console.log("[PGA]Flasher stop");
    },
    subscribe(fn){
        this.listeners.add(fn);
        // 回傳 unsubscribe，方便解除
        return () => this.listeners.delete(fn);
    },
    notify(){
        for(const fn of this.listeners){
            fn(this.state);
        }
    }
};
setInterval(
    () => {
        Flasher.update();
    },
    500
)

export class pgaManager{
    constructor(map, leaflet, { onStationSelect, onShindoReport } = {}){
        this.map = map;
        this.L = leaflet;
        //this.mapRenderer = new pgaMapRenderer(this.map, this.L);
        this.ui = new pgaUI();
        this.stationList = new Map();
        this.prevShakealert = false;
        this.shindoReport = null;
        this.shakealert = false;
        this.onStationSelect = onStationSelect;
        this.onShindoReport = onShindoReport;
    }

    handle(pga, now){
        this.prevShakealert = this.shakealert;
        this.shakealert = !!pga.shake_alert;

        //----------建立速報----------//
        if (!this.prevShakealert && this.shakealert) {
            this.shindoReport = new ShindoReport(now, {
                onFinish: this.onShindoReport
            });
        }

        //----------結算速報----------//
        if (this.prevShakealert && !this.shakealert && this.shindoReport) {
            this.shindoReport.finish();
            this.shindoReport = null;
        }

        let station_count = 0;
        let seenIds = new Set();		
        //----------遍歷每台測站----------//
        for (let s of pga.data) {
            let stationData = {
                id: s["id"],
                name: s["name"],
                cname: s["cname"],
                lat: parseFloat(s["lat"]),
                lon: parseFloat(s["lon"]),
                pga: parseFloat(s["pga"]),
                shindo: s["shindo_15"],
                pga_origin: parseFloat(s["pga_origin"]),
                timestamp: s["timestamp"],
                isOnline: true
            };
            // 判斷是否離線
            if (Math.abs(now - stationData.timestamp) >= 5000) {
                stationData.pga = 0;
                stationData.shindo = "0";
                stationData.isOnline = false;
            } else {
                station_count++;
            }

            seenIds.add(stationData.id);

            // 判斷是否是新測站
            if (!this.stationList.get(stationData.id)) {
                this.stationList.set(
                    stationData.id,
                    {
                        id: stationData.id,
                        station: new Station(
                            this.map,
                            this.L,
                            stationData,
                            this.shakealert,
                            {
                                onSelect: (name) => {
                                    this.onStationSelect?.(name)
                                }
                            }
                        )
                    }
                );
            }

            const station = this.stationList.get(stationData.id);
            station.station.update(stationData, this.shakealert);

            // 更新震度速報
            if (this.shakealert && this.shindoReport) {
                this.shindoReport.updateStation(
                    stationData,
                    this.ui.shindo2float.bind(this.ui)
                );
            }
        }

        //----------移除未出現在本次資料的測站----------//
        for (let id of this.stationList.keys()) {
            if (!seenIds.has(id)) {
                const station = this.stationList.get(id);
                station.remove();
                stationList.delete(id);
            }
        }
    }

    setShindoThreshold(shindo){
        if(shindo){
            this.ui.shindoAudioThreshold = shindo;
            console.log("[PGA]shindo threshold set ",shindo)
        }
    }
}

class Station{
    constructor(map, L, stationData, shakealert, { onSelect } = {}){
        this.stationData = stationData;
        this.mapRenderer = new pgaMapRenderer(map,L, {
            onSelect
        });
        this.mapRenderer.create(stationData, shakealert);
    }
    
    update(stationData, shakealert){
        this.stationData = stationData;
        this.mapRenderer.update(stationData, shakealert);
    }

    remove(){
        this.mapRenderer.remove();
        this.mapRenderer = null;
    }
}
class pgaMapRenderer{
    constructor(map, leaflet, { onSelect } = {}){
        this.map = map;
        this.L = leaflet;
        this.marker = null;
        this.circle = null;
        this.onSelect = onSelect;

        this.unsubscribeFlasher = Flasher.subscribe(
            (state) => this.onFlashUpdate(state)
        );
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

    }
    create(stationData, shakealert){
        const { id, name, lat, lon, pga, shindo, pga_origin, cname, isOnline } = stationData;
        let cusicon = this.getStationIcon(pga, shindo, shakealert, isOnline)
        let opacity = 1;
		let toolTip = `<div>${name}</div>
                    <div>${cname}</div>
                    <div>PGA(原始): ${pga_origin}</div>
                    <div>PGA(濾波): ${pga}</div>
                    <div>震度: ${shindo}</div>`
        // 建立 circle
        this.circle = L.circle([lat, lon], {
                    radius: 0,
                    color: this.shindo_color[shindo],
                    fillOpacity: opacity,
					opacity: opacity
        }).addTo(this.map);

		if(!isOnline){
			opacity = 0.3;
			toolTip = `<div>${name}</div>
            <div>${cname}</div>
            <div>已斷線</div>`
		}

        // 建立 marker
        this.marker = this.L.marker([lat, lon], {
            title: name,
            icon: cusicon
        }).bindTooltip(toolTip).addTo(this.map).setOpacity(opacity);

        this.marker.on('click', () => {
            this.onSelect?.(name);
        });
    }
    update(stationData, shakealert){
        const { id, name, lat, lon, pga, shindo, pga_origin, cname, isOnline } = stationData;
        let cusicon = this.getStationIcon(pga, shindo, shakealert, isOnline)
        let opacity = 1;
		let toolTip = `<div>${name}</div>
                    <div>${cname}</div>
                    <div>PGA(原始): ${pga_origin}</div>
                    <div>PGA(濾波): ${pga}</div>
                    <div>震度: ${shindo}</div>`
        

		if(!isOnline){
			opacity = 0.3;
			toolTip = `<div>${name}</div>
            <div>${cname}</div>
            <div>已斷線</div>`
		}

        this.marker.setIcon(cusicon);
        this.marker.setLatLng([lat, lon]);
        this.marker.setTooltipContent(toolTip);
        this.marker.setOpacity(opacity);
        
        this.circle.setLatLng([lat, lon]);
        //this.circle.setRadius(circleRadius);
        this.circle.setStyle({ color: this.shindo_color[shindo] });
        this.circle.setStyle({opacity: opacity, fillOpacity: opacity});
    }

    remove(){
        this.map.removeLayer(this.marker);
        this.map.removeLayer(this.circle);
        this.unsubscribeFlasher?.();
    }

    onFlashUpdate(state){
        if(!this.circle || !this.shakealert) return;
        this.circle.setRadius(state ? 20000 : 0);
    }

    getStationIcon(pga, shindo, shakealert, isOnline, size = 10) {
        let iconUrl;

        if(!isOnline){
            iconUrl = 'shindo_icon/disconnected.png';
            size = 7;
        }else{
            if (shindo == '0' || !shakealert) {
                if (pga <= 1) iconUrl = 'shindo_icon/pga0.png';
                else if (pga <= 1.3) iconUrl = 'shindo_icon/pga1.png';
                else if (pga <= 1.4) iconUrl = 'shindo_icon/pga2.png';
                else iconUrl = 'shindo_icon/pga3.png';
            } else {
                iconUrl = 'shindo_icon/' + shindo + '.png';
                size = 20; // 震度 icon 比較大
            }
        }

        return L.icon({
            iconUrl,
            iconSize: [size, size]
        });
    }
}
class pgaUI{
    constructor(){
        this.selected = null;
        this.maxShindo = "0";
        this.shindoAudio = {
            "1": new Audio("./audio/tw/shindo/1.mp3"),
            "2": new Audio("./audio/tw/shindo/2.mp3"),
            "3": new Audio("./audio/tw/shindo/3.mp3"),
            "4": new Audio("./audio/tw/shindo/4.mp3"),
            "5-": new Audio("./audio/tw/shindo/5-.mp3"),
            "5+": new Audio("./audio/tw/shindo/5+.mp3"),
            "6-": new Audio("./audio/tw/shindo/6-.mp3"),
            "6+": new Audio("./audio/tw/shindo/6+.mp3"),
            "7": new Audio("./audio/tw/shindo/7.mp3")
        }
        this.shindoAudioThreshold = "0";
    }

    update(pga, selected, now){
        // 找最大震度
        let maxShindo = "0";
        let station_count = 0;
        let topStations = [];
        let shakealert = pga.shake_alert;
        for (let s of pga.data) {
            let stationData = {
                id: s["id"],
                name: s["name"],
                cname: s["cname"],
                lat: parseFloat(s["lat"]),
                lon: parseFloat(s["lon"]),
                pga: parseFloat(s["pga"]),
                shindo: s["shindo_15"],
                pga_origin: parseFloat(s["pga_origin"]),
                timestamp: s["timestamp"],
                isOnline: true
            };
            if (Math.abs(now - stationData.timestamp) >= 5000) {
                stationData.pga = 0;
                stationData.shindo = "0";
                stationData.isOnline = false;
            } else {
                station_count++;
            }

            // 本站震度大於當前最大震度
            if(this.shindo2float(maxShindo) < this.shindo2float(stationData.shindo)){
                maxShindo = stationData.shindo;
            }

            // 收集在線且震度 > 0 的測站
            if (stationData.isOnline && this.shindo2float(stationData.shindo) > 0) {
                topStations.push({
                    cname: stationData.cname,
                    shindo: stationData.shindo
                });
            }
            // 顯示常駐測站
			if(stationData.name == selected){
                document.getElementById("selected_name").innerHTML = stationData.name;
				document.getElementById("selected_pgao").innerHTML = stationData.pga_origin;
				document.getElementById("selected_pga").innerHTML = stationData.pga;
				document.getElementById("selected_shindo").innerHTML = "<img src='shindo_icon/selected/"+stationData.shindo.toString()+".png' style='width:50px'>"
			}
        }

        // 顯示最大震度
        document.getElementById("max_shindo_img").innerHTML = `
        <img src='shindo_icon/selected/${maxShindo}.png' style='width: 90px;height: 90px;'>
        `

        //最大震度音效(當最大震度上升時)
        if(this.shindo2float(maxShindo) > this.shindo2float(this.maxShindo) && shakealert){
            if(this.shindo2float(maxShindo) >= this.shindo2float(this.shindoAudioThreshold)){
                this.shindoAudio[maxShindo].play();
            }
        }
        this.maxShindo = maxShindo;

        // 顯示測站數
        document.getElementById('stations_count_online').innerHTML = station_count.toString();

        //若shakealert 顯示前六名測站
        if(shakealert){
            topStations.sort((a, b) => {
                return this.shindo2float(b.shindo) - this.shindo2float(a.shindo);
            });

            // 取前六名
            topStations = topStations.slice(0, 6);

            if(this.shindo2float(maxShindo) >= 4){
                document.getElementById("RF_status").innerHTML = "強震檢測";
                document.getElementById("RF_status").style.backgroundColor = "red";
            }else{
                document.getElementById("RF_status").innerHTML = "搖晃檢測";
                document.getElementById("RF_status").style.backgroundColor = "orange";
            }

            // 顯示前六名測站
            let htmlText = ""
            let first = true
            for(const station of topStations){
                if(first){
                    htmlText += `<div class="RF_item">
                                <img src='shindo_icon/selected/${station.shindo}.png' height='60px'>
                                <h3 style='color: white; margin-left: 5px;'>${station.cname}</h3>
                            </div>`;
                    first = false;
                }else{
                    htmlText += `<div class="RF_item">
                                <img src='shindo_icon/selected/${station.shindo}.png' height='30px'>
                                <h5 style='color: white; margin-left: 5px;'>${station.cname}</h5>
                            </div>`;
                }
            }
            document.getElementById("RF_list_1").innerHTML = htmlText;
        }else{
            document.getElementById("RF_status").innerHTML = "";
            document.getElementById("RF_status").style.backgroundColor = "#3c3c3c";
            document.getElementById("RF_list_1").innerHTML = "";
        }
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
    formatShindoTitle(shindo) {
        const map = {
            "7": "7級",
            "6+": "6強",
            "6-": "6弱",
            "5+": "5強",
            "5-": "5弱",
            "4": "4級",
            "3": "3級",
            "2": "2級",
            "1": "1級"
        };
        return map[shindo] || shindo;
    }
}
class ShindoReport {
    constructor(startTime, { onFinish } = {}) {
        this.startTime = startTime;
        // Map<stationId, { name, cname, maxShindo }>
        this.stationMax = new Map();
        this.onFinish = onFinish;
    }

    updateStation(stationData, shindo2floatFn) {
        if (!stationData.isOnline) return;

        const current = shindo2floatFn(stationData.shindo);
        if (current <= 0) return;

        const prev = this.stationMax.get(stationData.id);

        if (!prev || current > shindo2floatFn(prev.maxShindo)) {
            this.stationMax.set(stationData.id, {
                id: stationData.id,
                name: stationData.name,
                cname: stationData.cname,
                maxShindo: stationData.shindo
            });
        }
    }

    finish() {
        console.log("[pga]===== 震度速報結算 =====");
        console.log(`[pga]開始時間: ${this.startTime}`);

        for (const station of this.stationMax.values()) {
            console.log(
                `[pga][${station.id}] ${station.cname} 最大震度 ${station.maxShindo}`
            );
        }
        this.onFinish?.(Array.from(this.stationMax.values()));

        console.log("[pga]===== 震度速報結束 =====");
    } 
}