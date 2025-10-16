<#
PowerShell helper: publish.ps1

Usage:
- From project root run: .\publish.ps1

What it does (interactive):
1) Initializes git if not present
2) Creates a commit with all changes
3) If `gh` CLI is installed it prompts to create a GitHub repo and will push to origin
4) Optionally creates a `gh-pages` branch to publish the frontend (static files) to GitHub Pages

Notes:
- Requires Git installed. For automatic repo creation it requires GitHub CLI `gh` (optional).
- If you don't want automatic creation, choose the manual option and then set the `origin` remote yourself.
#>

param(
    [switch]$CreatePagesBranch = $false
)

function Prompt-YesNo($msg){
    $r = Read-Host "$msg (y/n)"
    return $r -match '^[yY]'
}

# Ensure we're in repository root (script location)
Set-Location -Path $PSScriptRoot

if(-not (Test-Path .git)){
    Write-Host "Git repo not found. Initializing git..."
    git init
} else {
    Write-Host "Git repository found."
}

# Stage and commit
git add -A
$commitMsg = Read-Host "Mensaje de commit (enter para usar mensaje por defecto)"
if([string]::IsNullOrWhiteSpace($commitMsg)) { $commitMsg = "Demo: actualizacion/prepare-publish" }
# Try commit; if empty commit fails, continue
try { git commit -m "$commitMsg" } catch { Write-Host "No se pudo crear commit (quizá no hay cambios). Continuando..." }

# Remote
$hasOrigin = (git remote | Select-String -Pattern "origin") -ne $null
if(-not $hasOrigin){
    if(Get-Command gh -ErrorAction SilentlyContinue){
        if(Prompt-YesNo "¿Deseas crear el repo en GitHub usando gh CLI y hacer push ahora?"){
            $repoName = Read-Host "Nombre para el repo en GitHub (ej: enfermeriaaunclick.com)"
            if([string]::IsNullOrWhiteSpace($repoName)) { $repoName = (Split-Path -Leaf $PSScriptRoot) }
            gh repo create $repoName --public --source=. --remote=origin --push
            Write-Host "Repositorio creado y push realizado."
        } else {
            Write-Host "Por favor crea el repo en GitHub y añade el remote 'origin' manualmente."
        }
    } else {
        Write-Host "No se detectó 'gh' CLI. Por favor crea el repo en GitHub y luego añade el remote 'origin' manualmente."
    }
} else {
    Write-Host "Remote 'origin' ya configurado. Push a main..."
    git push -u origin main
}

# Optionally create gh-pages branch
if($CreatePagesBranch -or (Prompt-YesNo "¿Deseas crear una rama 'gh-pages' para publicar el frontend en GitHub Pages ahora?")){
    Write-Host "Creando rama gh-pages y publicando..."
    # Create orphan branch that only contains static files (demo.html, demo.css, demo.js, imagenes)
    git checkout --orphan gh-pages
    git reset --hard
    # keep only demo files
    $keep = @('demo.html','demo.css','demo.js','imagenes','index.html','README.md')
    # Remove everything then restore keep files from main
    git clean -fdx
    git checkout main -- $keep
    git add -A
    git commit -m "Publicar frontend a gh-pages"
    git push -u origin gh-pages --force
    # return to main
    git checkout main
    Write-Host "gh-pages creada y publicada. Habilita GitHub Pages en el repo settings si es necesario."
}

Write-Host "Proceso finalizado. Si necesitas la URL pública de GitHub Pages, habilítala en el repo (Settings → Pages)."