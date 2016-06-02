# RocketZ

[![NPM version][npm-ver]][npm-url]
[![NPM download][npm-dm]][npm-url]

[npm-ver]: https://img.shields.io/npm/v/rocketz-cli.svg?style=flat-square
[npm-dm]: https://img.shields.io/npm/dm/rocketz-cli.svg?style=flat-square
[npm-url]: https://www.npmjs.com/package/rocketz-cli

既是一个 Node.js 脚本又是一个命令行工具，帮您将静态资源从「地面」（本地）发射到「云端」（CDN）！

## 命令行工具

通过 [npm](https://www.npmjs.com) 进行安装：

```
npm install -g rocketz-cli
```

在项目目录下执行 `rocketz init` 创建一个 `rocketz-conf.json` 文件，其各项参数含义如下：

```js
{
  "assets": "",         // 要上传的本地资源目录
  "remote": "",         // 上传到 CDN 的目录，默认为根目录
  "files": [],          // 指定要上传的文件，默认为全部
  "exts": [],           // 指定要上传的文件类型，默认为全部
  "deep": true,         // 是否进行深度遍历，默认为 true
  "interactive": true   // 是否进行为交互式，默认为 true
}
```

### 基本命令

* `rocketz` - 根据 `rocketz-conf.json` 中的配置上传资源
* `rocketz init` - 根据提示输入创建一个 `rocketz-conf.json` 文件
* `rocketz -v` - 查看版本号
* `rocketz --config [cloud]` - 填写 CDN 配置信息
* `rocketz --view [cloud]` - 查看 CDN 配置信息

### 支持的 CDN

* 七牛 - `qiniu`
* 顽兔 - `wantu`
