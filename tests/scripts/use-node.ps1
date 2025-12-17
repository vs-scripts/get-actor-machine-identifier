$ErrorActionPreference = 'Stop'

# Session-local Node activation for this repo
# - Prepends a project-local Node distribution under tests/tools/node
# - Does not modify global PATH, registry, or system Node installation
# - Enforces an exact Node version (strict)

$expectedNodeVersion = 'v24.12.0'

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot '..\..')
$toolsRoot = Join-Path $repoRoot 'tests\tools\node'

$os = 'win32'

$arch = if ($env:PROCESSOR_ARCHITECTURE -eq 'ARM64') { 'arm64' } else { 'x64' }

$nodeHome = Join-Path $toolsRoot "$os-$arch"
$nodeExe = Join-Path $nodeHome 'node.exe'

if (-not (Test-Path $nodeExe)) {
  throw "Node executable not found at: $nodeExe`nExpected layout: tests/tools/node/$os-$arch/node.exe"
}

# Prepend to PATH for current session only
$env:PATH = "$nodeHome;$env:PATH"

$actualNodeVersion = (& node -v).Trim()
if ($actualNodeVersion -ne $expectedNodeVersion) {
  throw "Unexpected Node version: $actualNodeVersion (expected $expectedNodeVersion). Check tests/tools/node contents."
}

# npm should come from the same distribution
$actualNpmVersion = (& npm -v).Trim()
Write-Host "Using node $actualNodeVersion (npm $actualNpmVersion) from $nodeHome"