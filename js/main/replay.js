replay_mode = false;
replay_data = {}
replay_timer = 0;
async function fetchReplayData(time) {
    try {
        const response = await axios.get('http://rfeqserver.myqnapcloud.com:8787/replayFile?time='+time.toString()); 
        const data = response.data;
        replay_data = JSON.parse(data)
    } catch (error) {
        console.error('回放請求出錯:', error);
    }
}

function replay(time){
    replay_mode = true;
    replay_timer = 0;
    replay_interval = setInterval(async function(){
        if(!replay_mode){//其他程式強制結束回放
            clearInterval(replay_interval)
        }
        replay_timer = replay_timer + 1;

        await fetchReplayData(time);

        if(replay_timer >= 180){
            replay_mode = false;
            clearInterval(replay_interval)
        }
        time = time + 1;
    },1000)
}