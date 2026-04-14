    # Start both backend and frontend concurrently
Write-Host "Khởi động Backend và Frontend..." -ForegroundColor Green

# Start backend in background
Write-Host "Khởi động Backend (http://localhost:3000)..." -ForegroundColor Cyan
Start-Process -NoNewWindow -FilePath "node" -ArgumentList "server.js" -WorkingDirectory "c:\Users\Admin\Documents\LTGDWEB\KTCK\backend"

# Start frontend in background
Write-Host "Khởi động Frontend (http://localhost:4200)..." -ForegroundColor Cyan
Start-Process -NoNewWindow -FilePath "npm" -ArgumentList "start" -WorkingDirectory "c:\Users\Admin\Documents\LTGDWEB\KTCK\frontend"

Write-Host "`nCả hai server đã khởi động!" -ForegroundColor Green
Write-Host "Frontend:  http://localhost:4200" -ForegroundColor Yellow
Write-Host "Backend:   http://localhost:3000" -ForegroundColor Yellow
Write-Host "`nNhấn Ctrl+C trong terminal để dừng" -ForegroundColor Gray

# Keep this window open
Read-Host "Nhấn Enter để thoát (các server vẫn tiếp tục chạy)"
