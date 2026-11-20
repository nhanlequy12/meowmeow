; Móc thêm cho trình cài NSIS của Tauri (bundle.windows.nsis.installerHooks).
; Sau khi gỡ (không phải lúc cập nhật đè):
; - xóa khóa HKCU\Software\Mèo Xu\Mèo Xu mà trình cài ghi (mẫu của Tauri chỉ xóa khi đánh dấu ô "Xóa dữ liệu app");
; - người chơi đánh dấu ô "Xóa dữ liệu app" thì xóa luôn bản lưu thật ở %APPDATA%\Mèo Xu
;   (app lưu ở đó, không ở %APPDATA%\vn.meoxu.app mà mẫu của Tauri xóa). Không đánh dấu thì bản lưu còn nguyên.
!macro NSIS_HOOK_POSTUNINSTALL
  ${If} $UpdateMode <> 1
    DeleteRegKey HKCU "${MANUPRODUCTKEY}"
    DeleteRegKey /ifempty HKCU "${MANUKEY}"
    ${If} $DeleteAppDataCheckboxState = 1
      RmDir /r "$APPDATA\${PRODUCTNAME}"
    ${EndIf}
  ${EndIf}
!macroend
