#!/bin/bash
# Genera firma-correo.html incrustando el logo en el HTML.
# Úsalo cada vez que edites firma-correo.template.html:
#   ./build.sh
set -e
cd "$(dirname "$0")"

python3 - <<'PY'
logo = open('assets/logo-b64.txt', encoding='utf-8').read().strip()
html = open('firma-correo.template.html', encoding='utf-8').read()
n = html.count('__LOGO__')
html = html.replace('__LOGO__', logo)
open('firma-correo.html', 'w', encoding='utf-8').write(html)
print(f'firma-correo.html generado · {n} imagen(es) incrustada(s)')
PY
