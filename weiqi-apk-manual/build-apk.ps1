$ErrorActionPreference = "Stop"

# 环境变量
$JAVA_HOME = "$env:USERPROFILE\.gradle\jdks\eclipse_adoptium-17-amd64-windows.2"
$ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
$BUILD_TOOLS = "$ANDROID_HOME\build-tools\36.1.0"
$PLATFORM = "$ANDROID_HOME\platforms\android-36"
$PROJECT = "$PSScriptRoot"
$RES = "$PROJECT\app\src\main\res"
$ASSETS = "$PROJECT\app\src\main\assets"
$JAVA_SRC = "$PROJECT\app\src\main\java"
$MANIFEST = "$PROJECT\app\src\main\AndroidManifest.xml"
$BUILD_DIR = "$PROJECT\build"
$GEN_DIR = "$BUILD_DIR\gen"
$OBJ_DIR = "$BUILD_DIR\obj"
$DEX_DIR = "$BUILD_DIR\dex"
$APK_DIR = "$BUILD_DIR\apk"

# 清理
Remove-Item -Recurse -Force $BUILD_DIR -ErrorAction SilentlyContinue
New-Item -ItemType Directory -Force -Path $GEN_DIR, $OBJ_DIR, $DEX_DIR, $APK_DIR | Out-Null

Write-Host "=== 1. 编译资源 (aapt2 compile) ==="
& "$BUILD_TOOLS\aapt2.exe" compile --dir $RES -o "$OBJ_DIR\resources.zip"
if ($LASTEXITCODE -ne 0) { throw "aapt2 compile failed" }

Write-Host "=== 2. 链接资源 (aapt2 link) ==="
& "$BUILD_TOOLS\aapt2.exe" link `
    -I "$PLATFORM\android.jar" `
    --manifest $MANIFEST `
    --java $GEN_DIR `
    -o "$APK_DIR\base.apk" `
    --min-sdk-version 24 `
    --target-sdk-version 36 `
    --version-code 1 `
    --version-name "1.0" `
    --auto-add-overlay `
    "$OBJ_DIR\resources.zip"
if ($LASTEXITCODE -ne 0) { throw "aapt2 link failed" }

Write-Host "=== 3. 编译Java源码 ==="
$javaFiles = Get-ChildItem -Path $JAVA_SRC -Recurse -Filter "*.java" | ForEach-Object { $_.FullName }
$rFiles = Get-ChildItem -Path $GEN_DIR -Recurse -Filter "*.java" | ForEach-Object { $_.FullName }

# Write all java files to a temp file for javac @argument file
$tempArgsFile = "$BUILD_DIR\sources.txt"
[System.IO.File]::WriteAllText($tempArgsFile, (@($javaFiles; $rFiles) -join "`r`n"))

& "$JAVA_HOME\bin\javac.exe" `
    -d $OBJ_DIR `
    -classpath "$PLATFORM\android.jar" `
    --release 17 `
    "@$tempArgsFile"
if ($LASTEXITCODE -ne 0) { throw "javac failed" }

Write-Host "=== 4. DEX转换 (d8) ==="
$classFiles = Get-ChildItem -Path $OBJ_DIR -Recurse -Filter "*.class" | ForEach-Object { $_.FullName }
$tempClassFile = "$BUILD_DIR\classes.txt"
[System.IO.File]::WriteAllText($tempClassFile, ($classFiles -join "`r`n"))

& "$BUILD_TOOLS\d8.bat" `
    --lib "$PLATFORM\android.jar" `
    --output $DEX_DIR `
    --min-api 24 `
    "@$tempClassFile"
if ($LASTEXITCODE -ne 0) { throw "d8 failed" }

Write-Host "=== 5. 添加DEX到APK ==="
$apkPath = "$APK_DIR\base.apk"
$dexPath = "$DEX_DIR\classes.dex"

# 通过反射调用 ZipFile (因为PowerShell无法直接解析该类型)
$asmFileSystem = [System.Reflection.Assembly]::LoadWithPartialName("System.IO.Compression.FileSystem")
$asmCompression = [System.Reflection.Assembly]::LoadWithPartialName("System.IO.Compression")
$zipFileType = $asmFileSystem.GetType("System.IO.Compression.ZipFile")
$zipArchiveModeType = $asmCompression.GetType("System.IO.Compression.ZipArchiveMode")
$zipExtType = $asmFileSystem.GetType("System.IO.Compression.ZipFileExtensions")

$updateMode = [Enum]::Parse($zipArchiveModeType, "Update")
$openMethod = $zipFileType.GetMethod("Open", [type[]]@([string], $zipArchiveModeType))
$createMethod = $zipExtType.GetMethod("CreateEntryFromFile", [type[]]@($asmCompression.GetType("System.IO.Compression.ZipArchive"), [string], [string]))

function AddToZip($zipPath, $filePath, $entryName) {
    $zip = $openMethod.Invoke($null, @($zipPath, $updateMode))
    try {
        $getEntry = $zip.GetType().GetMethod("GetEntry")
        $entry = $getEntry.Invoke($zip, @($entryName))
        if ($entry) { $entry.GetType().GetMethod("Delete").Invoke($entry, @()) }
        $createMethod.Invoke($null, @($zip, $filePath, $entryName))
    } finally { $zip.GetType().GetMethod("Dispose").Invoke($zip, @()) }
}

AddToZip $apkPath $dexPath "classes.dex"
Write-Host "DEX added"

Write-Host "=== 6. 添加assets到APK ==="
$assetFiles = Get-ChildItem -Path $ASSETS -Recurse -File
foreach ($file in $assetFiles) {
    $relativePath = $file.FullName.Substring($ASSETS.Length + 1).Replace('\', '/')
    AddToZip $apkPath $file.FullName "assets/$relativePath"
}
Write-Host "Assets added"

Write-Host "=== 7. 对齐APK (zipalign) ==="
$alignedApk = "$APK_DIR\weiqi-aligned.apk"
& "$BUILD_TOOLS\zipalign.exe" -f -p 4 $apkPath $alignedApk
if ($LASTEXITCODE -ne 0) { throw "zipalign failed" }

Write-Host "=== 8. 签名APK (apksigner) ==="
# 使用debug keystore
$keystore = "$env:USERPROFILE\.android\debug.keystore"
if (-not (Test-Path $keystore)) {
    # 生成debug keystore
    & "$JAVA_HOME\bin\keytool.exe" -genkey -v `
        -keystore $keystore `
        -storepass android `
        -alias androiddebugkey `
        -keypass android `
        -keyalg RSA `
        -keysize 2048 `
        -validity 10000 `
        -dname "CN=Android Debug,O=Android,C=US"
}

# 生成带时间戳的APK文件名
$timestamp = (Get-Date).ToString("yyyyMMdd-HHmmss")
Write-Host "时间戳: $timestamp"
$finalApk = "$APK_DIR\weiqi-debug-$timestamp.apk"
Write-Host "APK路径: $finalApk"
& "$BUILD_TOOLS\apksigner.bat" sign `
    --ks $keystore `
    --ks-pass pass:android `
    --ks-key-alias androiddebugkey `
    --key-pass pass:android `
    --out $finalApk `
    $alignedApk
if ($LASTEXITCODE -ne 0) { throw "apksigner failed" }

Write-Host ""
Write-Host "=== 构建成功! ==="
Write-Host "APK位置: $finalApk"
$apkSize = (Get-Item $finalApk).Length
Write-Host "APK大小: $([math]::Round($apkSize / 1KB, 1)) KB"

# 复制到项目根目录方便查找
Copy-Item -Force $finalApk "$PROJECT\weiqi-debug-$timestamp.apk"
Write-Host "已复制到: $PROJECT\weiqi-debug-$timestamp.apk"