# ArrivAI — deploy to Vercel (two projects: API + frontend)
# Prerequisites: npm install, vercel login (run once interactively)

param(
  [string]$ApiUrl = ""
)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot

Write-Host "`n=== ArrivAI Vercel deploy ===" -ForegroundColor Cyan
Write-Host "You need: vercel login (once), env vars set in Vercel dashboard`n"

# SSL workaround for networks that block cert verification (dev only)
if ($env:ANTHROPIC_INSECURE_SSL -eq "true") {
  $env:NODE_TLS_REJECT_UNAUTHORIZED = "0"
}

Set-Location $Root
Write-Host "1/2 Deploying API from $Root ..." -ForegroundColor Yellow
vercel --prod
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

if (-not $ApiUrl) {
  $ApiUrl = Read-Host "Paste your API production URL (e.g. https://arrivaai-api.vercel.app)"
}
$ApiUrl = $ApiUrl.TrimEnd("/")

$frontendConfig = Join-Path $Root "frontend\vercel.json"
$config = Get-Content $frontendConfig -Raw
$config = $config -replace "https://arrivaai-api\.vercel\.app", $ApiUrl
Set-Content $frontendConfig $config -NoNewline
Write-Host "Updated frontend/vercel.json API proxy -> $ApiUrl" -ForegroundColor Green

Set-Location (Join-Path $Root "frontend")
Write-Host "`n2/2 Deploying frontend ..." -ForegroundColor Yellow
vercel --prod
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "`nDone. Set env vars in Vercel dashboard if not already:" -ForegroundColor Cyan
Write-Host "  API project: ANTHROPIC_API_KEY, FIREBASE_SERVICE_ACCOUNT_JSON (optional)"
Write-Host "  Frontend project: VITE_MAPTILER_KEY (optional)"
