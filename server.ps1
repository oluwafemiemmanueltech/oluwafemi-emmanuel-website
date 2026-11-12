$ErrorActionPreference = "Stop"
$root = (Resolve-Path $PSScriptRoot).Path
$listener = [System.Net.HttpListener]::new()
$listener.Prefixes.Add("http://127.0.0.1:4173/")
$listener.Start()
Write-Host "Serving $root at http://127.0.0.1:4173/"
Write-Host "Press Ctrl+C to stop the local server."

$mimeTypes = @{
    ".css" = "text/css; charset=utf-8"
    ".html" = "text/html; charset=utf-8"
    ".js" = "text/javascript; charset=utf-8"
    ".json" = "application/json; charset=utf-8"
    ".jpeg" = "image/jpeg"
    ".jpg" = "image/jpeg"
    ".pdf" = "application/pdf"
    ".mp4" = "video/mp4"
    ".png" = "image/png"
    ".svg" = "image/svg+xml"
    ".txt" = "text/plain; charset=utf-8"
    ".webp" = "image/webp"
    ".xml" = "application/xml; charset=utf-8"
}

try {
    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $responseStarted = $false
        try {
            $relativePath = [Uri]::UnescapeDataString($context.Request.Url.AbsolutePath.TrimStart("/"))
            if ([string]::IsNullOrWhiteSpace($relativePath)) {
                $relativePath = "index.html"
            }
            $relativePath = $relativePath.Replace("/", [IO.Path]::DirectorySeparatorChar)
            $filePath = [IO.Path]::GetFullPath([IO.Path]::Combine($root, $relativePath))
            $rootPrefix = $root.TrimEnd([IO.Path]::DirectorySeparatorChar) + [IO.Path]::DirectorySeparatorChar

            if (-not $filePath.StartsWith($rootPrefix, [StringComparison]::OrdinalIgnoreCase) -and $filePath -ne (Join-Path $root "index.html")) {
                $context.Response.StatusCode = 403
            }
            elseif (-not (Test-Path -LiteralPath $filePath -PathType Leaf)) {
                $context.Response.StatusCode = 404
                $message = [Text.Encoding]::UTF8.GetBytes("Not found")
                $context.Response.ContentType = "text/plain; charset=utf-8"
                $context.Response.ContentLength64 = $message.Length
                $responseStarted = $true
                $context.Response.OutputStream.Write($message, 0, $message.Length)
            }
            else {
                $extension = [IO.Path]::GetExtension($filePath).ToLowerInvariant()
                $context.Response.ContentType = $mimeTypes[$extension]
                $context.Response.Headers.Add("X-Content-Type-Options", "nosniff")
                $context.Response.Headers.Add("Referrer-Policy", "strict-origin-when-cross-origin")
                $fileLength = (Get-Item -LiteralPath $filePath).Length
                $start = 0L
                $end = $fileLength - 1
                $context.Response.Headers.Add("Accept-Ranges", "bytes")
                $rangeHeader = $context.Request.Headers["Range"]

                if ($rangeHeader -match "^bytes=(\d*)-(\d*)$" -and $fileLength -gt 0) {
                    if ($Matches[1] -eq "" -and $Matches[2] -eq "") {
                        $context.Response.StatusCode = 416
                        $context.Response.Headers.Add("Content-Range", "bytes */$fileLength")
                        $context.Response.ContentLength64 = 0
                    }
                    else {
                        if ($Matches[1] -eq "") {
                            $suffixLength = [long]::Parse($Matches[2])
                            $start = [Math]::Max(0L, $fileLength - $suffixLength)
                        }
                        else {
                            $start = [long]::Parse($Matches[1])
                        }

                        if ($Matches[2] -ne "" -and $Matches[1] -ne "") {
                            $end = [long]::Parse($Matches[2])
                        }

                        if ($start -ge $fileLength -or $end -lt $start) {
                            $context.Response.StatusCode = 416
                            $context.Response.Headers.Add("Content-Range", "bytes */$fileLength")
                            $context.Response.ContentLength64 = 0
                        }
                        else {
                            $end = [Math]::Min($end, $fileLength - 1)
                            $context.Response.StatusCode = 206
                            $context.Response.Headers.Add("Content-Range", "bytes $start-$end/$fileLength")
                            $context.Response.ContentLength64 = $end - $start + 1
                        }
                    }
                }
                else {
                    $context.Response.ContentLength64 = $fileLength
                }

                if ($context.Response.StatusCode -ne 416 -and $context.Request.HttpMethod -ne "HEAD") {
                    $stream = [IO.File]::OpenRead($filePath)
                    try {
                        $stream.Position = $start
                        $remaining = $context.Response.ContentLength64
                        $buffer = New-Object byte[] 65536
                        while ($remaining -gt 0) {
                            $bytesToRead = [int][Math]::Min($buffer.Length, $remaining)
                            $bytesRead = $stream.Read($buffer, 0, $bytesToRead)
                            if ($bytesRead -eq 0) {
                                break
                            }
                            $responseStarted = $true
                            $context.Response.OutputStream.Write($buffer, 0, $bytesRead)
                            $remaining -= $bytesRead
                        }
                    }
                    finally {
                        $stream.Dispose()
                    }
                }
            }
        }
        catch {
            if ($responseStarted) {
                [Console]::Error.WriteLine("Request ended while sending a response: $_")
            }
            else {
                try {
                    $context.Response.StatusCode = 500
                    $message = [Text.Encoding]::UTF8.GetBytes("Local server error")
                    $context.Response.ContentType = "text/plain; charset=utf-8"
                    $context.Response.ContentLength64 = $message.Length
                    $responseStarted = $true
                    $context.Response.OutputStream.Write($message, 0, $message.Length)
                }
                catch {
                    [Console]::Error.WriteLine("Request failed before a response could be sent: $_")
                }
                [Console]::Error.WriteLine("Request failed: $_")
            }
        }
        finally {
            $context.Response.Close()
        }
    }
}
finally {
    $listener.Stop()
    $listener.Close()
}
