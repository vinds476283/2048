<!--
SPDX-FileCopyrightText: 2026 铟子vinds [https://y.vinds.top]
SPDX-License-Identifier: GPL-3.0-or-later
-->

# 2048

<div align="center">
  <img src="https://img.shields.io/badge/license-GPLv3-blue.svg" alt="License: GPL v3">
  <img src="https://img.shields.io/badge/Cloudflare-Pages-F38020?logo=cloudflare&logoColor=white" alt="Cloudflare Pages">
</div>

<div align="center">
  <a href="https://github.com/vinds476283/2048/blob/main/README.md">English</a> | 简体中文
</div>

## 初心

用来完成作业。

## 使用方法

访问 [2048.vinds.top](https://2048.vinds.top) 即可游玩，加入参数 `bot=<正整数>` 可以有机器人功能，自动玩，其中正整数表示每两次操作之间的间隔时间（单位：毫秒）。机器人采用 expectimax 搜索与启发式评估函数，属于传统算法。

添加参数 `rank=<任何字符串>` 可以进入排行榜模式，可以使用排行榜，若进入前 100 名，则可以进入榜单。但因为我很懒，所以没有做防作弊机制，如果在控制台输入类似于下面的代码，可以上传假成绩，但我非常反对这么做，如果发现，我会删掉的：
```JavaScript
submitRankEntry('test', 114514)
```

但我设置了 `rank` 参数与 `bot` 参数不能同时启动。

项目由 AI 辅助完成，其中样式完全由 AI 完成。

## 项目结构

三份文件：
`index.html`、`style.css`、`script.js`。

## 许可证

本项目采用 [GNU General Public License v3.0](https://www.gnu.org/licenses/gpl-3.0.zh-cn.html) 开源协议。详情请参阅 [LICENSE] 文件。

> SPDX-FileCopyrightText: 2026 [铟子vinds](https://y.vinds.top)

> SPDX-License-Identifier: GPL-3.0-or-later
