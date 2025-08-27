
const button = document.getElementById('cw-button');

// --- 用户独特频率设定 ---
// 为当前用户生成一个在 400Hz 到 800Hz 之间的随机频率
const myFrequency = Math.random() * 400 + 400;
console.log(`My frequency is: ${myFrequency.toFixed(2)} Hz`);

// --- WebSocket 初始化 ---
const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
const ws = new WebSocket(`${wsProtocol}//${window.location.host}`);

// --- Web Audio API 初始化 ---
let audioContext;
let oscillator;
let gainNode;
let panner;

// 管理来自其他用户的声音, key是频率，value是{oscillator, gainNode, panner}
const activeSounds = {}; 

function setupAudio() {
    if (!audioContext) {
        try {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.error('Web Audio API is not supported in this browser');
            alert('Web Audio API is not supported in this browser');
        }
    }
}

// --- 音频播放/停止函数 ---
function playTone(frequency, pan, isSelf = false) {
    if (!audioContext) return;

    // 如果是别人发出的声音，并且这个声音已在播放，则忽略
    if (!isSelf && activeSounds[frequency]) {
        return;
    }

    const osc = audioContext.createOscillator();
    const gn = audioContext.createGain();
    const pn = audioContext.createStereoPanner();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(frequency, audioContext.currentTime);
    pn.pan.setValueAtTime(pan, audioContext.currentTime);
    gn.gain.setValueAtTime(0, audioContext.currentTime);
    gn.gain.linearRampToValueAtTime(0.5, audioContext.currentTime + 0.01);

    osc.connect(pn).connect(gn).connect(audioContext.destination);
    osc.start();

    if (isSelf) {
        oscillator = osc; // 保存自己的振荡器引用
        gainNode = gn;
    } else {
        activeSounds[frequency] = { oscillator: osc, gainNode: gn, panner: pn };
    }
}

function stopTone(frequency, isSelf = false) {
    let sound;
    if (isSelf) {
        sound = { gainNode: gainNode, oscillator: oscillator };
    } else {
        sound = activeSounds[frequency];
    }

    if (sound && sound.gainNode && sound.oscillator) {
        // Use an exponential ramp for a smoother fade-out.
        // The sound will decay exponentially, which is more natural.
        sound.gainNode.gain.setTargetAtTime(0, audioContext.currentTime, 0.015);
        
        // We schedule the oscillator to stop well after the sound has faded to silence.
        sound.oscillator.stop(audioContext.currentTime + 0.1);
        
        if (isSelf) {
            oscillator = null;
            gainNode = null;
        } else {
            delete activeSounds[frequency];
        }
    }
}

// --- WebSocket 通信 ---
ws.onopen = () => console.log('Connected to WebSocket server');
ws.onclose = () => console.log('Disconnected from WebSocket server');
ws.onerror = (error) => console.error('WebSocket error:', error);

ws.onmessage = (event) => {
    try {
        const data = JSON.parse(event.data);
        if (data.frequency) {
            // 根据频率计算声像: 400Hz -> -1 (左), 600Hz -> 0 (中), 800Hz -> 1 (右)
            const pan = (data.frequency - 600) / 200;
            
            if (data.action === 'start') {
                playTone(data.frequency, pan, false);
            } else if (data.action === 'stop') {
                stopTone(data.frequency, false);
            }
        }
    } catch (e) {
        console.error('Error parsing message:', e);
    }
};

const sendMessage = (message) => {
    if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(message));
    }
};

// --- 事件监听器 ---
let isPlayingSelf = false; // 状态锁，防止事件冲突

function handleMouseDown() {
    if (isPlayingSelf) return; // 如果已在播放，则不执行任何操作
    isPlayingSelf = true;

    if (!audioContext) {
        setupAudio();
    }
    if (audioContext) {
        playTone(myFrequency, 0, true); // 自己的声音总是在中间
        sendMessage({ action: 'start', frequency: myFrequency });
    }
}

function handleMouseUp() {
    if (!isPlayingSelf) return; // 如果已停止，则不执行任何操作
    isPlayingSelf = false;

    stopTone(myFrequency, true);
    sendMessage({ action: 'stop', frequency: myFrequency });
}

button.addEventListener('mousedown', handleMouseDown);
button.addEventListener('mouseup', handleMouseUp);
button.addEventListener('mouseleave', () => {
    if (button.matches(':active')) {
        handleMouseUp();
    }
});

// --- 触摸事件监听器 ---
button.addEventListener('touchstart', (e) => {
    e.preventDefault(); // 阻止浏览器将触摸模拟成鼠标点击，避免触发两次
    handleMouseDown();
});

button.addEventListener('touchend', (e) => {
    e.preventDefault();
    handleMouseUp();
});

button.addEventListener('touchcancel', (e) => {
    e.preventDefault(); // 在触摸中断时也停止声音
    handleMouseUp();
});
