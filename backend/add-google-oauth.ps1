# PowerShell script to add Google OAuth credentials to .env file

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Google OAuth Setup for Backend" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Check if .env file exists
if (-not (Test-Path ".env")) {
    Write-Host "Error: .env file not found!" -ForegroundColor Red
    Write-Host "Please create a .env file first." -ForegroundColor Yellow
    exit 1
}

Write-Host "Current .env file found." -ForegroundColor Green
Write-Host ""

# Check if Google OAuth variables already exist
$envContent = Get-Content ".env" -Raw
if ($envContent -match "GOOGLE_CLIENT_ID") {
    Write-Host "Google OAuth variables already exist in .env file." -ForegroundColor Yellow
    Write-Host "Please edit them manually if needed." -ForegroundColor Yellow
    exit 0
}

Write-Host "Adding Google OAuth variables to .env file..." -ForegroundColor Yellow
Write-Host ""

# Add Google OAuth variables
$googleOAuthVars = @"

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_CALLBACK_URL=http://localhost:5001/api/auth/google/callback
"@

Add-Content -Path ".env" -Value $googleOAuthVars

Write-Host "✅ Google OAuth variables added to .env file!" -ForegroundColor Green
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "1. Get your Google OAuth credentials from:" -ForegroundColor White
Write-Host "   https://console.cloud.google.com/" -ForegroundColor Yellow
Write-Host ""
Write-Host "2. Edit the .env file and replace:" -ForegroundColor White
Write-Host "   - your_google_client_id_here" -ForegroundColor Yellow
Write-Host "   - your_google_client_secret_here" -ForegroundColor Yellow
Write-Host ""
Write-Host "3. In Google Cloud Console, add this redirect URI:" -ForegroundColor White
Write-Host "   http://localhost:5001/api/auth/google/callback" -ForegroundColor Yellow
Write-Host ""
Write-Host "4. Restart your backend server" -ForegroundColor White
Write-Host ""
Write-Host "See GOOGLE_OAUTH_SETUP.txt for detailed instructions." -ForegroundColor Cyan
