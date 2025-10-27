"use client";

import { useState } from 'react';
import { redirect } from 'next/navigation';

export default function CavatarLoginPage() {
  // Info: (20251027 - Luphia) 導向 /cards 頁面
  redirect('/cards');

  // Info: (20251027 - Luphia) 使用 React state 來儲存並顯示目前狀態
  const [status, setStatus] = useState<string>('');

  /**
   * Info: (20251027 - Luphia)
   * 觸發 FIDO2 / WebAuthn 登入流程
   */
  const handleFidoLogin = async () => {
    setStatus('正在啟動 FIDO2 登入...');

    try {
      /**
       * Info: (20251027 - Luphia)
       * --- 步驟 1: (模擬) 從伺服器獲取登入選項 (Challenge) ---
       */

      // Info: (20251027 - Luphia) 模擬一個來自伺服器的 challenge (32 位元組的隨機緩衝區)
      const challenge = new Uint8Array(32);
      window.crypto.getRandomValues(challenge);

      // Info: (20251027 - Luphia) 建立 WebAuthn API 需要的選項
      const publicKeyCredentialRequestOptions: PublicKeyCredentialRequestOptions = {
        challenge: challenge.buffer, // Info: (20251027 - Luphia) 必須是 ArrayBuffer

        /**
         * Info: (20251027 - Luphia)
         * 'allowCredentials' 允許您指定伺服器已知的憑證 ID (用戶之前註冊過的)
         * 如果留空，瀏覽器可能會提示用戶選擇儲存在
         * 驗證器上的任何「可發現憑證」(Resident Key)。
         */
        allowCredentials: [],

        userVerification: 'preferred',
      };

      /**
       * Info: (20251027 - Luphia)
       * --- 步驟 2: 呼叫 WebAuthn API ---
       * 這將會觸發瀏覽器/作業系統的提示
       * (例如: Windows Hello, macOS Touch ID, YubiKey PIN, 手機掃描等)
       */
      setStatus('請使用您的 FIDO2 裝置進行驗證...');

      const assertion = await navigator.credentials.get({
        publicKey: publicKeyCredentialRequestOptions
      });

      // Info: (20251027 - Luphia) 如果用戶成功驗證，`assertion` 會包含簽名後的 challenge
      setStatus('驗證成功！正在傳送結果...');
      console.log('FIDO2 Assertion (憑證):', assertion);

      /**
       * Info: (20251027 - Luphia)
       * --- 步驟 3: (模擬) 將 assertion 傳回伺服器進行驗證 ---
       */
      setStatus('FIDO2 提示已觸發。這是一個前端展示，尚未連接後端驗證。');

    } catch (err) {
      // Info: (20251027 - Luphia) 處理錯誤，例如用戶取消、逾時或裝置不符
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

        {/* Info: (20251027 - Luphia) 用於顯示狀態訊息的區域 */}
        <p className="text-sm text-gray-600 min-h-[1.2em]">
          {status}
        </p>

      </div>
    </main>
  );
}
