export async function getInfoDistribution(id) {
    
    //console.log(id);
    id = id.replace("-", "");
    try {
        const res = await fetch(`http://rfeqserver.myqnapcloud.com:8787/reportDistribution?id=${encodeURIComponent(id)}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            }
        });

        if (!res.ok) {
            throw new Error(`HTTP ${res.status}`);
        }

        const info = await res.json();
        //console.log(info);

        // 只回傳或處理資料，不做任何 UI / 地圖操作
        return info;

    } catch (err) {
        console.error("fetch infoDistribution failed:", err);
        throw err;
    }
}
