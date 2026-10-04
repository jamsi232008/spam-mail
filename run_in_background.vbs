Set WshShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")
currentDir = fso.GetParentFolderName(WScript.ScriptFullName)

' Stop any existing instances on ports 5000 and 5173 first
WshShell.Run "cmd /c for /f ""tokens=5"" %a in ('netstat -aon ^| findstr "":5000 :5173"" ^| findstr ""LISTENING""') do taskkill /F /PID %a", 0, True

' Start Backend completely hidden
WshShell.Run "cmd /c cd /d """ & currentDir & """ && start_backend.bat", 0, False

' Wait 3 seconds
WScript.Sleep 3000

' Start Frontend completely hidden
WshShell.Run "cmd /c cd /d """ & currentDir & "\frontend"" && npm run dev", 0, False

' Wait 2 seconds and open browser
WScript.Sleep 2500
WshShell.Run "http://localhost:5173", 1, False

MsgBox "Smart Spam Shield is now running silently in the background!" & vbCrLf & vbCrLf & _
       "• Dashboard: http://localhost:5173" & vbCrLf & _
       "• Backend: http://127.0.0.1:5000" & vbCrLf & vbCrLf & _
       "To stop services at any time, run 'stop_application.bat'.", vbInformation, "Smart Spam Shield"
