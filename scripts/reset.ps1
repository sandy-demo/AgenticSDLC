$ErrorActionPreference = 'Stop'
& node (Join-Path $PSScriptRoot 'reset.mjs') @args
exit $LASTEXITCODE
