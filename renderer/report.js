var infoMapRenderer = null
var infoUI = null
class InfoMapRenderer{
    constructor(map, L){
        this.map = map;
        this.L = L;
        this.distributedLayer = this.L.layerGroup().addTo(this.map);
        this.shindo_icons = {
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
    }
    renderDistribution(distribution){
        // 清空舊資料
        this.distributedLayer.clearLayers();

        const info = distribution.info;
        const distributed = distribution.distributed;

        // 震央
        const epicenterLat = info.lat;
        const epicenterLon = info.lon;
        const epicenterName = info.epicenter;

        const epicenterIcon = this.L.icon({
            iconUrl: "./shindo_icon/epicenter_tw.png",
            iconSize: [30, 30]
        });

        this.L.marker([epicenterLat, epicenterLon], {
            icon: epicenterIcon,
            title: epicenterName,
            opacity: 1.0
        }).addTo(this.distributedLayer);

        // 震度分布
        for (const s of distributed) {
            const {
                name,
                lat,
                lon,
                shindo,
                pga_sum: pga,
                pgv_sum: pgv
            } = s;

            const shindoIcon = this.shindo_icons[shindo];
            const paneName = `shindo_icon_${shindo}`;

            // 確保 pane 存在（避免重疊層級錯亂）
            if (!this.map.getPane(paneName)) {
                this.map.createPane(paneName);
            }

            const tooltip =
                `<div>${name}</div>` +
                `<div>震度:${shindo}</div>` +
                `<div>PGA:${pga}</div>` +
                `<div>PGV:${pgv}</div>`;

            this.L.marker([lat, lon], {
                icon: shindoIcon,
                title: name,
                opacity: 1.0,
                pane: paneName
            })
            .bindTooltip(tooltip)
            .addTo(this.distributedLayer);
        }

        // 地圖移動
        this.map.panTo([epicenterLat, epicenterLon]);
        this.map.invalidateSize(true);
    }
}

export function mapRendererInitialize(map, L){
    infoMapRenderer = new InfoMapRenderer(map, L);
    infoUI = new InfoUI();
}

class InfoUI{
    constructor(){

    }
    update(distribution){
        let info = distribution;
        let cwbno = info["info"]["cwbNo"];
		let epicenter = info["info"]["epicenter"];
		let epicenter_lat = info["info"]["lat"];//float
		let epicenter_lon = info["info"]["lon"];//float
		let datetime = info["info"]["datetime"];
		let magnitude = info["info"]["magnitude"];
		let max_shindo = info["info"]["max_shindo"];
		let depth = info["info"]["depth"];
        //右側地震報告
		document.getElementById("epitime").innerHTML = datetime;
		document.getElementById("epicenter").innerHTML = epicenter;
		document.getElementById("lat").innerHTML = epicenter_lat;
		document.getElementById("lon").innerHTML = epicenter_lon;
		document.getElementById("magnitude").innerHTML = magnitude;
		document.getElementById("depth").innerHTML = depth;
		document.getElementById("shindo").innerHTML = max_shindo;
		document.getElementById("report_details").style.display = "block";
    }
}

let lastReports = null;

export function InfoUpdate_full_ws(earthquakeInfo, getDistributionFn, {onInitial, onUpdate} = {}) {
    console.log("running infoUpdate");
    //earthquakeInfo = JSON.parse(earthquakeInfo);

    let htmlText = '';
    let color = '';

    for (let i = 0; i < earthquakeInfo.length; i++) {
        const info = earthquakeInfo[i];
        const id = info.id;

        if (info.max_shindo == '1') {
            color = 'gray';
        } else if (info.max_shindo == '2') {
            color = '#0066CC';
        } else if (info.max_shindo == '3') {
            color = 'green';
        } else if (info.max_shindo == '4') {
            color = '#BAC000';
        } else if (info.max_shindo == '5-') {
            color = '#FF7F27';
        } else if (info.max_shindo == '5+') {
            color = '#ED1C24';
        } else if (info.max_shindo == '6-') {
            color = 'red';
        } else if (info.max_shindo == '6+') {
            color = '#A50021';
        } else if (info.max_shindo == '7') {
            color = 'purple';
        } else {
            color = '#63AA8B';
        }

        htmlText +=
            "<table id='" + id + "' border=0 cellpadding='0px' " +
            "style='background-color:" + color + "' class='earthquake_report'>" +
                "<tr>" +
                    "<td rowspan=3>" +
                        "<p style='color:white;font-size:60px' align='left'>" +
                            info.max_shindo +
                        "</p>" +
                    "</td>" +
                    "<td colspan=2>" +
                        "<strong><h4 style='color:white' align='left'>" +
                            info.epicenter +
                        "</h4></strong>" +
                    "</td>" +
                "</tr>" +
                "<tr>" +
                    "<td colspan=2>" +
                        "<h6 style='color:white' align='left'>" +
                            info.datetime +
                        "</h6>" +
                    "</td>" +
                "</tr>" +
                "<tr>" +
                    "<td>" +
                        "<h4 style='color:white' align='left'><strong>" +
                            info.magnitude +
                        "</strong></h4>" +
                    "</td>" +
                    "<td>" +
                        "<h4 style='color:white' align='right'>" +
                            info.depth +
                        "</h4>" +
                    "</td>" +
                "</tr>" +
            "</table>";
    }
    if (lastReports === null) {
        onInitial?.(earthquakeInfo);
    } else if (lastReports[0].id !== earthquakeInfo[0].id) {
        onUpdate?.(earthquakeInfo[0]);
    }
    if (htmlText !== '') {
        document.getElementById("earthquakeInfo").innerHTML = htmlText;
    }

    for (let i = 0; i < earthquakeInfo.length; i++) {
        const eqId = earthquakeInfo[i].id;

        document.getElementById(eqId).onclick = async () => {
            const distribution = await getDistributionFn(eqId);
            infoMapRenderer.renderDistribution(distribution);
            infoUI.update(distribution);
        };
    }
}
