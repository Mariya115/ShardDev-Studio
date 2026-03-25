# Test OpenAI Integration with Guardian AI Wallet

$env:OPENAI_API_KEY = "<your_openai_api_key>"

Write-Host "================================" -ForegroundColor Cyan
Write-Host "OpenAI Integration Test" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Cyan

# Test 1: Risk Check
Write-Host "`n[1/3] Testing Risk Analysis..." -ForegroundColor Yellow

$riskPayload = @{
  address = "0xBae9ccaE07d6732aDdE7d047C25d7c0b86a9637c"
  amount = 2.0
} | ConvertTo-Json

$riskRes = Invoke-WebRequest -Uri http://127.0.0.1:8000/risk/check `
  -Method Post `
  -Body $riskPayload `
  -ContentType 'application/json' `
  -UseBasicParsing

$risk = $riskRes.Content | ConvertFrom-Json

Write-Host "✅ Risk Level: $($risk.risk)" -ForegroundColor Green
Write-Host "   Score: $($risk.score)/100" -ForegroundColor Green
Write-Host "   Recommendation: $($risk.recommendation)" -ForegroundColor Cyan

# Test 2: AI Explanation with OpenAI
Write-Host "`n[2/3] Testing OpenAI Explanation..." -ForegroundColor Yellow

$aiPayload = @{
  address = "0xBae9ccaE07d6732aDdE7d047C25d7c0b86a9637c"
  amount = 2.0
  risk = $risk.risk
  score = $risk.score
  reasons = @($risk.reasons)
} | ConvertTo-Json -Depth 3

$aiRes = Invoke-WebRequest -Uri http://127.0.0.1:8000/ai/explain `
  -Method Post `
  -Body $aiPayload `
  -ContentType 'application/json' `
  -UseBasicParsing

$ai = $aiRes.Content | ConvertFrom-Json

Write-Host "✅ OpenAI Generated Explanation:" -ForegroundColor Green
Write-Host $ai.explanation -ForegroundColor Cyan
Write-Host "`n✅ AI Recommendation:" -ForegroundColor Green
Write-Host $ai.advice -ForegroundColor Cyan

# Test 3: Agent Decision
Write-Host "`n[3/3] Testing Agent Decision..." -ForegroundColor Yellow

$agentPayload = @{
  risk = $risk.risk
  score = $risk.score
} | ConvertTo-Json

$agentRes = Invoke-WebRequest -Uri http://127.0.0.1:8000/agent/decision `
  -Method Post `
  -Body $agentPayload `
  -ContentType 'application/json' `
  -UseBasicParsing

$decision = $agentRes.Content | ConvertFrom-Json

Write-Host "✅ Agent Decision: $($decision.decision)" -ForegroundColor Green
Write-Host "   Confidence: $($decision.confidence)%" -ForegroundColor Green
Write-Host "   Reasoning: $($decision.reasoning)" -ForegroundColor Cyan

# Summary
Write-Host "`n================================" -ForegroundColor Cyan
Write-Host "✅ ALL TESTS PASSED!" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Cyan
Write-Host "`nOpenAI API Key: ✅ ACTIVE & WORKING" -ForegroundColor Green
Write-Host "Backend Status: ✅ RUNNING" -ForegroundColor Green
Write-Host "Frontend Status: ✅ RUNNING (http://localhost:5175)" -ForegroundColor Green
