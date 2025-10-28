# PowerShell Script to Switch to GPT-3.5 Turbo Model
# Run this for a cheaper but still good quality option

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  Switching to ChatGPT (GPT-3.5 Turbo) Model" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

$envFile = ".env"

# Check if .env exists
if (-not (Test-Path $envFile)) {
    Write-Host "❌ .env file not found!" -ForegroundColor Red
    exit 1
}

# Read .env content
$envContent = Get-Content $envFile -Raw

# Replace model with GPT-3.5 Turbo
$envContent = $envContent -replace "OPENROUTER_MODEL=.*", "OPENROUTER_MODEL=openai/gpt-3.5-turbo"

# If no OPENROUTER_MODEL found, add it
if ($envContent -notmatch "OPENROUTER_MODEL=") {
    $envContent = $envContent.TrimEnd() + "`nOPENROUTER_MODEL=openai/gpt-3.5-turbo`n"
}

# Write back to .env
Set-Content -Path $envFile -Value $envContent -NoNewline

Write-Host "✅ Switched to GPT-3.5 Turbo model!" -ForegroundColor Green
Write-Host ""
Write-Host "Configuration:" -ForegroundColor Cyan
Write-Host "  Model: openai/gpt-3.5-turbo" -ForegroundColor White
Write-Host "  Quality: ⭐⭐⭐⭐ (Very Good)" -ForegroundColor White
Write-Host "  Cost: ~`$0.01 per portfolio (Much cheaper!)" -ForegroundColor White
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Restart backend server (Ctrl+C, then npm start)" -ForegroundColor White
Write-Host "  2. Try generating a portfolio again" -ForegroundColor White
Write-Host ""
