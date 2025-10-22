# PowerShell script to restart backend

Write-Host "🔴 Stopping all Node processes..." -ForegroundColor Red
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 2

Write-Host "✅ All Node processes stopped" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 Starting backend server..." -ForegroundColor Cyan
Write-Host ""

Set-Location backend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm start"

Write-Host "⏳ Waiting for server to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

Write-Host ""
Write-Host "✅ Backend should be starting now!" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Testing API..." -ForegroundColor Cyan

try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000/api/learning-paths/paths" -ErrorAction Stop
    Write-Host "✅ API is working! Found learning paths!" -ForegroundColor Green
} catch {
    Write-Host "⚠️  API not ready yet. Wait a few more seconds and try:" -ForegroundColor Yellow
    Write-Host "   Invoke-WebRequest -Uri 'http://localhost:5000/api/learning-paths/paths'" -ForegroundColor White
}

Write-Host ""
Write-Host "🌐 Now open: http://localhost:5173/learning-paths" -ForegroundColor Cyan
Write-Host "   (Make sure to set filters to 'All Categories' and 'All Levels')" -ForegroundColor Yellow
