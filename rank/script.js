/*
SPDX-FileCopyrightText: 2026 铟子vinds [https://y.vinds.top]
SPDX-License-Identifier: GPL-3.0-or-later
*/


const a = document.body;
const b = document.getElementById('u');
const c = document.getElementById('r');
const d = document.getElementById('s');
const e = document.getElementById('t');
const f = document.getElementById('v');
const g = document.getElementById('q');
const h = document.getElementById('p');
const i = 4;
let j = [];
let k = 0;
let l = 0;
let m = false;
let n = false;
let o = false;
let p = { x: 0, y: 0 };
let qq = { x: 0, y: 0 };
let r = false;
const s = 20;
let t = false;
let u = null;
let v = false;
let w = false;
let x = null;
let robotInterval = null;
let z = null;
const y = [
    [1.0, 0.9, 0.8, 0.7],
    [0.6, 0.5, 0.4, 0.3],
    [0.2, 0.1, 0.0, 0.0],
    [0.0, 0.0, 0.0, 0.0]
];

function ac(mat) {
    let best = -Infinity;
    let bestMat = y;
    let transforms = [];
    transforms.push(y);
    let rev = mat => mat.map(rr => [...rr].reverse());
    let flip = mat => [...mat].reverse();
    let revflip = mat => flip(rev(mat));
    transforms.push(rev(y));
    transforms.push(flip(y));
    transforms.push(revflip(y));
    for (let tmat of transforms) {
        let score = 0;
        for (let rw = 0; rw < i; rw++)
            for (let cl = 0; cl < i; cl++)
                if (mat[rw][cl] !== 0) score += mat[rw][cl] * tmat[rw][cl];
        if (score > best) {
            best = score;
            bestMat = tmat;
        }
    }
    return bestMat;
}

function ad(board) {
    let empty = 0,
        mergeBonus = 0,
        diffPenalty = 0,
        smooth = 0,
        mono = 0,
        maxVal = 0,
        sumPow = 0,
        weightScore = 0;
    let weightMat = ac(board);
    for (let rw = 0; rw < i; rw++) {
        for (let cl = 0; cl < i; cl++) {
            let val = board[rw][cl];
            if (val === 0) empty++;
            else {
                if (val > maxVal) maxVal = val;
                sumPow += Math.pow(val, 1.2);
                weightScore += val * weightMat[rw][cl];
                if (cl + 1 < i && board[rw][cl + 1] === val) mergeBonus += val * 8;
                if (rw + 1 < i && board[rw + 1][cl] === val) mergeBonus += val * 8;
                if (cl + 1 < i && board[rw][cl + 1] !== 0) diffPenalty += Math.abs(val - board[rw][cl + 1]);
                if (rw + 1 < i && board[rw + 1][cl] !== 0) diffPenalty += Math.abs(val - board[rw + 1][cl]);
            }
        }
    }
    for (let rw = 0; rw < i; rw++) {
        let incRow = 0,
            decRow = 0,
            incCol = 0,
            decCol = 0;
        for (let cl = 0; cl < i - 1; cl++) {
            if (board[rw][cl] !== 0 && board[rw][cl + 1] !== 0) {
                if (board[rw][cl] <= board[rw][cl + 1]) incRow++;
                if (board[rw][cl] >= board[rw][cl + 1]) decRow++;
            }
            if (board[cl][rw] !== 0 && board[cl + 1][rw] !== 0) {
                if (board[cl][rw] <= board[cl + 1][rw]) incCol++;
                if (board[cl][rw] >= board[cl + 1][rw]) decCol++;
            }
        }
        mono += Math.max(incRow, decRow) + Math.max(incCol, decCol);
    }
    return empty * 3.0 + mergeBonus * 9.0 - diffPenalty * 0.12 + weightScore * 150 + mono * 1.8 + Math.log(maxVal + 1) * 90 + sumPow * 0.06;
}

function ae(board, dir) {
    let nb = JSON.parse(JSON.stringify(board));
    let gain = 0;
    let mergeRow = (row) => {
        let filtered = row.filter(v => v !== 0);
        let res = [];
        for (let idx = 0; idx < filtered.length; idx++) {
            if (idx + 1 < filtered.length && filtered[idx] === filtered[idx + 1]) {
                let merged = filtered[idx] * 2;
                res.push(merged);
                gain += merged;
                idx++;
            } else res.push(filtered[idx]);
        }
        while (res.length < i) res.push(0);
        return res;
    };
    if (dir === 'left') {
        for (let rw = 0; rw < i; rw++) nb[rw] = mergeRow(nb[rw]);
    } else if (dir === 'right') {
        for (let rw = 0; rw < i; rw++) {
            let rev = [...nb[rw]].reverse();
            nb[rw] = mergeRow(rev).reverse();
        }
    } else if (dir === 'up') {
        for (let cl = 0; cl < i; cl++) {
            let col = [];
            for (let rw = 0; rw < i; rw++) col.push(nb[rw][cl]);
            let merged = mergeRow(col);
            for (let rw = 0; rw < i; rw++) nb[rw][cl] = merged[rw];
        }
    } else if (dir === 'down') {
        for (let cl = 0; cl < i; cl++) {
            let col = [];
            for (let rw = 0; rw < i; rw++) col.push(nb[rw][cl]);
            let rev = col.reverse();
            let merged = mergeRow(rev).reverse();
            for (let rw = 0; rw < i; rw++) nb[rw][cl] = merged[rw];
        }
    }
    let changed = false;
    for (let rw = 0; rw < i && !changed; rw++)
        for (let cl = 0; cl < i; cl++)
            if (board[rw][cl] !== nb[rw][cl]) { changed = true; break; }
    return { newBoard: nb, changed: changed, scoreGain: gain };
}

function af(board) {
    let empty = [];
    for (let rw = 0; rw < i; rw++)
        for (let cl = 0; cl < i; cl++)
            if (board[rw][cl] === 0) empty.push({ x: rw, y: cl });
    if (empty.length === 0) return false;
    let pos = empty[Math.floor(Math.random() * empty.length)];
    board[pos.x][pos.y] = Math.random() < 0.9 ? 2 : 4;
    return true;
}

let cache = new Map();
let cacheHit = 0,
    cacheMiss = 0;

function aj(board, depth, isMax) {
    if (depth === 0) return ad(board);
    let key = board.flat().join(',') + '|' + depth + '|' + isMax;
    if (cache.has(key)) { cacheHit++; return cache.get(key); }
    cacheMiss++;
    let val;
    if (isMax) {
        let best = -Infinity;
        let dirs = ['up', 'down', 'left', 'right'];
        let moves = [];
        for (let dir of dirs) {
            let res = ae(board, dir);
            if (res.changed) moves.push({ dir, score: ad(res.newBoard) });
        }
        moves.sort((a, b) => b.score - a.score);
        for (let mv of moves) {
            let next = ae(board, mv.dir);
            if (next.changed) {
                let tmp = aj(next.newBoard, depth - 1, false);
                if (tmp > best) best = tmp;
            }
        }
        val = best === -Infinity ? ad(board) : best;
    } else {
        let empty = [];
        for (let rw = 0; rw < i; rw++)
            for (let cl = 0; cl < i; cl++)
                if (board[rw][cl] === 0) empty.push({ x: rw, y: cl });
        if (empty.length === 0) val = ad(board);
        else {
            let total = 0;
            for (let pos of empty) {
                let b2 = JSON.parse(JSON.stringify(board));
                b2[pos.x][pos.y] = 2;
                total += 0.9 * aj(b2, depth - 1, true);
                let b4 = JSON.parse(JSON.stringify(board));
                b4[pos.x][pos.y] = 4;
                total += 0.1 * aj(b4, depth - 1, true);
            }
            val = total / empty.length;
        }
    }
    if (cache.size > 8000) cache.clear();
    cache.set(key, val);
    return val;
}

function ak() {
    if (m) return null;
    let bestDir = null;
    let bestScore = -Infinity;
    let dirs = ['up', 'down', 'left', 'right'];
    let candidates = [];
    for (let dir of dirs) {
        let res = ae(j, dir);
        if (res.changed) candidates.push({ dir, score: ad(res.newBoard) });
    }
    candidates.sort((a, b) => b.score - a.score);
    for (let cand of candidates) {
        let next = ae(j, cand.dir);
        if (next.changed) {
            let val = aj(next.newBoard, 4, false);
            if (val > bestScore) {
                bestScore = val;
                bestDir = cand.dir;
            }
        }
    }
    return bestDir;
}
let al = ak;

function am() {
    if (!v || m || w) {
        if (x) clearTimeout(x);
        x = null;
        return;
    }
    let mv = al();
    if (mv && mv !== null) {
        if (!an(mv)) { if (!m) ao(); }
        x = setTimeout(am, robotInterval);
    } else {
        if (!m) ao();
        x = setTimeout(am, robotInterval);
    }
}

function ap() {
    if (!v) return;
    if (x) clearTimeout(x);
    w = false;
    x = setTimeout(am, robotInterval);
}

function aq() {
    if (x) {
        clearTimeout(x);
        x = null;
    }
    v = false;
    if (h) h.classList.remove('active');
    w = false;
}

function ar() {
    if (robotInterval === null) return;

    if (v) {
        aq();
    } else {
        v = true;
        if (h) h.classList.add('active');
        if (m) { as(); }
        ap();
    }
}

function at() {
    if (k > l) {
        l = k;
        localStorage.setItem('b', l);
        d.innerText = l;
    }
}

function au() {
    c.innerText = k;
    if (k > l) {
        l = k;
        d.innerText = l;
        localStorage.setItem('b', l);
    }
    if (m) f.innerHTML = '游戏结束';
    else f.innerHTML = '';
}

function av() {
    for (let rw = 0; rw < i; rw++)
        for (let cl = 0; cl < i; cl++)
            if (j[rw][cl] === 0) return true;
    return false;
}

function aw() {
    for (let rw = 0; rw < i; rw++)
        for (let cl = 0; cl < i; cl++) {
            let val = j[rw][cl];
            if (val !== 0) {
                if (rw + 1 < i && j[rw + 1][cl] === val) return true;
                if (cl + 1 < i && j[rw][cl + 1] === val) return true;
                if (rw - 1 >= 0 && j[rw - 1][cl] === val) return true;
                if (cl - 1 >= 0 && j[rw][cl - 1] === val) return true;
            } else return true;
        }
    return false;
}

function ao() {
    if (!av() && !aw()) {
        m = true;
        n = false;
        f.innerHTML = '游戏结束';
        au();
        if (v) aq();
        if (m) checkRankAndPrompt();
        return true;
    }
    return false;
}

function ax() {
    let empty = [];
    for (let rw = 0; rw < i; rw++)
        for (let cl = 0; cl < i; cl++)
            if (j[rw][cl] === 0) empty.push({ x: rw, y: cl });
    if (empty.length === 0) return false;
    let pos = empty[Math.floor(Math.random() * empty.length)];
    j[pos.x][pos.y] = Math.random() < 0.9 ? 2 : 4;
    return true;
}

function an(dir) {
    if (m) return false;
    let old = JSON.parse(JSON.stringify(j));
    let gain = 0;
    let mergeRow = (row) => {
        let filt = row.filter(v => v !== 0);
        let res = [];
        for (let idx = 0; idx < filt.length; idx++) {
            if (idx + 1 < filt.length && filt[idx] === filt[idx + 1]) {
                let merged = filt[idx] * 2;
                res.push(merged);
                gain += merged;
                idx++;
            } else res.push(filt[idx]);
        }
        while (res.length < i) res.push(0);
        return res;
    };
    if (dir === 'left') {
        for (let rw = 0; rw < i; rw++) j[rw] = mergeRow(j[rw]);
    } else if (dir === 'right') {
        for (let rw = 0; rw < i; rw++) {
            let rev = [...j[rw]].reverse();
            j[rw] = mergeRow(rev).reverse();
        }
    } else if (dir === 'up') {
        for (let cl = 0; cl < i; cl++) {
            let col = [];
            for (let rw = 0; rw < i; rw++) col.push(j[rw][cl]);
            let merged = mergeRow(col);
            for (let rw = 0; rw < i; rw++) j[rw][cl] = merged[rw];
        }
    } else if (dir === 'down') {
        for (let cl = 0; cl < i; cl++) {
            let col = [];
            for (let rw = 0; rw < i; rw++) col.push(j[rw][cl]);
            let rev = col.reverse();
            let merged = mergeRow(rev).reverse();
            for (let rw = 0; rw < i; rw++) j[rw][cl] = merged[rw];
        }
    }
    let changed = false;
    for (let rw = 0; rw < i; rw++)
        for (let cl = 0; cl < i; cl++)
            if (old[rw][cl] !== j[rw][cl]) { changed = true; break; }
    if (changed) {
        z = { b: JSON.parse(JSON.stringify(old)), s: k, g: m, r: n };
        k += gain;
        au();
        at();
        ax();
        ay();
        for (let rw = 0; rw < i; rw++)
            for (let cl = 0; cl < i; cl++)
                if (j[rw][cl] === 2048 && !n) {
                    n = true;
                    au();
                    break;
                }
        if (ao()) { ay(); if (v) aq(); return false; }
        ay();
        return true;
    }
    return false;
}

function as() {
    j = [
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
    ];
    k = 0;
    m = false;
    n = false;
    c.innerText = "0";
    f.innerHTML = '';
    ax();
    ax();
    ay();
    au();
    let stored = localStorage.getItem('b');
    l = (stored && !isNaN(parseInt(stored))) ? parseInt(stored) : 0;
    d.innerText = l;
    if (k > l) at();
    else au();
    if (v && robotInterval !== null) {
        if (x) clearTimeout(x);
        w = false;
        x = setTimeout(am, robotInterval);
    }
    cache.clear();
}

function ay() {
    b.innerHTML = '';
    for (let rw = 0; rw < i; rw++) {
        for (let cl = 0; cl < i; cl++) {
            let val = j[rw][cl];
            let cell = document.createElement('div');
            if (val !== 0) {
                cell.textContent = val;
                cell.setAttribute('data-v', val);
            } else {
                cell.textContent = '';
                cell.setAttribute('data-v', '0');
                cell.style.backgroundColor = a.classList.contains('dk') ? '#2a2f46' : '#eef2f8';
            }
            b.appendChild(cell);
        }
    }
    let cells = document.querySelectorAll('#u>div');
    cells.forEach(cell => {
        if (cell.getAttribute('data-v') === '0') {
            cell.style.backgroundColor = a.classList.contains('dk') ? '#2a2f46' : '#eef2f8';
        } else cell.style.backgroundColor = '';
    });
}

function az(dir) { if (!m) an(dir); }

function ba(ev) {
    if (m || v) return;
    ev.preventDefault();
    let touch = ev.touches[0];
    p.x = touch.clientX;
    p.y = touch.clientY;
}

function bb(ev) {
    if (m || v) return;
    ev.preventDefault();
    let touch = ev.changedTouches[0];
    let dx = touch.clientX - p.x;
    let dy = touch.clientY - p.y;
    if (Math.abs(dx) < s && Math.abs(dy) < s) return;
    if (Math.abs(dx) > Math.abs(dy)) dx > 0 ? az('right') : az('left');
    else dy > 0 ? az('down') : az('up');
}

function bc(ev) { ev.preventDefault(); }

function bd(ev) {
    if (m || v) return;
    if (ev.button !== 0) return;
    r = true;
    qq.x = ev.clientX;
    qq.y = ev.clientY;
    ev.preventDefault();
    a.style.userSelect = 'none';
}

function be(ev) {
    if (!r) return;
    r = false;
    a.style.userSelect = '';
    if (m || v) return;
    let dx = ev.clientX - qq.x;
    let dy = ev.clientY - qq.y;
    if (Math.abs(dx) < s && Math.abs(dy) < s) return;
    if (Math.abs(dx) > Math.abs(dy)) dx > 0 ? az('right') : az('left');
    else dy > 0 ? az('down') : az('up');
}

function bf(ev) { if (r) ev.preventDefault(); }

function bg(ev) {
    if (m || v) return;
    let key = ev.key;
    let dir = null;
    if (key === 'ArrowUp' || key === 'w' || key === 'W') dir = 'up';
    else if (key === 'ArrowDown' || key === 's' || key === 'S') dir = 'down';
    else if (key === 'ArrowLeft' || key === 'a' || key === 'A') dir = 'left';
    else if (key === 'ArrowRight' || key === 'd' || key === 'D') dir = 'right';
    if (dir) {
        ev.preventDefault();
        az(dir);
    }
}

function bh() {
    let theme = localStorage.getItem('t') === 'dk';
    if (theme) {
        a.classList.add('dk');
        g.innerHTML = '<i class="fas fa-moon"></i>';
    } else {
        a.classList.remove('dk');
        g.innerHTML = '<i class="fas fa-sun"></i>';
    }
    ay();
}

function bi() {
    if (a.classList.contains('dk')) {
        a.classList.remove('dk');
        localStorage.setItem('t', 'light');
        g.innerHTML = '<i class="fas fa-sun"></i>';
    } else {
        a.classList.add('dk');
        localStorage.setItem('t', 'dk');
        g.innerHTML = '<i class="fas fa-moon"></i>';
    }
    ay();
}

function bj() {
    b.addEventListener('touchstart', ba, { passive: false });
    b.addEventListener('touchend', bb);
    b.addEventListener('touchmove', bc, { passive: false });
    b.addEventListener('mousedown', bd);
    window.addEventListener('mouseup', be);
    window.addEventListener('mousemove', bf);
    window.addEventListener('keydown', bg);
    e.addEventListener('click', () => as());
    document.getElementById('z').addEventListener('click', () => {
        if (z !== null) {
            j = z.b;
            k = z.s;
            m = z.g;
            n = z.r;
            if (k > l) {
                l = k;
                localStorage.setItem('b', l);
            }
            ay();
            au();
            z = null;
            if (v && !m && robotInterval !== null && x === null) {
                ap();
            }
        }
    });
    g.addEventListener('click', bi);
    if (h) h.addEventListener('click', ar);
    window.addEventListener('dragstart', (ev) => ev.preventDefault());
}

function bk() {
    let stored = localStorage.getItem('b');
    l = (stored && !isNaN(parseInt(stored))) ? parseInt(stored) : 0;
    d.innerText = l;
    as();
    bh();
    bj();
}
let bl = new URLSearchParams(window.location.search);
let botParam = bl.get('bot');
let isValidPositiveInt = false;
if (botParam !== null) {
    let num = Number(botParam);
    if (Number.isInteger(num) && num > 0 && String(num) === botParam) {
        isValidPositiveInt = true;
        robotInterval = num;
    }
}

if (isValidPositiveInt) {
    if (h) {
        h.style.display = 'flex';
    }
} else {
    if (h) h.style.display = 'none';
    robotInterval = null;
}
bk();

//1

const RANK_API = '/api/rank';

//XSS
function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

async function fetchLeaderboard() {
    try {
        const resp = await fetch(RANK_API);
        if (!resp.ok) throw new Error('Network error');
        return await resp.json();
    } catch (e) {
        console.error('获取排行榜失败:', e);
        return [];
    }
}

async function submitRankEntry(name, score) {
    try {
        const resp = await fetch(RANK_API, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, score }),
        });
        if (!resp.ok) {
            const errText = await resp.text();
            console.error('提交失败:', resp.status, errText);
            return null;
        }
        return await resp.json();
    } catch (e) {
        console.error('提交排行榜异常:', e);
        return null;
    }
}

async function renderRankList() {
    const container = document.getElementById('rankList');
    if (!container) return;
    const list = await fetchLeaderboard();
    if (list.length === 0) {
        container.innerHTML = '<div class="rank-empty">暂无数据</div>';
        return;
    }
    const sorted = [...list].sort((a, b) => b.score - a.score);
    container.innerHTML = sorted.map((item, index) => `
       <div class="rank-item">
         <span class="rank-num">#${index + 1}</span>
         <span class="rank-name">${escapeHtml(item.name)}</span>
         <span class="rank-score">${item.score}</span>
       </div>
     `).join('');
}

async function checkRankAndPrompt() {
    const list = await fetchLeaderboard();
    const sorted = [...list].sort((a, b) => b.score - a.score);
    let isTop = false;
    if (sorted.length < 100) {
        isTop = true;
    } else {
        const lastScore = sorted[99].score;
        if (k > lastScore) {
            isTop = true;
        }
    }
    if (!isTop) {
        renderRankList();
        return;
    }
    showNameModal();
}

async function submitNewRecord(name, score) {
    const updatedList = await submitRankEntry(name, score);
    if (updatedList) {
        await renderRankList();
        return true;
    }
    return false;
}

const modal = document.getElementById('nameModal');
const nameInput = document.getElementById('playerNameInput');
const nameError = document.getElementById('nameError');
const submitBtn = document.getElementById('submitNameBtn');
const cancelBtn = document.getElementById('cancelNameBtn');

function showNameModal() {
    if (!modal) return;
    modal.style.display = 'block';
    nameInput.value = '';
    nameError.style.display = 'none';
    nameInput.focus();
}

function hideNameModal() {
    if (modal) modal.style.display = 'none';
}

function isValidName(name) {
    const trimmed = name.trim();
    if (trimmed.length === 0) return { valid: false, msg: '用户名不能为空' };
    const cjkRegex = /[\u4e00-\u9fff\u3400-\u4dbf\uac00-\ud7af\u1100-\u11ff\u3130-\u318f]/g;
    const cjkCount = (trimmed.match(cjkRegex) || []).length;
    const nonCjkCount = trimmed.length - cjkCount;
    if (cjkCount > 100) {
        return { valid: false, msg: '中韩日表意文字不能超过100个' };
    }
    if (nonCjkCount > 200) {
        return { valid: false, msg: '西文字符不能超过200个' };
    }
    return { valid: true };
}

if (submitBtn) {
    submitBtn.addEventListener('click', async() => {
        const name = nameInput.value;
        const result = isValidName(name);
        if (!result.valid) {
            nameError.textContent = result.msg;
            nameError.style.display = 'block';
            return;
        }
        submitBtn.disabled = true;
        submitBtn.textContent = '提交中...';
        try {
            const success = await submitNewRecord(name.trim(), k);
            if (success) {
                hideNameModal();
            } else {
                nameError.textContent = '提交失败，请重试';
                nameError.style.display = 'block';
            }
        } catch (e) {
            nameError.textContent = '网络错误，请重试';
            nameError.style.display = 'block';
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = '提交';
        }
    });
}

if (cancelBtn) {
    cancelBtn.addEventListener('click', hideNameModal);
}

if (nameInput) {
    nameInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            submitBtn.click();
        }
    });
}

const overlay = document.querySelector('.modal-overlay');
if (overlay) {
    overlay.addEventListener('click', (e) => {
        if (e.target === e.currentTarget) {
            hideNameModal();
        }
    });
}

//purge
const refreshBtn = document.getElementById('refreshRankBtn');
if (refreshBtn) {
    refreshBtn.addEventListener('click', () => {
        location.reload(true);
    });
}

//
renderRankList();

console.log('suc to rank');