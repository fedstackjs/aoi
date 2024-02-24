---
outline: deep
---

# 用户指南

本章将介绍普通用户使用评测系统中遇到的各个界面的组成及其功能。

通过本章的内容，用户将能够更熟悉评测系统的使用方法。

## 页面框架

![descript](https://pub-88de94d1076a46e2a317ff578c7fabb1.r2.dev/docs/images/image37.png)

如图所示，普通用户的页面由以下若干部分组成：顶部栏(a)、侧边栏(b)和主体部分(c)。

顶部栏包含以下内容：

1. 应用 logo 和应用名称
2. 当前页面标题
3. 搜索框，可以快速进行题库搜索请求
4. 用户菜单

侧边栏包含以下内容：

1. 当前组织，指示当前的主体部分的内容是处于哪一个组织下的
2. 选择组织菜单，用于切换当前组织
3. 功能菜单
4. 版本信息
5. 语言切换，目前支持简体中文和英文

## 首页

![descript](https://pub-88de94d1076a46e2a317ff578c7fabb1.r2.dev/docs/images/image38.png)

如图所示，首页包括以下模块：

1. 海报卡片，轮换显示指定的海报图片
2. 近期比赛卡片，显示近期的比赛列表
3. 公告卡片
4. 友情链接卡片

## 登录与注册

你需要登录以访问你所属组织中的内容，在未登录状态下，你可以点击顶部栏右侧的"登录"

按钮进入登录页面，界面如图所示。目前支持通过密码、邮箱、IAAA 三种方式认证(管理员可以在部署时选择只提供其中部分认证方式)。

![descript](https://pub-88de94d1076a46e2a317ff578c7fabb1.r2.dev/docs/images/image39.png)

若你还没有账户，你需要点击登录页面下方的"注册"按钮，填写必要的信息以注册一个新的账户，如图。

![descript](https://pub-88de94d1076a46e2a317ff578c7fabb1.r2.dev/docs/images/image40.png)

## 用户

在用户登录后的顶部栏，你可以在用户菜单中选择：

1. 查看用户信息
2. 进行用户设置
3. 登出账户

用户信息界面会展示你注册时填写的个人信息，如图。其中，电话和学校等部分信息在他人访问你的用户信息页面时不会被展示。

![descript](https://pub-88de94d1076a46e2a317ff578c7fabb1.r2.dev/docs/images/image41.png)

在你访问自己的用户信息页面时，点击如图所示的齿轮按钮，效果同上述 2，进入用户设置的页面。

![descript](https://pub-88de94d1076a46e2a317ff578c7fabb1.r2.dev/docs/images/image42.png)

用户设置页面如图，你可以修改自己的个人信息，而在其中的"用户认证"部分，你也可以在通过多因子身份认证之后，修改自己的用户认证信息(如登录密码、登录邮箱等，如图)。

![descript](https://pub-88de94d1076a46e2a317ff578c7fabb1.r2.dev/docs/images/image43.png)

## 题库

关于题目的权限控制，请参考管理员指南。

点击侧边栏中的"题库"，将进入如图所示的题目列表，用户可以查看他有权限访问的题目。用题目列表右上角的搜索框，可以筛选出标题或 tag 中含有指定关键字的题目。

![descript](https://pub-88de94d1076a46e2a317ff578c7fabb1.r2.dev/docs/images/image44.png)

点击题目标题进入对应题目的页面，如图所示。

![descript](https://pub-88de94d1076a46e2a317ff578c7fabb1.r2.dev/docs/images/image45.png)

题目页面提供了若干选项卡，功能如下：

### 题面

渲染了 Markdown 格式的题面文档。

### 附件

提供了完成题目需要的附件供用户下载，如图。

![descript](https://pub-88de94d1076a46e2a317ff578c7fabb1.r2.dev/docs/images/image46.png)

### 提交

我们提供了可视化提交、上传文件、上传文件夹等多种提交方式。

其中，可视化提交可以包含若干代码块和文本或选项组成的元数据，提交的格式可以由题目管理者自定义。两种示例的可视化提交界面如下：

![descript](https://pub-88de94d1076a46e2a317ff578c7fabb1.r2.dev/docs/images/image47.png)

![descript](https://pub-88de94d1076a46e2a317ff578c7fabb1.r2.dev/docs/images/image48.png)

关于管理员如何指定题目支持的提交方式，以及可视化提交的格式，可以参考管理员指南。

### 提交记录

提供了用户在本道题目的提交记录列表，如图。

![descript](https://pub-88de94d1076a46e2a317ff578c7fabb1.r2.dev/docs/images/image49.png)

点击对应的提交记录可以查看提交记录的详情，如图。![descript](https://pub-88de94d1076a46e2a317ff578c7fabb1.r2.dev/docs/images/image50.png)

在提交记录详情页，"动作"部分提供了下载源文件和刷新评测结果的功能，"细节"部分则展示了评测机返回的每个测试点的反馈信息，如图。

![descript](https://pub-88de94d1076a46e2a317ff578c7fabb1.r2.dev/docs/images/image51.png)

## 比赛

关于比赛的权限控制，请参考管理员指南。

比赛部分的操作逻辑与题目页面相近，我们只介绍两者有区别的地方。

比赛页面如图所示。注意到页面中多出了一个比赛进度指示条，用来指示当前比赛到了哪个阶段，以及当前阶段的进度。页面中还多出了一个报名按钮，**注意我们要先报名才能参加比赛和查看比赛详情。**

![descript](https://pub-88de94d1076a46e2a317ff578c7fabb1.r2.dev/docs/images/image52.png)

比赛界面的选项卡也稍有不同：

### 题库

题库中包含了组成这场比赛的题目，如图所示。由题目列表侧边栏和题目详情组成，选中对应的题目，题目详情的显示格式和"题库"中单道题目的详情相同。

![descript](https://pub-88de94d1076a46e2a317ff578c7fabb1.r2.dev/docs/images/image53.png)

### 排行榜

由排行榜列表侧边栏和排行榜详情组成，如图所示。一场比赛有多个排行榜。排行榜由评测机计算，传到前端渲染成折线图和表格。

![descript](https://pub-88de94d1076a46e2a317ff578c7fabb1.r2.dev/docs/images/image54.png)

### 参赛选手

显示了参加本次比赛的选手的列表。

## 提交记录

侧边栏中"提交记录"页面汇总了用户在所有题目和比赛中的提交记录，提交记录列表和提交记录详情的显示效果同上。

## 计划

类似于比赛，先报名计划后，便可在计划拥有的比赛列表中注册其中的比赛，注册后即可参加对应的比赛。

## 公告

点击侧边栏中的"公告"，将进入如图所示的公告列表，用户可以查看他有权限查看的公告。

![descript](https://pub-88de94d1076a46e2a317ff578c7fabb1.r2.dev/docs/images/image55.png)

点击公告标题进入对应公告的页面，如图所示。页面渲染了 Markdown 格式的公告内容。

![descript](https://pub-88de94d1076a46e2a317ff578c7fabb1.r2.dev/docs/images/image56.png)
