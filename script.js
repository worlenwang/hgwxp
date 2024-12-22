document.addEventListener('DOMContentLoaded', function() {
    const canvas = document.getElementById('staff-canvas');
    const ctx = canvas.getContext('2d');
    const noteNameDisplay = document.getElementById('note-name');
    const solfegeDisplay = document.getElementById('solfege');
    const numberedDisplay = document.getElementById('numbered');

    // 音符数据，从上加一线(A4)开始向下排列到下加一线(C3)
    const notes = [
        { y: -1, name: 'A4', solfege: 'la', numbered: '6·', letter: 'A4', needLine: true },  // 上加一线
        { y: 0, name: 'G4', solfege: 'sol', numbered: '5·', letter: 'G4', needLine: false }, // 上加一间
        { y: 1, name: 'F4', solfege: 'fa', numbered: '4·', letter: 'F4', needLine: true },   // 第五线
        { y: 2, name: 'E4', solfege: 'mi', numbered: '3·', letter: 'E4', needLine: false },  // 第四间
        { y: 3, name: 'D4', solfege: 're', numbered: '2·', letter: 'D4', needLine: true },   // 第四线
        { y: 4, name: 'C4', solfege: 'do', numbered: '1·', letter: 'C4', needLine: false },  // 第三间
        { y: 5, name: 'B3', solfege: 'si', numbered: '7', letter: 'B3', needLine: true },    // 第三线
        { y: 6, name: 'A3', solfege: 'la', numbered: '6', letter: 'A3', needLine: false },   // 第二间
        { y: 7, name: 'G3', solfege: 'sol', numbered: '5', letter: 'G3', needLine: true },   // 第二线
        { y: 8, name: 'F3', solfege: 'fa', numbered: '4', letter: 'F3', needLine: false },   // 第一间
        { y: 9, name: 'E3', solfege: 'mi', numbered: '3', letter: 'E3', needLine: true },    // 第一线
        { y: 10, name: 'D3', solfege: 're', numbered: '2', letter: 'D3', needLine: false },  // 下加一间
        { y: 11, name: 'C3', solfege: 'do', numbered: '1', letter: 'C3', needLine: true }    // 下加一线
    ];

    let currentNote = null;
    let spacing = 20; // 基础间距

    function drawStaff() {
        // 设置canvas尺寸
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
        spacing = canvas.height / 18; // 调整为18等分，给上方留出更多空间

        // 清空画布
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // 绘制五线谱（从第一线到第五线）
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
            let y = spacing * (12 - i * 2); // 将整个五线谱向下移动
            ctx.moveTo(20, y);
            ctx.lineTo(canvas.width - 20, y);
        }
        ctx.lineWidth = 1;
        ctx.strokeStyle = '#000';
        ctx.stroke();

        // 如果有当前音符，绘制线和音符
        if (currentNote) {
            if (currentNote.needLine) {
                ctx.beginPath();
                ctx.moveTo(canvas.width/2 - spacing * 1.2, spacing * (currentNote.y + 3)); // 调整y偏移
                ctx.lineTo(canvas.width/2 + spacing * 1.2, spacing * (currentNote.y + 3));
                ctx.stroke();
            }
            drawNote(currentNote);
        }
    }

    function drawNote(note) {
        // 绘制音符（完美圆形）
        const radius = spacing * 0.7; // 使用统一的半径
        ctx.beginPath();
        ctx.ellipse(
            canvas.width/2,           // x坐标
            spacing * (note.y + 3),   // y坐标
            radius,                   // x半径
            radius,                   // y半径 - 与x半径相同，确保是圆形
            0, 0, Math.PI * 2
        );
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    // 添加触摸事件处理
    let touchStartY = 0;
    let touchTimeout;

    // 优化点击/触摸处理函数
    function handleInteraction(clientY, rect) {
        const y = clientY - rect.top;
        const clickedY = y / spacing - 3;
        
        // 增加点击容差范围
        const tolerance = spacing * 0.5; // 增加容差范围
        
        // 找到最近的音符
        let closestNote = null;
        let minDistance = Infinity;
        
        notes.forEach(note => {
            const noteY = spacing * (note.y + 3);
            const distance = Math.abs(y - noteY);
            if (distance < minDistance && distance < tolerance) {
                minDistance = distance;
                closestNote = note;
            }
        });
        
        if (closestNote) {
            currentNote = closestNote;
            drawStaff();
            
            // 更新显示信息
            noteNameDisplay.textContent = closestNote.letter;
            solfegeDisplay.textContent = closestNote.solfege;
            
            // 处理简谱显示
            const numberedNote = closestNote.numbered;
            if (numberedNote.includes('·')) {
                const [number, dot] = numberedNote.split('·');
                numberedDisplay.innerHTML = `<span class="numbered-note">${number}<span class="dot">·</span></span>`;
            } else {
                numberedDisplay.textContent = numberedNote;
            }
        }
    }

    // 处理点击事件
    function handleClick(e) {
        e.preventDefault();
        const rect = canvas.getBoundingClientRect();
        handleInteraction(e.clientY, rect);
    }

    // 处理触摸事件
    function handleTouchStart(e) {
        e.preventDefault();
        touchStartY = e.touches[0].clientY;
    }

    function handleTouchEnd(e) {
        e.preventDefault();
        const rect = canvas.getBoundingClientRect();
        handleInteraction(touchStartY, rect);
    }

    // 初始化
    function init() {
        // 设置 viewport
        const viewport = document.querySelector('meta[name=viewport]');
        viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');

        // 调整 canvas 大小
        function resizeCanvas() {
            const container = canvas.parentElement;
            const dpr = window.devicePixelRatio || 1;
            canvas.width = container.clientWidth * dpr;
            canvas.height = container.clientHeight * dpr;
            canvas.style.width = container.clientWidth + 'px';
            canvas.style.height = container.clientHeight + 'px';
            ctx.scale(dpr, dpr);
            spacing = container.clientHeight / 18;
            drawStaff();
        }

        // 添加事件监听
        window.addEventListener('resize', resizeCanvas);
        canvas.addEventListener('click', handleClick);
        canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
        canvas.addEventListener('touchend', handleTouchEnd, { passive: false });

        // 初始化画布
        resizeCanvas();
    }

    // 启动初始化
    init();
}); 