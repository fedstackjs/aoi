---
outline: deep
---

# 规则系统

## 概述

AOI v1.1.x 起引入了规则系统，用于增强的权限控制。

利用规则系统，您可以实现包括但不限于如下的功能：

- 仅当用户达到特定分数后，才可以查看其他人的提交
- 在权限控制的基础上，限制满足特定条件的用户参与比赛
- ……

规则是声明性的判断流水线。对于一处**规则设置**，AOI系统将提供对应的**规则上下文**，上下文中的数据将可以被**规则匹配器（Matcher）**和**规则投影器（Projector）**使用。

规则以JSON格式存储。其（简化的）类型描述如下：

```ts
export type Matcher = {
  [key in string]: Condition
}

export type Projector = {
  [key in string]: string | any
}

export interface IRule {
  match: Matcher | Matcher[]
  returns: Projector
}

export interface IRuleSet {
  rules: IRule[]
  defaults?: Projector
}
```

完整的类型描述请参见 `libs/rule` 包中的源码。您不必理解上述类型定义。

### 规则集（RuleSet）

每一处**规则设置**都可以配置一个**规则集**。一个规则集可以视作一个流水线。对于给定的上下文，AOI系统将按照规则集中定义的 `rules` 逐个匹配，若均匹配失败，则使用 `defaults` 中定义的投影器。

### 规则（Rule）

每一个规则都包含两个部分：`match` 和 `returns`。`match` 用于定义规则匹配器，`returns` 用于定义规则投影器。

若匹配器成功匹配，则将返回对应的投影器。

### 规则匹配器（Matcher）

规则匹配器是一个对象，其中：

- 键值为希望匹配的规则上下文中数据的路径（对于嵌套对象，使用 `.` 分隔）
- 值为一个条件对象

条件对象也是一个对象，其中

- 键值为判断类型
- 值为判断条件

支持的判断类型有：

- `$eq` `$ne` `$gt` `$gte` `$lt` `$lte`：将上下文的对应值与给定值进行比较。比较是类型严格的。
- `$in` `$nin`：测试上下文的对应值是否在给定的数组中。
- `$startsWith` `$endsWith`：测试上下文的对应值是否满足给定的字符串条件。若上下文对应值不是字符串，将先转化为字符串。

### 规则投影器（Projector）

规则投影器是一个特殊的对象，其中满足特定条件的值会进行替换。具体如下：

- 若值不为字符串，不进行替换；
- 若值为字符串，但不以 `$` 开头，不进行替换；
- 若值为字符串，且以 `$$` 开头，将移除一个 `$` 并返回；
- 否则，进行替换。

替换时，若键满足 `$.some.path` 形式，将使用匹配上下文中对应路径的值。

## 支持的规则设置

### 比赛

#### 提交规则（solution）

上下文：

```ts
export interface IContestSolutionRuleCtx {
  contest: IContest
  currentStage: IContestStage
  participant: IContestParticipant | null
  currentResult: IContestParticipantResult | null
  solution: ISolution
}
```

返回类型：

```ts
interface Result {
  // 是否显示提交数据
  // true - 显示 false或字符串 - 不显示并返回错误消息
  showData?: boolean | string
}
```

#### 参赛规则（participant）

上下文：

```ts
export interface IContestParticipantRuleCtx {
  contest: IContest
  currentStage: IContestStage
  user: IUser
}
```

返回类型：

```ts
interface Result {
  // 是否允许参赛
  // true - 允许 false或字符串 - 不允许并返回错误消息
  allowRegister?: boolean | string

  // 选手标签 注意：若指定，将覆盖标签规则（Tag Rules）
  tags?: string[]
}
```

### 题目

#### 提交规则（solution）

上下文：

```ts
export interface IProblemSolutionRuleCtx {
  problem: IProblem
  currentResult: IProblemStatus | null
  solution: ISolution
}
```

返回类型：

```ts
interface Result {
  // 是否显示提交数据
  // true - 显示 false或字符串 - 不显示并返回错误消息
  showData?: boolean | string
}
```
