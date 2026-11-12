param(
    [Parameter(Mandatory = $true)]
    [string]$BaseUrl
)

$ErrorActionPreference = "Stop"

try {
    $baseUri = [Uri]::new($BaseUrl.TrimEnd("/") + "/")
}
catch {
    throw "BaseUrl must be a valid HTTPS URL for the final public website."
}

if ($baseUri.Scheme -ne "https") {
    throw "BaseUrl must use HTTPS. Choose your final public domain before generating the sitemap."
}

$pages = @(
    "",
    "services.html",
    "work.html",
    "work/websites.html",
    "work/applications.html",
    "work/automation.html",
    "work/crm-systems.html",
    "work/ecommerce.html",
    "work/integrations.html",
    "about.html",
    "testimonials.html",
    "preview.html",
    "booking.html",
    "contact.html",
    "privacy.html",
    "terms.html"
)

$settings = [System.Xml.XmlWriterSettings]::new()
$settings.Indent = $true
$settings.Encoding = [System.Text.UTF8Encoding]::new($false)
$outputPath = Join-Path $PSScriptRoot "sitemap.xml"
$writer = [System.Xml.XmlWriter]::Create($outputPath, $settings)

try {
    $writer.WriteStartDocument()
    $writer.WriteStartElement("urlset", "http://www.sitemaps.org/schemas/sitemap/0.9")
    foreach ($page in $pages) {
        $writer.WriteStartElement("url")
        $writer.WriteElementString("loc", ([Uri]::new($baseUri, $page)).AbsoluteUri)
        $writer.WriteEndElement()
    }
    $writer.WriteEndElement()
    $writer.WriteEndDocument()
}
finally {
    $writer.Dispose()
}

Write-Host "Generated sitemap.xml for $($baseUri.AbsoluteUri)"
