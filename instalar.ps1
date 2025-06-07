# Criar diretório para download
New-Item -ItemType Directory -Path "$env:USERPROFILE\Downloads\nodejs" -Force

# Download do Node.js LTS (versão 20.10.0 que é a última LTS estável)
Invoke-WebRequest -Uri "https://nodejs.org/dist/v20.10.0/node-v20.10.0-win-x64.zip" -OutFile "$env:USERPROFILE\Downloads\nodejs\nodejs.zip"

# Criar diretório para instalação local
New-Item -ItemType Directory -Path "$env:USERPROFILE\nodejs" -Force

# Extrair o ZIP
Expand-Archive -Path "$env:USERPROFILE\Downloads\nodejs\nodejs.zip" -DestinationPath "$env:USERPROFILE\Downloads\nodejs" -Force

# Mover os arquivos para o diretório de instalação
Move-Item -Path "$env:USERPROFILE\Downloads\nodejs\node-v20.10.0-win-x64\*" -Destination "$env:USERPROFILE\nodejs" -Force

# Adicionar ao PATH do usuário
$userPath = [Environment]::GetEnvironmentVariable("Path", "User")
if (-not $userPath.Contains("$env:USERPROFILE\nodejs")) {
    [Environment]::SetEnvironmentVariable(
        "Path",
        "$userPath;$env:USERPROFILE\nodejs",
        "User"
    )
}

# Limpar arquivos temporários
Remove-Item -Path "$env:USERPROFILE\Downloads\nodejs" -Recurse -Force

Write-Host "Node.js foi instalado em $env:USERPROFILE\nodejs"
Write-Host "Por favor, feche e reabra o PowerShell para que as alterações no PATH tenham efeito"