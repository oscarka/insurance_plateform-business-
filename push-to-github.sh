#!/bin/bash
# GitHub推送脚本 - 多种方式尝试

cd "$(dirname "$0")"

echo "=== 尝试推送代码到GitHub ==="
echo "当前分支: $(git branch --show-current)"
echo "待推送的commit:"
git log origin/main..HEAD --oneline

echo ""
echo "方式1: 使用HTTPS推送..."
git remote set-url origin https://github.com/oscarka/insurance_plateform-business-.git
if git push origin main; then
    echo "✅ HTTPS推送成功！"
    exit 0
fi

echo ""
echo "方式2: 使用SSH推送（443端口）..."
git remote set-url origin git@ssh.github.com:oscarka/insurance_plateform-business-.git
if GIT_SSH_COMMAND="ssh -p 443 -o ConnectTimeout=10" git push origin main; then
    echo "✅ SSH(443)推送成功！"
    exit 0
fi

echo ""
echo "方式3: 使用SSH推送（22端口）..."
git remote set-url origin git@github.com:oscarka/insurance_plateform-business-.git
if GIT_SSH_COMMAND="ssh -o ConnectTimeout=10" git push origin main; then
    echo "✅ SSH(22)推送成功！"
    exit 0
fi

echo ""
echo "❌ 所有方式都失败了，请检查："
echo "1. 网络连接是否正常"
echo "2. GitHub认证是否有效"
echo "3. 可以稍后重试，或使用GitHub Desktop"
echo ""
echo "代码已保存在本地，commit信息："
git log -1 --oneline
