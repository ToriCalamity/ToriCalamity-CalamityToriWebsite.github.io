# =====================================================================
# CALAMITY: build-media.ps1
# Copies your videos + thumbnails into this site and links them to the cards.
#
# For each card folder it:
#   1. finds the .mp4 files and puts them in order using the number in the file name
#      (e.g. "Video By Wearecalamity 1.mp4" = 1, "... 2.mp4" = 2)
#   2. gives each video the thumbnail with the SAME number (1.jpg, 2.jpg, 3.jpg...)
#   3. any video still without a thumbnail gets a spare, unnumbered thumbnail (in order)
#   4. copies everything into assets\videos\<card>\ and assets\posters\<card>\ with clean names
#   5. writes media.js, which the website reads
#
# It prints exactly what it matched, and warns about anything odd.
# Run it again any time you add, remove, rename or reorder files.
# =====================================================================

param(
    [string]$Source = "D:\Calamity MGMT\Clients\Chris Charlton\Chris Charlton - ASSET FOLDER\Website Design\Videos",
    [switch]$NoCompress
)

$ErrorActionPreference = "Stop"
$siteRoot = $PSScriptRoot

$useFfmpeg = $false
if (-not $NoCompress) {
    if (Get-Command ffmpeg -ErrorAction SilentlyContinue) {
        $useFfmpeg = $true
        Write-Host "ffmpeg found: videos and thumbnails will be shrunk for the web." -ForegroundColor Green
    } else {
        Write-Host "ffmpeg not found, so files are copied as they are (they may be too big for GitHub)." -ForegroundColor Yellow
        Write-Host "To shrink them, install it once with:  winget install Gyan.FFmpeg   then open a NEW PowerShell and run this again." -ForegroundColor Yellow
    }
}
$totalBytes = 0

# Folder name on your computer  ->  card id used by the website (see config.js)
$map = [ordered]@{
    "Green Screens"       = "green-screens"
    "Faceless"            = "faceless"
    "VOX"                 = "vox-pops"
    "Podcast"             = "podcasts"
    "Talking Head"        = "talking-head"
    "Trends"              = "trends"
    "Skits"               = "skits"
    "Instructional"       = "instructional"
    "Sports"              = "sports"
    "Random but it works" = "random-but-it-works"
}

$videoExt = @(".mp4")
$imageExt = @(".jpg", ".jpeg", ".png", ".webp")

# Uses the LAST number in the file name (1 to 99). No number = 9999 (goes to the end).
function Get-FileNumber([string]$name) {
    $m = [regex]::Match($name, '(\d+)(?!.*\d)')
    if ($m.Success) {
        $n = 0L
        if ([long]::TryParse($m.Groups[1].Value, [ref]$n) -and $n -le 99) { return [int]$n }
    }
    return 9999
}

if (-not (Test-Path -LiteralPath $Source)) {
    Write-Host "Can't find this folder:" -ForegroundColor Red
    Write-Host "  $Source"
    Write-Host "Check the path, or run:  .\build-media.ps1 -Source `"D:\your\folder`""
    exit 1
}

$js = New-Object System.Text.StringBuilder
[void]$js.AppendLine("// Made by build-media.ps1. Run the script again to refresh it.")
[void]$js.AppendLine("window.MEDIA = {")

foreach ($folderName in $map.Keys) {
    $slug = $map[$folderName]
    $dir = Join-Path $Source $folderName

    if (-not (Test-Path -LiteralPath $dir)) {
        Write-Warning "Folder not found, skipping: $dir"
        [void]$js.AppendLine("  `"$slug`": [],")
        continue
    }

    $files = Get-ChildItem -LiteralPath $dir -File

    $videos = @($files | Where-Object { $videoExt -contains $_.Extension.ToLower() } |
        ForEach-Object { [pscustomobject]@{ File = $_; Num = (Get-FileNumber $_.BaseName) } } |
        Sort-Object Num, @{ Expression = { $_.File.Name } })

    $images = @($files | Where-Object { $imageExt -contains $_.Extension.ToLower() } |
        ForEach-Object { [pscustomobject]@{ File = $_; Num = (Get-FileNumber $_.BaseName) } } |
        Sort-Object Num, @{ Expression = { $_.File.Name } })

    # ---- match thumbnails to videos ----
    $assigned = @{}
    $used = New-Object System.Collections.ArrayList

    # pass 1: same number
    for ($k = 0; $k -lt $videos.Count; $k++) {
        $v = $videos[$k]
        if ($v.Num -ne 9999) {
            $match = $images | Where-Object { $_.Num -eq $v.Num -and -not $used.Contains($_.File.FullName) } | Select-Object -First 1
            if ($match) {
                $assigned[$k] = @{ Img = $match; How = "number" }
                [void]$used.Add($match.File.FullName)
            }
        }
    }
    # pass 2: spare thumbnails, in order, for any video still without one
    for ($k = 0; $k -lt $videos.Count; $k++) {
        if (-not $assigned.ContainsKey($k)) {
            $spare = $images | Where-Object { -not $used.Contains($_.File.FullName) } | Select-Object -First 1
            if ($spare) {
                $assigned[$k] = @{ Img = $spare; How = "spare" }
                [void]$used.Add($spare.File.FullName)
            }
        }
    }

    $vidOut = Join-Path $siteRoot "assets\videos\$slug"
    $posOut = Join-Path $siteRoot "assets\posters\$slug"
    New-Item -ItemType Directory -Force -Path $vidOut | Out-Null
    New-Item -ItemType Directory -Force -Path $posOut | Out-Null

    # clear out old copies so removed videos don't linger
    Get-ChildItem -LiteralPath $vidOut -File -ErrorAction SilentlyContinue | Remove-Item -Force
    Get-ChildItem -LiteralPath $posOut -File -ErrorAction SilentlyContinue | Remove-Item -Force

    Write-Host ""
    Write-Host "$folderName  ->  $slug  ($($videos.Count) videos, $($images.Count) thumbnails)" -ForegroundColor Cyan

    # ---- match thumbnails to videos ----
    # 1) same number as the video  2) leftovers (no number, or number that matches nothing)
    $imgByNum = @{}
    $spare = New-Object System.Collections.ArrayList
    foreach ($img in $images) {
        if ($img.Num -ne 9999 -and -not $imgByNum.ContainsKey($img.Num)) { $imgByNum[$img.Num] = $img }
        else { [void]$spare.Add($img) }
    }

    $assigned = @{}
    $guessed = @{}
    $k = 0
    foreach ($v in $videos) {
        $k++
        if ($v.Num -ne 9999 -and $imgByNum.ContainsKey($v.Num)) {
            $assigned[$k] = $imgByNum[$v.Num]
            $imgByNum.Remove($v.Num)
        }
    }
    foreach ($n in ($imgByNum.Keys | Sort-Object)) { [void]$spare.Add($imgByNum[$n]) }

    $k = 0
    foreach ($v in $videos) {
        $k++
        if (-not $assigned.ContainsKey($k) -and $spare.Count -gt 0) {
            $assigned[$k] = $spare[0]
            $spare.RemoveAt(0)
            $guessed[$k] = $true
        }
    }

    [void]$js.AppendLine("  `"$slug`": [")

    $i = 0
    foreach ($v in $videos) {
        $i++
        $poster = $null
        if ($assigned.ContainsKey($i)) { $poster = $assigned[$i] }

        $vidName = "$i.mp4"
        $vidDest = Join-Path $vidOut $vidName
        $srcMB = [math]::Round($v.File.Length / 1MB, 1)
        $done = $false
        if ($useFfmpeg) {
            & ffmpeg -y -loglevel error -i $v.File.FullName -vf "scale='min(720,iw)':-2" -c:v libx264 -preset medium -crf 28 -pix_fmt yuv420p -movflags +faststart -c:a aac -b:a 96k $vidDest
            if ($LASTEXITCODE -eq 0 -and (Test-Path -LiteralPath $vidDest)) { $done = $true }
            else { Write-Warning "ffmpeg could not shrink $($v.File.Name), copying it as it is." }
        }
        if (-not $done) { Copy-Item -LiteralPath $v.File.FullName -Destination $vidDest -Force }
        $sizeMB = [math]::Round((Get-Item -LiteralPath $vidDest).Length / 1MB, 1)
        $totalBytes += (Get-Item -LiteralPath $vidDest).Length
        $line = "  [$i] $($v.File.Name)  ($srcMB MB -> $sizeMB MB)"

        $posterPath = ""
        if ($poster) {
            $posName = "$i" + $poster.File.Extension.ToLower()
            $posDest = Join-Path $posOut $posName
            $posDone = $false
            if ($useFfmpeg) {
                $posName = "$i.jpg"
                $posDest = Join-Path $posOut $posName
                & ffmpeg -y -loglevel error -i $poster.File.FullName -vf "scale='min(720,iw)':-2" -q:v 4 $posDest
                if ($LASTEXITCODE -eq 0 -and (Test-Path -LiteralPath $posDest)) { $posDone = $true }
                else {
                    $posName = "$i" + $poster.File.Extension.ToLower()
                    $posDest = Join-Path $posOut $posName
                }
            }
            if (-not $posDone) { Copy-Item -LiteralPath $poster.File.FullName -Destination $posDest -Force }
            $totalBytes += (Get-Item -LiteralPath $posDest).Length
            $posterPath = "assets/posters/$slug/$posName"
            $line += "  + thumbnail $($poster.File.Name)"
            Write-Host $line
            if ($guessed.ContainsKey($i)) {
                Write-Host "      No matching number, so I paired it with this thumbnail. Check it looks right." -ForegroundColor Yellow
            }
        } else {
            $line += "  (NO THUMBNAIL FOUND)"
            Write-Host $line -ForegroundColor Yellow
        }
        if ($v.Num -eq 9999) { Write-Host "      This video has no number at the end of its name, so it went last." -ForegroundColor Yellow }
        if ($sizeMB -gt 20) { Write-Host "      Still big. GitHub's browser upload stops at 25 MB per file, and phones load big videos slowly." -ForegroundColor Yellow }

        [void]$js.AppendLine("    { `"video`": `"assets/videos/$slug/$vidName`", `"poster`": `"$posterPath`" },")
    }

    foreach ($extra in $spare) {
        Write-Host "  Unused thumbnail (no video for it): $($extra.File.Name)" -ForegroundColor Yellow
    }

    [void]$js.AppendLine("  ],")
}

[void]$js.AppendLine("};")

$target = Join-Path $siteRoot "media.js"
[System.IO.File]::WriteAllText($target, $js.ToString(), (New-Object System.Text.UTF8Encoding($false)))

Write-Host ""
$totalMB = [math]::Round($totalBytes / 1MB, 1)
Write-Host "Total size of videos + thumbnails: $totalMB MB" -ForegroundColor Cyan
Write-Host "Done. Wrote $target" -ForegroundColor Green
Write-Host "Now refresh the website in your browser (Ctrl+F5)."
