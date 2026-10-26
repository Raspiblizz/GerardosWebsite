#!/usr/bin/env bash
set -euo pipefail

script_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
cd "$script_dir"

if ! command -v zip >/dev/null 2>&1; then
  printf 'Error: se necesita el comando "zip" para generar sitio_web.zip.\n' >&2
  exit 1
fi

if [[ ! -d assets ]]; then
  printf 'Error: no se encontró la carpeta assets.\n' >&2
  exit 1
fi

shopt -s nullglob
files=(./*.html ./*.php)
temp_dir="$(mktemp -d "$script_dir/.sitio_web.XXXXXX")"
temp_zip="$temp_dir/sitio_web.zip"
trap 'rm -f -- "$temp_zip"; rmdir -- "$temp_dir"' EXIT

printf 'Generando sitio_web.zip...\n'
zip -r "$temp_zip" assets "${files[@]}"
mv -f -- "$temp_zip" "$script_dir/sitio_web.zip"
rm -f -- "$temp_zip"
rmdir -- "$temp_dir"
trap - EXIT

printf '\n=======================================================\n'
printf 'EXITO: El archivo sitio_web.zip ha sido creado.\n'
printf '=======================================================\n\n'
printf 'Ahora puedes subir el archivo "sitio_web.zip" a la carpeta public_html de tu cPanel.\n'
