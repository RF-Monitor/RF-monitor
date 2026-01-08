import { AudioQueue } from "./utils/audioQueue.js";

export class TsunamiManager {
    constructor({ openExternal }) {
        this.openExternal = openExternal;
        this.timer = null;
        this.audioQueue = new AudioQueue();

        this.coastlineMap = {
            "北部沿海地區": "tsunami_N",
            "東北沿海地區": "tsunami_EN",
            "海峽沿海地區": "tsunami_W",
            "東部沿海地區": "tsunami_E",
            "東南沿海地區": "tsunami_ES",
            "西南沿海地區": "tsunami_WS"
        };

        this.colorMap = {
            "綠色": "yellowgreen",
            "黃色": "yellow",
            "橙色": "orange",
            "紅色": "red"
        };
    }

    /**
     * @param {Object} data - 海嘯資料
     * @param {number} now  - 外部已算好的 timestamp (ms)
     */
    handle(data, now) {
        const createdAt = new Date(data.created_at).getTime();

        // 有效期：一天
        if (now - createdAt >= 86400000) {
            this.hide();
            return;
        }

        this.show();
        this.renderBaseInfo(data);
        this.renderColor(data);
        this.renderForecast(data);
        this.bindMoreInfo(data.web_url);
        this.playSound(data);
        this.resetTimer(createdAt, now);
    }

    show() {
        document.getElementById("tsunami").style.display = "block";
        document.getElementById("tsunami_forecast").style.display = "block";
    }

    hide() {
        document.getElementById("tsunami").style.display = "none";
    }

    renderBaseInfo(data) {
        document.getElementById("tsunami_reportNum").innerHTML = data.report_no;
        document.getElementById("tsunami_epicenter").innerHTML =
            data.epicenter_location.replace("　", "<br>");
        document.getElementById("tsunami_magnitude").innerHTML = data.magnitude;
        document.getElementById("tsunami_type").innerHTML = data.report_type;
    }

    renderColor(data) {
        const color = this.colorMap[data.report_color];
        document.getElementById("tsunami_color").style.backgroundColor = color;
        document.getElementById("tsunami_type_color").style.color =
            color === "yellow" ? "black" : "white";
    }

    renderForecast(data) {
        if (!data.forecast || data.forecast.length === 0) {
            document.getElementById("tsunami_forecast").style.display = "none";
            return;
        }

        for (const f of data.forecast) {
            const areaId = this.coastlineMap[f.area_name];
            if (!areaId) continue;

            document.getElementById(areaId).innerHTML = f.wave_height;
            document.getElementById(areaId + "_color").style.borderColor =
                this.colorMap[f.area_color];
        }
    }

    playSound(data) {
        const audioMap = {
            "海嘯警報": [
                "./audio/tw/tsunami/tsunami_warning.mp3",
                "./audio/tw/tsunami/tsunami_warning_released.mp3"
            ],
            "海嘯警訊": [
                "./audio/tw/tsunami/tsunami_warning.mp3",
                "./audio/tw/tsunami/tsunami_released.mp3"
            ],
            "海嘯消息": [
                "./audio/tw/tsunami/tsunami_info_released.mp3"
            ],
            "海嘯警報解除": [
                "./audio/tw/tsunami/tsunami_cleared.mp3"
            ],
            "海嘯報告": [
                "./audio/tw/tsunami/tsunami_cleared.mp3"
            ]
        };

        if (audioMap[data.report_type]) {
            this.audioQueue.play(audioMap[data.report_type]);
        }
    }

    bindMoreInfo(url) {
        document.getElementById("tsunami_moreInfo").onclick = () => {
            this.openExternal(url);
        };
    }

    resetTimer(createdAt, now) {
        if (this.timer) {
            clearTimeout(this.timer);
        }

        this.timer = setTimeout(() => {
            this.hide();
            this.timer = null;
        }, 86400000 - (now - createdAt));
    }
}
