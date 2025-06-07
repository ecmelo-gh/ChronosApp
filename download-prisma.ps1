# Defina o commit correto do Prisma
$commit = "2060c79ba17c6bb9f5823312b6f6b7f4a845738e"
$url = "https://binaries.prisma.sh/all_commits/$commit/windows/query_engine.dll.node.gz"

# Configurações de SSL/TLS
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
[System.Net.ServicePointManager]::ServerCertificateValidationCallback = {$true}
Add-Type @"
    using System.Net;
    using System.Security.Cryptography.X509Certificates;
    public class TrustAllCertsPolicy : ICertificatePolicy {
        public bool CheckValidationResult(
            ServicePoint srvPoint, X509Certificate certificate,
            WebRequest request, int certificateProblem) {
            return true;
        }
    }
"@
[System.Net.ServicePointManager]::CertificatePolicy = New-Object TrustAllCertsPolicy

Write-Host "Baixando arquivo de $url..."
try {
    $webClient = New-Object System.Net.WebClient
    Write-Host "Iniciando download..."
    $webClient.DownloadFile($url, "query_engine.dll.node.gz")
    Write-Host "Download concluído"
    
    # Criar diretório .prisma/client se não existir
    if (!(Test-Path ".prisma/client")) {
        New-Item -ItemType Directory -Force -Path ".prisma/client"
    }
    
    # Mover para o diretório correto
    Move-Item -Force "query_engine.dll.node.gz" ".prisma/client/query_engine.dll.node"
    Write-Host "Arquivo movido para .prisma/client/query_engine.dll.node"
} catch {
    Write-Host "Erro ao baixar arquivo:"
    Write-Host $_.Exception.Message
    Write-Host $_.Exception.GetType().FullName
} finally {
    # Restaurar configurações padrão
    [System.Net.ServicePointManager]::CertificatePolicy = $null
    [System.Net.ServicePointManager]::ServerCertificateValidationCallback = $null
}