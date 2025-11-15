# run_migrations.ps1
# Usage:
#   .\run_migrations.ps1 -DatabaseUrl "postgres://user:pass@host:5432/dbname"       (run only migration)
#   .\run_migrations.ps1 -DatabaseUrl "..." -Seed                               (run migration + seed)
param(
  [Parameter(Mandatory=$true)][string]$DatabaseUrl,
  [switch]$Seed
)

function Run-With-PSQL($dburl, $file) {
  Write-Host "Running psql for $file ..."
  & psql $dburl -f $file
  if ($LASTEXITCODE -ne 0) { throw "psql failed for $file (exit $LASTEXITCODE)" }
}

function Run-With-Docker($dburl, $file) {
  Write-Host "Running psql inside postgres docker for $file ..."
  # Convert Windows path to unix-style for Docker mount
  $pwdUnix = (Get-Item -Path ".").FullName -replace '\\','/'
  docker run --rm -v "${pwdUnix}:/work" postgres:15 psql "$dburl" -f "/work/$file"
  if ($LASTEXITCODE -ne 0) { throw "docker psql failed for $file (exit $LASTEXITCODE)" }
}

try {
  if (Get-Command psql -ErrorAction SilentlyContinue) {
    Run-With-PSQL $DatabaseUrl "db/migrations/001_create_jobs.sql"
    if ($Seed) { Run-With-PSQL $DatabaseUrl "db/migrations/001_seed_jobs.sql" }
  } elseif (Get-Command docker -ErrorAction SilentlyContinue) {
    Run-With-Docker $DatabaseUrl "db/migrations/001_create_jobs.sql"
    if ($Seed) { Run-With-Docker $DatabaseUrl "db/migrations/001_seed_jobs.sql" }
  } else {
    throw "Neither psql nor docker CLI is available. Please install psql or docker and retry."
  }

  Write-Host "Migration completed successfully."
} catch {
  Write-Error $_
  exit 1
}