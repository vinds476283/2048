export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);
        const pathname = url.pathname;

        if (pathname === '/api/rank') {
            if (request.method === 'GET') {
                try {
                    const data = await env.RANK_KV.get('leaderboard', 'json');
                    const list = data || [];
                    list.sort((a, b) => b.score - a.score);
                    return new Response(JSON.stringify(list), {
                        headers: { 'Content-Type': 'application/json' },
                    });
                } catch (e) {
                    return new Response(JSON.stringify([]), {
                        status: 500,
                        headers: { 'Content-Type': 'application/json' },
                    });
                }
            } else if (request.method === 'POST') {
                try {
                    const body = await request.json();
                    const { name, score } = body;
                    if (!name || typeof score !== 'number' || score < 0) {
                        return new Response(JSON.stringify({ error: 'Invalid data' }), {
                            status: 400,
                            headers: { 'Content-Type': 'application/json' },
                        });
                    }

                    // 读取现有数据
                    let list = await env.RANK_KV.get('leaderboard', 'json');
                    if (!list) list = [];

                    // 添加新记录
                    list.push({ name: name.trim(), score });
                    list.sort((a, b) => b.score - a.score);
                    if (list.length > 100) {
                        list = list.slice(0, 100);
                    }

                    await env.RANK_KV.put('leaderboard', JSON.stringify(list));
                    console.log(`新纪录已保存: ${name} - ${score}`); // 可在仪表盘查看

                    return new Response(JSON.stringify(list), {
                        headers: { 'Content-Type': 'application/json' },
                    });
                } catch (e) {
                    console.error('POST 处理错误:', e);
                    return new Response(JSON.stringify({ error: 'Server error' }), {
                        status: 500,
                        headers: { 'Content-Type': 'application/json' },
                    });
                }
            } else {
                return new Response('Method Not Allowed', { status: 405 });
            }
        }

        if (/\.(png|jpg|jpeg|gif|svg|ico|webp|woff|woff2|ttf|eot)$/i.test(pathname)) {
            return env.ASSETS.fetch(request);
        }

        if (url.searchParams.has('rank')) {
            let targetPath = '/rank/index.html';

            if (pathname.endsWith('.css')) {
                targetPath = '/rank/style.css';
            } else if (pathname.endsWith('.js')) {
                targetPath = '/rank/script.js';
            } else if (pathname === '/' || pathname === '') {
                targetPath = '/rank/index.html';
            } else {
                return env.ASSETS.fetch(request);
            }

            const assetUrl = new URL(targetPath, url.origin);
            const assetRequest = new Request(assetUrl, {
                method: request.method,
                headers: request.headers,
            });
            return env.ASSETS.fetch(assetRequest);
        }

        return env.ASSETS.fetch(request);
    },
};