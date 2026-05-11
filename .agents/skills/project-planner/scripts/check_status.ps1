# check_status.ps1
# This script lists the existing artifacts in the system to help the project-planner
# build its "Readiness Report".

$ProjectBase = Get-Location
$GlobalBase = "C:\Users\ddedd\.gemini\antigravity"

$ArtifactTypes = @("workflows", "agents", "rules", "plugins", "skills")

Write-Host "--- PROJECT-LEVEL ARCHITECTURE ---" -ForegroundColor Cyan
foreach ($type in $ArtifactTypes) {
    if (Test-Path "$ProjectBase\.agents\$type") {
        Write-Host "[$type]" -ForegroundColor Green
        Get-ChildItem "$ProjectBase\.agents\$type" | ForEach-Object { Write-Host "  - $($_.Name)" }
    } else {
        Write-Host "[$type] - Folder Missing" -ForegroundColor Gray
    }
}

if (Test-Path "$ProjectBase\mcp_config.json") {
    Write-Host "[MCP] - mcp_config.json present" -ForegroundColor Green
} else {
    Write-Host "[MCP] - mcp_config.json missing" -ForegroundColor Gray
}

Write-Host "`n--- GLOBAL ARCHITECTURE ---" -ForegroundColor Cyan
foreach ($type in $ArtifactTypes) {
    if (Test-Path "$GlobalBase\$type") {
        Write-Host "[$type]" -ForegroundColor Yellow
        Get-ChildItem "$GlobalBase\$type" | ForEach-Object { Write-Host "  - $($_.Name)" }
    } else {
        Write-Host "[$type] - Folder Missing" -ForegroundColor Gray
    }
}

if (Test-Path "$GlobalBase\mcp_config.json") {
    Write-Host "[MCP] - Global mcp_config.json present" -ForegroundColor Green
} else {
    Write-Host "[MCP] - Global mcp_config.json missing" -ForegroundColor Gray
}

Write-Host "`n--- REGISTRY (skills.sh) ---" -ForegroundColor Cyan
if (Test-Path "$ProjectBase\.agents\skills.sh") {
    Write-Host "Registry is present." -ForegroundColor Green
} else {
    Write-Host "Registry (skills.sh) is missing." -ForegroundColor Gray
}
