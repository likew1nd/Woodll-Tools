## 配置

设置全局配置

```shell
git config --global user.name "[name]"
git config --global user.email "[email]"
```

## 开始使用

创建 git 仓库

```shell
git init
```

克隆已有 git 仓库

```shell
git clone [url]
```

## 提交

提交所有已跟踪的修改

```shell
git commit -am "[commit message]"
```

将新的修改追加到上一次提交

```shell
git commit --amend --no-edit
```

## 我出了点问题

修改最近一次提交的提交信息

```shell
git commit --amend
```

撤销最近一次提交并保留改动

```shell
git reset HEAD~1
```

撤销最近 N 次提交并保留改动

```shell
git reset HEAD~N
```

撤销最近一次提交并丢弃改动

```shell
git reset HEAD~1 --hard
```

将分支重置为远端状态

```shell
git fetch origin
git reset --hard origin/[branch-name]
```

## 其他

将本地主分支重命名为 main

```shell
git branch -m master main
```
