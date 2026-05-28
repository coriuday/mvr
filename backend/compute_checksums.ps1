Get-ChildItem "migrations\*.sql" | Sort-Object Name | ForEach-Object {
    $bytes = [System.IO.File]::ReadAllBytes($_.FullName)
    $sha = [System.Security.Cryptography.SHA384]::Create()
    $hash = $sha.ComputeHash($bytes)
    $hex = ($hash | ForEach-Object { $_.ToString("x2") }) -join ""
    "$($_.Name): $hex"
}
