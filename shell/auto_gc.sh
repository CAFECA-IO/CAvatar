#!/bin/zsh

# 刪除 tmp 資料夾中建立時間超過 24 小時的檔案
find "$(dirname "$0")/../tmp" -type f -ctime +1 -exec rm -f {} +
