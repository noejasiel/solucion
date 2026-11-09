# Plan: simulador y cotización con tabla de amortización

Actualizado: 8 de noviembre de 2026.
Estado: implementado y verificado localmente con reglas de tasa dinámica y montos personalizados.

## Objetivo y decisiones confirmadas

La prioridad es generar y descargar una cotización PDF con la tabla completa de amortización y la identidad de Solución Crediticia.

- Conservar el cálculo de interés simple sobre el monto original que utiliza actualmente la calculadora.
- Solicitar nombre, correo y teléfono antes de descargar.
- Notificar a la empresa del nuevo prospecto, reutilizando el servicio del formulario actual.
- Incorporar selección de tipo de préstamo, monto y plazo.
- Tasa dinámica por monto acordada:
  - $10k a $40k: 25% anual fija · Plazo de 1 a 3 años.
  - $50k a $240k: 15% anual fija · Plazo de 1 a 6 años.
  - $250k a casi 1M (hasta $990k): 8% anual fija · Plazo de 1 a 6 años.
  - +1M (hasta 6M y personalizados superiores): 3% anual fija · Plazo de 1 a 20 años.
- Cantidades cerradas de 10 en 10 mil (mínimo $10,000).
- Slider con avance progresivo y panel "Pon tu monto" para cantidades exactas o financiamientos > 6M.

## 1. Cálculo y tabla

Crear una función compartida que produzca tanto el resumen como todas las mensualidades. El PDF, la calculadora y la notificación deben usar la misma cotización.

- Meses = años × 12.
- Interés total = monto original × (tasa anual / 100) × años.
- Total a pagar = monto original + interés total.
- Capital mensual teórico = monto original / meses.
- Interés mensual teórico = monto original × (tasa anual / 100) / 12.
- Pago mensual teórico = capital mensual + interés mensual.
- Columnas: mes, saldo inicial, interés, abono a capital, pago mensual y saldo final.
- El saldo disminuye por el capital amortizado; el interés se calcula siempre sobre el monto original.
- Distribuir importes en centavos y ajustar la última mensualidad para que capital e intereses sumen sus totales y el saldo final sea $0.00. Indicar que el último pago puede variar por redondeo.
- Mostrar dinero en MXN con dos decimales y evitar que el total del PDF difiera del resumen.

Ejemplo de validación: $500,000 al 3% anual durante 4 años = 48 pagos, $60,000 de intereses y $560,000 de total. Mensualidad habitual de $11,666.67; última de $11,666.51 al redondear los primeros 47 abonos a capital a $10,416.67.

## 2. Interfaz del simulador

- Reacomodar controles y resumen para computadora y celular, conservando colores y estilo del sitio.
- Reutilizar el catálogo de productos existente, pendiente de confirmar si todos deben aparecer.
- Incorporar selector de tipo de préstamo y mantener controles de monto y plazo.
- Mostrar monto, plazo, tasa de referencia, mensualidad, intereses y total.
- Incorporar la acción principal "Descargar cotización" y conservar acceso al formulario de asesoría.
- Mostrar una aclaración de simulación informativa sujeta a evaluación y aprobación.
- Conservar los límites existentes hasta que el usuario indique cambios.
- Separar la obtención de la tasa del cálculo para añadir la tasa dinámica después.

## 3. Captura de datos

- Abrir un formulario breve al pulsar la descarga.
- Solicitar únicamente nombre, correo y teléfono como datos requeridos; no exigir ciudad ni mensaje en este flujo.
- Validar campos y mostrar estados de envío, error y descarga.
- Conservar los datos si ocurre un error y evitar envíos simultáneos por doble clic.
- Fijar los valores de la simulación al enviar para que el correo y el PDF coincidan.
- Informar que los datos se utilizan para seguimiento de la cotización. Falta identificar el enlace del aviso de privacidad: no existe uno en los componentes revisados.

## 4. Notificación del prospecto

- Reutilizar Resend y los destinatarios configurados en el formulario actual.
- Identificar la solicitud como originada en el simulador.
- Enviar nombre, correo, teléfono, tipo de préstamo, monto, plazo, tasa, mensualidad, intereses y total.
- Adaptar la validación de la API para distinguir contacto y simulación.
- Validar entradas y escapar datos del usuario en el HTML del correo.
- Unificar el comportamiento local de `vite.config.ts` y el de producción en `api/send-email.ts`.
- Corregir la API de producción para comprobar también los errores que devuelve Resend sin lanzar excepción. La descarga no debe mostrarse como notificación exitosa ante un fallo del proveedor.
- Si el proveedor acepta el aviso, permitir descargar. Esto confirma aceptación por el proveedor, no entrega final al buzón.
- Si falla el envío, permitir reintentar. Si falla únicamente el PDF después del envío, permitir reintentar la descarga sin volver a notificar.

## 5. PDF de cotización

- Generar un archivo PDF descargable directamente desde la web, sin depender de Google Sheets ni de una impresión manual.
- Incluir logotipo, colores de la empresa, título, fecha y datos del prospecto.
- Incluir tipo de préstamo, monto, plazo, tasa, mensualidad estimada, intereses y total a pagar.
- Incluir todas las mensualidades, sin truncar la tabla.
- Repetir encabezados en cada página, numerar páginas y mantener márgenes y texto legibles.
- Incluir total de capital, intereses y pagos, junto con el aviso informativo y la aclaración de redondeo.
- Utilizar un nombre de archivo claro para identificar la cotización.
- Cargar el generador PDF cuando se necesite para reducir la carga inicial del sitio.

## 6. Verificación

- Comprobar el ejemplo de $500,000 al 3% a 4 años y el valor actual de $250,000 al 15% a 3 años: $112,500 de intereses y $362,500 de total.
- Verificar rangos, sumas, redondeos y saldo final en cero.
- Revisar visualmente PDFs cortos y de hasta 240 mensualidades, con nombres largos y acentos.
- Comprobar uso en celular, validación, doble clic, errores de correo y reintentos de descarga.
- Verificar que el formulario de contacto existente siga funcionando.
- Ejecutar la compilación de producción. Probar el envío inicialmente con simulaciones del proveedor; cualquier correo real de prueba debe ir a un destinatario acordado.

## Recursos existentes

- `src/components/Simulator.tsx`: controles y cálculo actuales.
- `src/data/content.ts`: configuración, productos, logos y datos de contacto.
- `src/components/ContactSection.tsx`: formulario y envío a la API.
- `api/send-email.ts`: envío de correo en producción.
- `vite.config.ts`: envío de correo en desarrollo.
- `public/brand/`: identidad visual disponible.
- Referencias de PDF y tabla facilitadas en la conversación.

## Verificación realizada

- 19 pruebas automáticas aprobadas: cálculos, conciliación en centavos, rangos, validaciones, compatibilidad de contacto, proveedor simulado, errores e idempotencia.
- Compilación de producción aprobada, incluidos tipos del servidor y las pruebas.
- Prueba de navegador aprobada: siete productos, límites y valores iniciales, campos requeridos, fallo y reintento de correo, referencia persistente en reintentos, descarga y segunda descarga sin otro aviso, nueva cotización, uso móvil y formulario de contacto existente.
- PDF de 36 mensualidades revisado en dos páginas y PDF de 240 mensualidades revisado en nueve páginas, con nombres y correos largos, encabezados, totales, último saldo cero y todas las filas presentes.
- No se enviaron correos reales ni se publicó la web. Los documentos y capturas de prueba son temporales, sin archivos de entrega adicionales.

## Pendientes posteriores

1. Recibir las reglas de tasa dinámica por monto.
2. Identificar el enlace del aviso de privacidad. El formulario ya explica el uso de los datos para seguimiento.
3. Verificar entrega real de correo con un destinatario acordado y publicar cuando se solicite.

## Fuera de esta etapa

Tasa dinámica por monto, panel administrativo, conexión permanente a Google Sheets, almacenamiento de prospectos en una base de datos y envío del PDF al prospecto por correo. No añadir CAT, seguros, comisiones ni calendarios de vencimiento no definidos.
