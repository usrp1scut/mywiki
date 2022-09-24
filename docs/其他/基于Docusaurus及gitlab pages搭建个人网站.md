

#### 框架

 基于 [Docusaurus 2](https://docusaurus.io/)框架，可构建个人网站、博客以及知识库.

#### 安装

[中文安装配置](https://www.docusaurus.cn/docs/installation)

```
$ yarn
```

#### 本地部署测试

```
$ yarn start
```

#### 构建静态站点

```
$ yarn build
```

生成的网站文件存放在build目录

#### 通过gitlab-ci自动部署到gitlab-page

```
#构建网站静态文件
building:
  stage: build
  image: node:16.15.0-alpine
  only:
    - tags
  script:
    - npm install --progress=false --no-optional
    - npm run build
#生成产物上传
  artifacts:
    expire_in: 3 days
    paths:
      - build
  tags:
    - docker-bash

#将生成的网站文件部署到pages
pages:
  stage: deploy
  only:
    - tags
  script:
    - rm -rf public
    - mv build public
  artifacts:
    paths:
      - public
  tags:
    - docker-bash
```
