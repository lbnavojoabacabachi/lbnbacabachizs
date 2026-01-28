# Script para reorganizar y renombrar fotos de la galería
# Liga de Beisbol Navojoa Ejidal

Write-Host "Iniciando reorganizacion de fotos..." -ForegroundColor Cyan

# Obtener el directorio del script
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptPath

# Definir rutas relativas al directorio del script
$basePath = "assets\images\fotos"
$oldPath = "$basePath\2025-2026"
$newPath = "$basePath\2025-01"

# Verificar que las carpetas existan
if (-not (Test-Path $oldPath)) {
    Write-Host "ERROR: No se encuentra la carpeta $oldPath" -ForegroundColor Red
    exit 1
}

# Crear nueva estructura de carpetas
Write-Host "`nCreando nueva estructura de carpetas..." -ForegroundColor Yellow
New-Item -ItemType Directory -Force -Path "$newPath\inauguracion" | Out-Null
New-Item -ItemType Directory -Force -Path "$newPath\juego-estrellas" | Out-Null

# Mover y renombrar fotos de inauguración
Write-Host "`nReorganizando fotos de inauguracion..." -ForegroundColor Yellow
# Buscar carpeta con caracteres especiales
$inauguracionDirs = Get-ChildItem $oldPath -Directory | Where-Object { $_.Name -like "*inaugura*" }
if ($inauguracionDirs) {
    $inauguracionPath = $inauguracionDirs[0].FullName
    $inauguracionFiles = Get-ChildItem $inauguracionPath -File | Where-Object { $_.Extension -match '\.(jpg|jpeg|JPG|JPEG)$' } | Sort-Object Name
    $counter = 1
    foreach ($file in $inauguracionFiles) {
        $extension = if ($file.Extension -eq '.jpeg' -or $file.Extension -eq '.JPEG') { '.jpg' } else { $file.Extension.ToLower() }
        $newName = "2025-01-01-inauguracion-{0:D2}$extension" -f $counter
        $newPathFull = Join-Path "$newPath\inauguracion" $newName
        
        Copy-Item $file.FullName -Destination $newPathFull -Force
        Write-Host "  OK: $($file.Name) -> $newName" -ForegroundColor Green
        $counter++
    }
} else {
    Write-Host "  ADVERTENCIA: No se encuentra la carpeta de inauguracion" -ForegroundColor Yellow
}

# Mapeo de nombres para Juego de Estrellas
$juegoEstrellasMap = @{
    "poniente.JPG-min.jpeg" = "2025-01-18-juego-estrellas-equipo-poniente.jpg"
    "oriente.JPG-min.jpeg" = "2025-01-18-juego-estrellas-equipo-oriente.jpg"
    "campeon jonronero - copia - copia.JPG-min.jpeg" = "2025-01-18-juego-estrellas-campeon-jonronero.jpg"
    "campeon corredor - copia - copia.JPG-min.jpeg" = "2025-01-18-juego-estrellas-campeon-corredor.jpg"
    "campeon tiro - copia - copia.JPG-min.jpeg" = "2025-01-18-juego-estrellas-campeon-tiro.jpg"
    "catcher campeon - copia - copia.JPG-min.jpeg" = "2025-01-18-juego-estrellas-campeon-catcher.jpg"
    "presidium liga.JPG-min.jpeg" = "2025-01-18-juego-estrellas-presidium-liga.jpg"
    "presidium yo.JPG-min.jpeg" = "2025-01-18-juego-estrellas-presidium-01.jpg"
    "presidium 2.JPG-min.jpeg" = "2025-01-18-juego-estrellas-presidium-02.jpg"
    "presidium 4.JPG-min.jpeg" = "2025-01-18-juego-estrellas-presidium-03.jpg"
    "cota karlos.JPG-min.jpeg" = "2025-01-18-juego-estrellas-karlos-cota-01.jpg"
    "karlos kota.JPG-min.jpeg" = "2025-01-18-juego-estrellas-karlos-cota-02.jpg"
    "adolfo.JPG-min.jpeg" = "2025-01-18-juego-estrellas-adolfo.jpg"
    "rosa.JPG-min.jpeg" = "2025-01-18-juego-estrellas-rosa.jpg"
    "rosa y adolfo.JPG-min.jpeg" = "2025-01-18-juego-estrellas-rosa-adolfo.jpg"
    "rosita ortega.JPG-min.jpeg" = "2025-01-18-juego-estrellas-rosita-ortega-01.jpg"
    "rosita ortega 2.JPG-min.jpeg" = "2025-01-18-juego-estrellas-rosita-ortega-02.jpg"
    "juan pablo y yo.JPG-min.jpeg" = "2025-01-18-juego-estrellas-juan-pablo.jpg"
    "juan y yo3.JPG-min.jpeg" = "2025-01-18-juego-estrellas-juan.jpg"
    "jems.JPG-min.jpeg" = "2025-01-18-juego-estrellas-jems.jpg"
    "polito.JPG-min.jpeg" = "2025-01-18-juego-estrellas-polito.jpg"
    "rancho borbon.JPG-min.jpeg" = "2025-01-18-juego-estrellas-rancho-borbon.jpg"
}

# Contador para archivos DSC sin mapeo específico
$dscCounter = 1

# Mover y renombrar fotos del Juego de Estrellas
Write-Host "`nReorganizando fotos del Juego de Estrellas..." -ForegroundColor Yellow
$juegoEstrellasPath = Join-Path $oldPath "Juego de Estrellas"
if (Test-Path $juegoEstrellasPath) {
    $juegoEstrellasFiles = Get-ChildItem $juegoEstrellasPath -File | Where-Object { $_.Extension -match '\.(jpg|jpeg|JPG|JPEG)$' }

    foreach ($file in $juegoEstrellasFiles) {
        $fileName = $file.Name
        
        if ($juegoEstrellasMap.ContainsKey($fileName)) {
            # Usar nombre del mapeo
            $newName = $juegoEstrellasMap[$fileName]
        } elseif ($fileName -match "^DSC\d+") {
            # Renombrar archivos DSC con formato estándar
            $newName = "2025-01-18-juego-estrellas-{0:D2}.jpg" -f $dscCounter
            $dscCounter++
        } else {
            # Mantener nombre pero limpiar y convertir a .jpg
            $cleanName = $fileName -replace " - copia - copia", "" -replace "\.JPG-min", "" -replace "\.jpeg$", ".jpg" -replace "\.JPG$", ".jpg"
            $newName = "2025-01-18-juego-estrellas-$cleanName"
        }
        
        $newPathFull = Join-Path "$newPath\juego-estrellas" $newName
        
        Copy-Item $file.FullName -Destination $newPathFull -Force
        Write-Host "  OK: $fileName -> $newName" -ForegroundColor Green
    }
} else {
    Write-Host "  ADVERTENCIA: No se encuentra la carpeta del Juego de Estrellas" -ForegroundColor Yellow
}

Write-Host "`nReorganizacion completada!" -ForegroundColor Green
Write-Host "`nProximos pasos:" -ForegroundColor Cyan
Write-Host "  1. Revisa las fotos en: $newPath" -ForegroundColor White
Write-Host "  2. El archivo gallery.json ya esta actualizado con las nuevas rutas" -ForegroundColor White
Write-Host "  3. Si todo esta bien, puedes eliminar la carpeta antigua: $oldPath" -ForegroundColor White
Write-Host "`nNOTA: Este script COPIA los archivos. Los originales siguen en $oldPath" -ForegroundColor Yellow
