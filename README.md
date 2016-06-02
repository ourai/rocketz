# RocketZ

用于 [Node.js](https://nodejs.org/) 的将文件分发到多个 CDN 的上传工具。

这是一个存放多个 npm 包的「[单仓库](https://github.com/babel/babel/blob/master/doc/design/monorepo.md)」，源码都存放在 [`packages`](packages) 目录下。

## 安装

原来的集 API 和命令行工具于一体的 [rocketz](https://www.npmjs.com/package/rocketz) 已经废弃不再维护，请根据需要进行下载安装。

### 核心 API

提供了预览、上传文件等 API，可供其他库或工具进行二次封装。

```
npm install rocketz-core --save
```

### 命令行工具

通过命令行上传指定目录下的文件到目标 CDN。

```
npm install -g rocketz-cli
```