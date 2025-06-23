#!/bin/bash

# 1. 将提交信息作为脚本的第一个参数
COMMIT_MESSAGE=$1

# 检查是否提供了提交信息，如果没有则退出
if [ -z "$COMMIT_MESSAGE" ]; then
  echo "错误：请输入提交信息！"
  echo "用法: ./your_script_name.sh \"你的提交信息\""
  exit 1
fi

# 2. 获取当前分支的名称 (更通用)
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)

# --- Git 操作开始 ---

# 设置仓库为安全目录 (建议作为一次性手动操作，但如果坚持保留，放在这里也可以)
# git config --global --add safe.directory "$(pwd)"

echo "正在向分支 '$CURRENT_BRANCH' 添加文件..."
git add .

echo "创建提交..."
git commit -m "$COMMIT_MESSAGE"

# 检查远程仓库 'origin' 是否存在
if git remote | grep -q "origin"; then
  echo "远程仓库 'origin' 已存在，确保URL正确..."
  # 这一步通常不需要每次都执行，除非你的URL变了
  # git remote set-url origin https://github.com/quzhupeng/spring-snow-food-report-auth.git
else
  echo "添加远程仓库 'origin'..."
  git remote add origin https://github.com/quzhupeng/spring-snow-food-report-auth.git
fi

echo "推送代码到GitHub的 '$CURRENT_BRANCH' 分支..."
# 3. 使用动态获取的分支名进行推送
git push -u origin "$CURRENT_BRANCH"

echo "✅ 代码已成功推送到GitHub仓库！"
echo "查看链接: https://github.com/quzhupeng/spring-snow-food-report-auth/tree/$CURRENT_BRANCH"