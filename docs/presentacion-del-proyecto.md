# Presentación del proyecto

## Sistema web de gestión de inventario por lotes
### Asilo Mis Días Dorados

## Introducción

El presente proyecto consiste en el desarrollo de un sistema web para apoyar la administración y el control del inventario del Asilo Mis Días Dorados. La aplicación centraliza la información sobre los productos e insumos que utiliza la institución y permite registrar sus entradas, salidas, existencias, lotes y fechas de vencimiento.

El propósito del sistema es facilitar el trabajo del personal, reducir errores propios de los registros manuales, mejorar el seguimiento de los productos y ofrecer información oportuna para tomar decisiones de reposición. El control por lotes es especialmente útil para identificar entradas distintas de un mismo producto y dar prioridad a los artículos que vencen primero.

El sistema es accesible desde un navegador web en una computadora, tableta o teléfono con conexión a internet. No requiere instalar un programa local. El acceso se controla mediante cuentas de usuario y roles, de modo que cada persona pueda utilizar las funciones autorizadas.

## Objetivo del sistema

Administrar de forma ordenada, segura y trazable los productos del inventario, desde su registro y recepción hasta su salida, consulta y generación de reportes.

## Descripción de los apartados funcionales

### 1. Inicio

Presenta un resumen general del inventario mediante indicadores y accesos a las funciones principales. Permite al usuario tener una vista rápida de la situación y dirigirse a las tareas que tiene autorizadas.

### 2. Registrar entrada

Se utiliza cuando se recibe una compra, donación u otro ingreso de productos. El usuario selecciona el producto, indica la cantidad, la fecha, el origen y, cuando corresponde, la fecha de vencimiento y las observaciones.

Al guardar, el sistema crea un nuevo lote con un número automático. Así se identifica esa entrada en particular y se mantiene separada de otras recepciones del mismo producto, que pueden tener diferentes cantidades o vencimientos. La base de datos valida que la cantidad sea válida y que la fecha de vencimiento no sea anterior a la fecha de ingreso.

### 3. Registrar salida

Se utiliza para documentar entregas o consumos de productos. El usuario selecciona el producto, indica la cantidad y registra el destino o motivo de la salida.

El sistema verifica que exista suficiente cantidad y asigna la salida a los lotes disponibles siguiendo el criterio FEFO: primero se descuenta del lote que vence antes. Si la cantidad solicitada requiere más de un lote, el sistema registra la parte correspondiente de cada uno. Esto ayuda a reducir pérdidas por vencimiento y conserva la trazabilidad.

### 4. Existencias

Muestra los productos registrados, su disponibilidad, unidad de medida, stock mínimo y estado. La disponibilidad representa la cantidad que queda en los lotes activos del producto.

Esta sección permite revisar rápidamente qué productos hay y cuáles requieren atención o reposición. Para los productos con existencia, también muestra sus lotes disponibles y facilita abrir el detalle de cada lote.

### 5. Lotes

Permite buscar y consultar los lotes de inventario por número de lote, nombre del producto o código. También permite filtrar por categoría y estado, como lotes con existencia, por vencer, vencidos, agotados o todos.

Cada lote tiene su propia cantidad inicial, cantidad actual, fecha de ingreso y, si corresponde, fecha de vencimiento. Al abrirlo, se consulta su recorrido, incluyendo las entradas y salidas relacionadas. Esta función sirve para identificar el origen de una existencia y rastrear su distribución.

### 6. Alertas

Presenta situaciones que requieren atención, como productos con existencia baja y lotes próximos a vencer o vencidos, según la configuración del sistema.

Las alertas ayudan al personal a priorizar la revisión, rotación o reposición de productos. Una alerta es una advertencia para apoyar la gestión; el personal debe confirmar la condición física del producto antes de tomar decisiones.

### 7. Historial

Permite consultar las operaciones registradas, como entradas y salidas, con información de fecha, producto, cantidad, lote, destino u origen, observaciones y usuario que realizó el registro.

El historial aporta trazabilidad y facilita revisar una diferencia de inventario o confirmar cómo se distribuyó un producto. Los movimientos históricos deben conservarse y no deben borrarse para realizar pruebas.

### 8. Productos

Permite consultar, crear y, según los permisos, editar o desactivar productos. La ficha del producto contiene datos como nombre, código, categoría, unidad de medida y stock mínimo.

El código identifica el tipo de producto de manera general. El número de lote, en cambio, identifica una entrada específica de ese producto. El sistema también aplica las reglas de cantidades según la unidad: productos contados por unidades, cajas o botes manejan cantidades enteras; unidades de peso o volumen admiten decimales.

### 9. Categorías

Permite organizar los productos en grupos, como medicamentos, alimentos, limpieza u otras categorías utilizadas por la institución. Una clasificación consistente facilita la búsqueda, los filtros y la lectura de reportes.

La administración de categorías está reservada al rol administrador para evitar cambios accidentales en la estructura utilizada por el personal.

### 10. Reportes

Reúne vistas resumidas del inventario y sus movimientos para revisión, impresión o exportación, según el reporte disponible. Los reportes de existencias presentan los productos y sus lotes; los reportes relacionados con vencimientos muestran el lote y la fecha correspondiente.

Los reportes sirven para supervisar cantidades, revisar próximos vencimientos y apoyar la planificación. La información debe contrastarse con el inventario físico cuando se utiliza para una decisión operativa.

### 11. Métricas

Presenta indicadores y gráficos derivados de los datos registrados, por ejemplo, resúmenes de productos, existencias y movimientos. Su finalidad es facilitar la interpretación de la actividad del inventario y apoyar decisiones de reposición y seguimiento.

Las métricas dependen de que las entradas y salidas se registren de forma consistente y oportuna.

### 12. Usuarios

Permite al administrador gestionar las cuentas que tienen acceso al sistema, de acuerdo con las funciones disponibles y las políticas de la institución. Cada persona debe utilizar su propia cuenta y no compartir credenciales, para que el historial identifique correctamente quién realizó cada movimiento.

### 13. Roles

Permite administrar los perfiles de acceso y las acciones autorizadas para cada tipo de usuario. En términos generales, el administrador gestiona la configuración y los usuarios; el encargado registra operaciones de inventario; y el usuario de consulta visualiza información sin modificarla.

La asignación del menor nivel de acceso necesario ayuda a prevenir cambios no autorizados.

### 14. Configuración

Contiene parámetros generales del sistema que el administrador puede mantener, como opciones relacionadas con las alertas de vencimiento. Los cambios en esta sección deben realizarse con autorización porque afectan el comportamiento general de la aplicación.

### 15. Respaldo y exportación

El sistema cuenta con opciones para descargar información de respaldo o exportar datos para consulta externa, según las funciones habilitadas. Los archivos descargados deben guardarse en una ubicación institucional segura y con acceso limitado.

Un respaldo complementa la seguridad de la información, pero no reemplaza el registro correcto de las operaciones ni la revisión del inventario físico. Antes de restaurar o reemplazar datos se debe contar con autorización del responsable.

## Lógica de códigos y lotes

El código identifica el producto, por ejemplo, un medicamento específico. El número de lote identifica una entrada concreta de ese producto. Un producto puede tener varios lotes porque cada recepción puede llegar en una fecha distinta y tener una fecha de vencimiento diferente.

El lote se asigna automáticamente para reducir errores de digitación y duplicados. La cantidad disponible se controla por lote y las salidas se relacionan con los lotes de los cuales se descontó el producto.

## Seguridad y validaciones

El sistema utiliza inicio de sesión y roles para restringir las funciones. Además, las operaciones importantes se validan en el servidor y en la base de datos. Entre las reglas de inventario se encuentran el rechazo de cantidades negativas, la exigencia de cantidades positivas para entradas y salidas, la limitación de decimales según la unidad de medida y la prevención de salidas mayores que la existencia disponible.

La base de datos relacional mantiene vinculados los productos, lotes y movimientos. Esta estructura permite conservar el historial y reconstruir el recorrido de un lote.

## Tecnologías principales

- **Next.js y React:** construcción de las páginas y funciones web.
- **TypeScript:** tipado del código para reducir errores de desarrollo.
- **Supabase y PostgreSQL:** autenticación, almacenamiento relacional y validación de datos.
- **Tailwind CSS y shadcn/ui:** diseño adaptable y componentes de interfaz.
- **Vercel:** alojamiento y publicación de la aplicación.
- **GitHub:** control de versiones del código.

## Beneficios esperados

- Centralizar los datos del inventario.
- Conocer con mayor claridad las existencias disponibles.
- Diferenciar entradas del mismo producto mediante lotes.
- Mejorar la rotación de productos con fecha de vencimiento.
- Reducir errores en cantidades y movimientos.
- Facilitar búsquedas, consultas y reportes.
- Mantener un historial de las operaciones y de sus responsables.
- Apoyar la planificación de reposiciones y la rendición de cuentas.

## Consideraciones de uso

El sistema es una herramienta de apoyo y debe utilizarse junto con procedimientos responsables en la bodega. El personal debe registrar las operaciones reales con prontitud, verificar las cantidades físicas, revisar las fechas de vencimiento y no modificar existencias reales para realizar pruebas. Los datos de prueba deben identificarse claramente y separarse de los registros institucionales.

## Conclusión

El Sistema web de gestión de inventario por lotes del Asilo Mis Días Dorados organiza la información de los productos, registra sus movimientos y permite dar seguimiento a cada lote. Al combinar control de existencias, alertas, historial, reportes y permisos de usuario, facilita una administración más ordenada y trazable de los insumos que utiliza la institución.
