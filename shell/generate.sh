#!/bin/bash
set -e

# --- 1. 設定 (請根據您的情況修改) ---

# ComfyUI 伺服器運行的網址
COMFY_URL="http://127.0.0.1:8188"

# `dirname "$0"` 會取得執行腳本的路徑
SCRIPT_DIR=$(cd "$(dirname "$0")" && pwd)

# Workflow Export(API) JSON 檔案路徑
WORKFLOW_TEMPLATE="$SCRIPT_DIR/cavatar_workflow.json"

# 儲存下載圖片的資料夾
OUTPUT_DIR="$SCRIPT_DIR/../public/avatars"

# 在您的 workflow_api.json 中找到這些節點 ID。
# 用文字編輯器打開 .json 檔案，找到 "class_type": "CLIPTextEncode" 的節點，
# 記下它的編號 (例如 "6")。通常一個是 Positive，一個是 Negative。
# "class_type": "KSampler" 則是 KSampler 的節點。
NODE_ID_POSITIVE="6"
NODE_ID_NEGATIVE="71"
NODE_ID_KSAMPLER="294"

# --- 2. 檢查工具與輸入 ---

# 檢查 jq 和 curl 是否安裝
command -v jq >/dev/null 2>&1 || { echo >&2 "錯誤：需要 'jq'，請先安裝。"; exit 1; }
command -v curl >/dev/null 2>&1 || { echo >&2 "錯誤：需要 'curl'，請先安裝。"; exit 1; }

# 檢查工作流程檔案是否存在
if [ ! -f "$WORKFLOW_TEMPLATE" ]; then
    echo >&2 "錯誤：找不到工作流程檔案 '$WORKFLOW_TEMPLATE'"
    echo >&2 "請先從 ComfyUI 介面 'Save (API Format)' 並儲存。"
    exit 1
fi

# 檢查是否提供了 Prompt
if [ -z "$1" ]; then
    echo "用法： ./generate.sh \"你的 Positive Prompt\" [\"你的 Negative Prompt\"]"
    echo "範例： ./generate.sh \"a beautiful landscape, photorealistic\" \"blurry, ugly\""
    exit 1
fi

# 建立輸出資料夾
mkdir -p "$OUTPUT_DIR"

# --- 3. 準備 Payload ---

# 從命令列參數設定 Prompts
POSITIVE_PROMPT="$1"
# 如果提供了第二個參數，則使用它；否則使用預設值
NEGATIVE_PROMPT="${2:-"blurry, low quality, bad anatomy, worst quality"}"
# 產生一個隨機 Client ID 和 Seed
CLIENT_ID=$(uuidgen)
SEED=$RANDOM

echo "--- 任務設定 ---"
echo "Positive Prompt: $POSITIVE_PROMPT"
echo "Negative Prompt: $NEGATIVE_PROMPT"
echo "Seed: $SEED"
echo "--------------------"

# 讀取 JSON 模板，並使用 jq 插入我們的變數
# 1. 讀取 $WORKFLOW_TEMPLATE 檔案
# 2. 修改 Positive Prompt、Negative Prompt 和 KSampler Seed
# 3. 將修改後的 JSON 包裝在 API 需要的 'prompt' 和 'client_id' 欄位中
PAYLOAD=$(jq \
    --arg pos_prompt "$POSITIVE_PROMPT" \
    --arg neg_prompt "$NEGATIVE_PROMPT" \
    --argjson seed "$SEED" \
    --arg pos_id "$NODE_ID_POSITIVE" \
    --arg neg_id "$NODE_ID_NEGATIVE" \
    --arg ksampler_id "$NODE_ID_KSAMPLER" \
    --arg client_id "$CLIENT_ID" \
    '
    # 修改 Positive Prompt
    (.[$pos_id].inputs.text = $pos_prompt) |
    # 修改 Negative Prompt
    (.[$neg_id].inputs.text = $neg_prompt) |
    # 修改 Seed
    (.[$ksampler_id].inputs.seed = $seed) |
    # 最後，將修改後的工作流程包裝在 API payload 中
    {client_id: $client_id, prompt: .}
    ' \
    "$WORKFLOW_TEMPLATE")

# --- 4. 提交任務到 ComfyUI ---

echo "正在提交任務到 ComfyUI..."
# 使用 curl 提交 POST 請求
# -s : 安靜模式
# -X POST : 指定 POST 方法
# -H "..." : 設定 Content-Type 標頭
# -d "$PAYLOAD" : 傳送我們的 JSON payload
RESPONSE=$(curl -s -X POST -H "Content-Type: application/json" -d "$PAYLOAD" "$COMFY_URL/prompt")

# 從 ComfyUI 的回應中提取 prompt_id
PROMPT_ID=$(echo "$RESPONSE" | jq -r '.prompt_id')

if [ -z "$PROMPT_ID" ] || [ "$PROMPT_ID" = "null" ]; then
    echo >&2 "錯誤：提交失敗。伺服器回應："
    echo >&2 "$RESPONSE"
    exit 1
fi

echo "任務已提交，ID: $PROMPT_ID"

# --- 5. 輪詢 (Polling) 結果 ---

echo "正在等待圖片生成..."

while true; do
    # 呼叫 /history API 並傳入我們的 prompt_id
    HISTORY=$(curl -s "$COMFY_URL/history/$PROMPT_ID")
    
    # 檢查回傳的 JSON 中是否 *包含* 我們的 PROMPT_ID 作為 key
    # 這表示任務已經完成
    IS_DONE=$(echo "$HISTORY" | jq -r "if .[\"$PROMPT_ID\"] then \"true\" else \"false\" end")

    if [ "$IS_DONE" = "true" ]; then
        echo "生成完畢。"
        break
    else
        # 如果任務未完成，顯示佇列狀態並等待
        QUEUE_STATUS=$(curl -s "$COMFY_URL/queue")
        QUEUE_RUNNING=$(echo "$QUEUE_STATUS" | jq -r '.queue_running | length')
        QUEUE_PENDING=$(echo "$QUEUE_STATUS" | jq -r '.queue_pending | length')
        echo "等待中... (執行中: $QUEUE_RUNNING, 佇列中: $QUEUE_PENDING)"
        sleep 3
    fi
done

# --- 6. 下載圖片 ---

# 從 history 回應中解析出圖片資訊
# 我們尋找第一個 .outputs 節點中，包含 .images 的陣列，並取第一張圖
IMAGE_DATA=$(echo "$HISTORY" | jq -r ".[\"$PROMPT_ID\"].outputs[] | select(.images) | .images[0]")

if [ -z "$IMAGE_DATA" ] || [ "$IMAGE_DATA" = "null" ]; then
    echo >&2 "錯誤：在任務歷史中找不到輸出圖片。"
    echo >&2 "History Response: $HISTORY"
    exit 1
fi

# 解析圖片的檔名、子資料夾和類型
FILENAME=$(echo "$IMAGE_DATA" | jq -r '.filename')
SUBFOLDER=$(echo "$IMAGE_DATA" | jq -r '.subfolder')
TYPE=$(echo "$IMAGE_DATA" | jq -r '.type')

# 組合圖片下載 URL
IMAGE_URL="$COMFY_URL/view?filename=$FILENAME&subfolder=$SUBFOLDER&type=$TYPE"

# 設定本機儲存路徑
OUTPUT_PATH="$OUTPUT_DIR/$FILENAME"

echo "正在下載圖片: $FILENAME"
# 使用 curl 下載圖片
# -o : 指定輸出檔案路徑
curl -s -o "$OUTPUT_PATH" "$IMAGE_URL"

echo "完成！圖片已儲存至: $OUTPUT_PATH"
