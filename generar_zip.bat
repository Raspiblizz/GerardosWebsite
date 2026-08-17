@echo off
echo Generando sitio_web.zip...

:: Eliminar el zip anterior si existe para evitar problemas
if exist sitio_web.zip del sitio_web.zip

:: Comprimir los archivos y carpetas necesarios usando PowerShell
powershell -Command "Compress-Archive -Path 'assets', '*.html', '*.php', '.htaccess' -DestinationPath 'sitio_web.zip' -Force"

echo.
echo =======================================================
echo EXITO: El archivo sitio_web.zip ha sido creado.
echo =======================================================
echo.
echo Ahora puedes subir el archivo "sitio_web.zip" a la carpeta public_html de tu cPanel.
echo.
pause
