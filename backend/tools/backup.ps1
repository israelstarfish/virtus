# Caminho da pasta raiz do projeto
$projetoRoot = "C:\Users\Mael\Desktop\virtuscloud - Copia"

# Caminho da pasta de backups
$backupRoot = Join-Path $projetoRoot "backups\virtuscloud"

# Gerar timestamp no formato yyyyMMddHHmmss
$timestamp = Get-Date -Format "yyyyMMddHHmmss"

# Caminho da nova pasta de backup
$backupDestino = Join-Path $backupRoot "virtuscloud-$timestamp"

# Criar a pasta de destino
New-Item -ItemType Directory -Path $backupDestino -Force | Out-Null

# Lista de itens para backup
$itensParaBackup = @("backend", "frontend", ".env")

foreach ($item in $itensParaBackup) {
    $origem = Join-Path $projetoRoot $item
    $destino = Join-Path $backupDestino $item

    if (Test-Path $origem) {
        Copy-Item -Path $origem -Destination $destino -Recurse -Force
        Write-Host "Backup feito: $item"
    } else {
        Write-Host "Item não encontrado: $item"
    }
}

Write-Host ""
Write-Host "Backup concluído em: $backupDestino"