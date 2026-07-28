# 📄 Instrucciones — Sistema de documentos Solución créditicia

Guía completa para crear **muchos documentos con el mismo estilo** (marco dorado,
marca de agua, tipografía elegante, paleta navy/dorado). No necesitas saber
programar: se trata de **duplicar una plantilla, cambiar textos y descargar el PDF**.

---

## 1. ¿Qué es esto y por qué así?

Todos los documentos comparten **un solo archivo de estilo** (`documento.css`).
Eso garantiza que **siempre se vean idénticos**: mismo marco, mismo logo, mismos
colores y fuentes. Tú solo cambias el **contenido** (textos, montos, nombres);
el diseño se queda fijo.

- Formato: hoja tamaño **carta** (8.5 × 11 pulgadas), pensada para imprimir o enviar en PDF.
- No requiere internet para el contenido, **pero sí** para que se vean las fuentes
  bonitas (Playfair Display e Inter se cargan de Google Fonts). Con internet, perfecto.

---

## 2. Qué hay en la carpeta `plantilla/`

| Archivo | Para qué sirve | ¿Lo edito? |
|---|---|---|
| `plantilla-documento.html` | La **plantilla base**. Se duplica para cada documento nuevo. | Sí (copia y edita) |
| `documento.css` | El **estilo de TODOS** los documentos. | Solo si quieres cambiar el look de todo |
| `INSTRUCCIONES.md` | Este archivo. | No |
| `assets/logo-primary.png` | Logo (fondo transparente). | No |
| `assets/firma.png` | Firma de la empresa (se reutiliza). | No |
| `assets/qr-ejemplo.png` | QR de ejemplo. | Se reemplaza por documento |

> **Importante:** un documento nuevo debe quedar en la **misma carpeta** (o una
> que también tenga `documento.css` y la carpeta `assets/` al lado), si no, no
> encuentra el estilo ni las imágenes.

---

## 3. Crear un documento nuevo — paso a paso

1. **Copia** `plantilla-documento.html` y pégala en la misma carpeta.
2. **Renómbrala** con un nombre claro, ej. `carta-bienvenida.html`.
3. **Ábrela con un editor de texto** (o el que uses). Busca los comentarios que dicen
   `EDITA …`. Solo cambias lo que está entre:
   - `<!-- ══════════ EDITA DE AQUÍ ══════════ -->`
   - `<!-- ══════════ FIN DE LA ZONA EDITABLE ══════════ -->`
4. **Guarda** el archivo.
5. **Ábrelo en el navegador** (doble clic, o clic derecho → Abrir con → Chrome).
6. Da clic en el botón azul **"Descargar PDF"** (abajo a la derecha).
7. En la ventana que aparece, en "Destino" elige **"Guardar como PDF"** y guarda.

✅ Listo. El PDF sale idéntico al diseño. El botón azul **no** aparece en el PDF.

> **Tip:** en la ventana de impresión, si ves márgenes o encabezados raros,
> pon **Márgenes: Ninguno** y desactiva "Encabezados y pies de página".

---

## 4. Qué puedes editar (con ejemplos)

Todo esto va **entre** los comentarios `EDITA`. Copia y pega los bloques que necesites.

### 4.1 La etiqueta y fecha de arriba a la derecha
```html
<div class="meta">
  <div><b>Inversión</b></div>   <!-- cambia esta palabra -->
  <div>México · 2026</div>      <!-- cambia la fecha -->
</div>
```

### 4.2 El título
```html
<div class="kicker">Resolución de financiamiento</div>  <!-- texto chico de arriba -->
<h1 class="title">Crédito Aprobado</h1>                 <!-- título grande -->
<p class="lede">Párrafo introductorio…</p>              <!-- texto explicativo -->
```
Para **resaltar una palabra** dentro del párrafo, envuélvela así:
`el estudio fue <strong>satisfactorio</strong>.`

### 4.3 Campos para llenar a mano (líneas en blanco)
Cada `<div class="m">` es un campo. Agrega o quita los que necesites:
```html
<div class="meta-row">
  <div class="m">
    <div class="lbl">Nombre del cliente</div>
    <div class="val"></div>
  </div>
  <div class="m">
    <div class="lbl">Número de contrato</div>
    <div class="val"></div>
  </div>
</div>
```
> `val` vacío = una línea para escribir a mano o rellenar antes de imprimir.

### 4.4 Tarjetas
Duplica este bloque por cada renglón. El ícono es **siempre la palomita** (`verified`):
```html
<div class="card ghost">
  <div class="ic"><span class="material-symbols-outlined">verified</span></div>
  <div class="info">
    <div class="name">Nombre del concepto</div>
    <div class="meta">
      <span>Dato <b>valor</b></span>
      <span>Otro dato <b>valor</b></span>
      <span>Otro dato <b>valor</b></span>
    </div>
  </div>
  <div class="amount">
    <div class="big">$40,000</div>
    <div class="sm">Monto</div>
  </div>
</div>
```

### 4.5 Gráfica de barra (porcentaje)
Cambia el número **dos veces**: en el texto `80` y en `width: 80%`.
```html
<div class="stat">
  <div class="num">80<small>%</small></div>
  <div class="bardesc">
    <div class="h">Índice de aprobación</div>
    <div class="bar"><div class="fill" style="width: 80%"></div></div>
    <div class="p">Descripción corta.</div>
  </div>
</div>
```

### 4.6 Gráfica de dona (preferencia)
La dona se divide con `conic-gradient`. Piensa en una vuelta completa = `1turn`:
- `0.6turn` = 60% (primer color, dorado)
- de `0.6turn` a `0.85turn` = 25% (segundo color, navy)
- de `0.85turn` a `1turn` = 15% (tercer color, gris)

```html
<div class="donut2" style="
  background: conic-gradient(
    var(--brass)  0turn    0.6turn,   /* 60% */
    var(--navy)   0.6turn  0.85turn,  /* 25% */
    #9aa6bd       0.85turn 1turn      /* 15% */
  );">
  <div class="hole"><b>60%</b><span>Secundario</span></div>
</div>
<div class="legend">
  <div class="li"><span class="dot d1"></span>Secundario <b>60%</b></div>
  <div class="li"><span class="dot d2"></span>Principal <b>25%</b></div>
  <div class="li"><span class="dot d3"></span>Opcional <b>15%</b></div>
</div>
```
> Los tres porcentajes deben **sumar 100%**. Cambia los cortes del gradiente **y**
> los números de la leyenda para que coincidan.

### 4.7 La firma
Ya viene puesta la firma de la empresa (`assets/firma.png`) sobre la línea de
"Solución créditicia". La segunda línea ("Solicitante de crédito") queda en blanco
para que firme el cliente. Normalmente no hay que tocar nada aquí.

---

## 5. Cambiar el QR de cada documento

El QR lleva a una página de validación (por ejemplo el validador del SAT).
Para ponerle uno distinto a un documento:

1. Guarda la imagen del QR en la carpeta `assets/` (ej. `assets/qr-juan.png`).
2. En el HTML, busca `src="assets/qr-ejemplo.png"` y cámbialo por `src="assets/qr-juan.png"`.

> ¿Necesitas **generar** un QR a partir de una liga (URL)? Pídemelo con la liga y
> te lo dejo en alta resolución (se ve nítido impreso). **Ojo:** los QR hechos con
> IA (tipo ChatGPT) suelen **no ser válidos** y no escanean — hay que generarlos de verdad.

---

## 6. Cambiar el estilo de TODOS los documentos a la vez

Si algún día quieres otro dorado, otra fuente, o mover el marco: se edita **una sola
vez** en `documento.css`. Al inicio del archivo están los colores:

```css
--navy: #0a1f44;        /* azul principal */
--navy-soft: #1a2f5a;   /* azul suave */
--brass: #c5a059;       /* dorado */
--brass-light: #e8c176; /* dorado claro */
--ivory: #f8f7f2;       /* marfil */
--ink: #1b1b1e;         /* texto negro */
--muted: #6a7280;       /* texto gris */
```

Cambia el valor (el `#xxxxxx`) y se actualiza en **todos** los documentos que usen la plantilla.

---

## 7. Referencia rápida de marca

- **Colores:** Navy `#0A1F44` · Dorado `#C5A059` · Marfil `#F8F7F2`
- **Fuentes:** Títulos **Playfair Display**, texto **Inter**
- **Hoja:** carta (8.5 × 11 in), marco dorado a 0.3 in del borde
- **Ícono de las tarjetas:** siempre la palomita (`verified`)

---

## 8. Problemas comunes

| Veo esto… | Solución |
|---|---|
| Las letras se ven "genéricas" (sin Playfair) | Necesitas **internet** para cargar las fuentes de Google. |
| No aparece el logo / firma / QR | La carpeta `assets/` debe estar **junto** al archivo HTML. No la separes. |
| El PDF sale con márgenes o encabezados | En la ventana de impresión: Márgenes **Ninguno**, quita "Encabezados y pies". |
| El documento se ve descuadrado | Falta el `documento.css` al lado. Mantén el HTML en la carpeta `plantilla/`. |
| El QR no escanea | Probablemente es una imagen que solo "parece" QR. Pídeme generarlo desde la liga. |

---

## 9. Notas importantes

- **No usamos el escudo nacional** (águila) en los documentos: usar el Escudo
  Nacional en papelería comercial está restringido por ley en México. En su lugar
  va el **logo propio** como sello. Es igual de formal y sí es legalmente tuyo.
- Los **porcentajes** de las gráficas (aprobación, preferencia) deben reflejar datos
  reales de tu operación. Los que trae la plantilla son de ejemplo.
- El **botón "Descargar PDF"** solo se ve en pantalla; nunca sale impreso.

---

### ¿Quieres que te haga otro documento de ejemplo con la plantilla?
Dime el tipo (carta de bienvenida, estado de cuenta, recordatorio de pago, etc.) y
te lo dejo armado para que veas lo rápido que se crea uno nuevo.
