; Móc thêm cho trình cài NSIS của Tauri (bundle.windows.nsis.installerHooks).
; Sau khi gỡ (không phải lúc cập nhật đè):
; - xóa khóa HKCU\Software\Mèo Xu\Mèo Xu mà trình cài ghi (mẫu của Tauri chỉ xóa khi đánh dấu ô "Xóa dữ liệu app");
; - xóa giá trị khởi động cùng Windows (Run, StartupApproved) và AUMID thông báo vn.meoxu.app mà app ghi;
; - người chơi đánh dấu ô "Xóa dữ liệu app" thì xóa luôn bản lưu thật ở %APPDATA%\Mèo Xu
;   (app lưu ở đó, không ở %APPDATA%\vn.meoxu.app mà mẫu của Tauri xóa). Không đánh dấu thì bản lưu còn nguyên.
!macro NSIS_HOOK_POSTUNINSTALL
  ${If} $UpdateMode <> 1
    DeleteRegKey HKCU "${MANUPRODUCTKEY}"
    DeleteRegKey /ifempty HKCU "${MANUKEY}"
    ; Khởi động cùng Windows (app ghi khi người chơi bật trong Cài đặt) và AUMID cho thông báo (app ghi lần đầu hiện toast).
    DeleteRegValue HKCU "Software\Microsoft\Windows\CurrentVersion\Run" "${PRODUCTNAME}"
    DeleteRegValue HKCU "Software\Microsoft\Windows\CurrentVersion\Explorer\StartupApproved\Run" "${PRODUCTNAME}"
    DeleteRegKey HKCU "Software\Classes\AppUserModelId\vn.meoxu.app"
    DeleteRegKey /ifempty HKCU "Software\Classes\AppUserModelId"
    ${If} $DeleteAppDataCheckboxState = 1
      RmDir /r "$APPDATA\${PRODUCTNAME}"
    ${EndIf}
  ${EndIf}
!macroend
