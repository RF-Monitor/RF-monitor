export class AudioQueue {
    constructor({ volume = 1.0 } = {}) {
        this.volume = volume;
        this._queueId = 0;      // 用於中斷播放
        this._currentAudio = null;
    }

    async _playSingle(src, queueId) {
        return new Promise((resolve, reject) => {
            const audio = new Audio(src);
            this._currentAudio = audio;
            audio.volume = this.volume;

            const cleanup = () => {
                audio.onended = null;
                audio.onerror = null;
            };

            audio.onended = () => {
                cleanup();
                resolve();
            };

            audio.onerror = (e) => {
                cleanup();
                reject(e);
            };

            audio.play().catch(err => {
                cleanup();
                reject(err);
            });
        }).then(() => {
            // 若 queueId 已改變，表示被 stop() 中斷
            if (queueId !== this._queueId) {
                throw new Error("AudioQueue interrupted");
            }
        });
    }

    /**
     * 順序播放音效
     * @param {string[]} paths
     */
    async play(paths = []) {
        if (!Array.isArray(paths)) {
            throw new TypeError("AudioQueue.play expects an array");
        }

        const myQueueId = ++this._queueId;

        for (let i = 0; i < paths.length; i++) {
            if (myQueueId !== this._queueId) break;
            await this._playSingle(paths[i], myQueueId);
        }
    }

    /**
     * 立即中斷播放
     */
    stop() {
        this._queueId++;
        if (this._currentAudio) {
            this._currentAudio.pause();
            this._currentAudio.currentTime = 0;
            this._currentAudio = null;
        }
    }
}
