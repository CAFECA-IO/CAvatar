// 標記為客戶端組件，因為我們需要使用 React hooks (useState)
// 並且要呼叫瀏覽器 API (navigator.credentials)
"use client";

import { useState } from 'react';

export default function CavatarLoginPage() {
  // 使用 React state 來儲存並顯示目前狀態
  const [status, setStatus] = useState<string>('');

  /**
   * 觸發 FIDO2 / WebAuthn 登入流程
   */
  const handleFidoLogin = async () => {
    setStatus('正在啟動 FIDO2 登入...');

    try {
      // --- 步驟 1: (模擬) 從伺服器獲取登入選項 (Challenge) ---
      //
      // **[極度重要]**
      // 真正的 FIDO2 登入 *必須* 有一個後端 (Relying Party) 配合。
      // 伺服器必須產生一個「challenge」(一個隨機、唯一的加密字串)
      // 並將其發送到客戶端。
      //
      // 為了讓這個範例能 *觸發* 瀏覽器提示，我們 *模擬* 在客戶端產生 challenge。
      // **警告：在生產環境中，challenge 絕不能在客戶端生成！這非常不安全！**

      // 模擬一個來自伺服器的 challenge (32 位元組的隨機緩衝區)
      const challenge = new Uint8Array(32);
      window.crypto.getRandomValues(challenge);

      // 建立 WebAuthn API 需要的選項
      const publicKeyCredentialRequestOptions: PublicKeyCredentialRequestOptions = {
        challenge: challenge.buffer, // 必須是 ArrayBuffer

        // 'allowCredentials' 允許您指定伺服器已知的憑證 ID (用戶之前註冊過的)
        // 如果留空，瀏覽器可能會提示用戶選擇儲存在
        // 驗證器上的任何「可發現憑證」(Resident Key)。
        allowCredentials: [],

        userVerification: 'preferred',
      };

      // --- 步驟 2: 呼叫 WebAuthn API ---
      // 這將會觸發瀏覽器/作業系統的提示
      // (例如: Windows Hello, macOS Touch ID, YubiKey PIN, 手機掃描等)
      setStatus('請使用您的 FIDO2 裝置進行驗證...');

      const assertion = await navigator.credentials.get({
        publicKey: publicKeyCredentialRequestOptions
      });

      // 如果用戶成功驗證，`assertion` 會包含簽名後的 challenge
      setStatus('驗證成功！正在傳送結果...');
      console.log('FIDO2 Assertion (憑證):', assertion);

      // --- 步驟 3: (模擬) 將 assertion 傳回伺服器進行驗證 ---
      //
      // 在實際應用中，您會將 `assertion` 物件 (轉換為 JSON/Base64) 
      // 透過 API 路由 (例如 /api/login/verify) 傳回您的後端。
      //
      // 伺服器會驗證簽名、challenge、來源 (origin) 和計數器 (counter)。

      setStatus('FIDO2 提示已觸發。這是一個前端展示，尚未連接後端驗證。');

    } catch (err) {
      // 處理錯誤，例如用戶取消、逾時或裝置不符
      const error = err as Error;
      setStatus(`登入失敗: ${error.message}`);
      console.error('FIDO2 錯誤:', error);
    }
  };

  return (
    <main className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-xl shadow-lg text-center">

        <h1 className="text-3xl font-bold text-gray-800">
          CAvartar 信任邊境
        </h1>

        <button
          onClick={handleFidoLogin}
          className="w-full px-8 py-4 text-xl font-semibold text-white bg-blue-600 rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 transition duration-300 ease-in-out transform active:scale-95"
        >
          Enter
        </button>

        {/* 用於顯示狀態訊息的區域 */}
        <p className="text-sm text-gray-600 min-h-[1.2em]">
          {status}
        </p>

      </div>
    </main>
  );
}
