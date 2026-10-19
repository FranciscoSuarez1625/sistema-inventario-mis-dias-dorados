# Manual de usuario

## Sistema de Inventario — Asilo Mis Días Dorados

Versión 1.0 · Octubre 2026

---

## Contenido

1. Introducción
2. Requisitos para usar el sistema
3. Roles y permisos
4. Ingreso al sistema
5. Pantalla principal y menú
6. Registrar una entrada
7. Registrar una salida
8. Existencias
9. Lotes
10. Alertas
11. Historial de movimientos
12. Productos
13. Categorías
14. Reportes (imprimir y exportar)
15. Métricas de consumo
16. Usuarios
17. Roles
18. Configuración y respaldos
19. Reglas que el sistema valida automáticamente
20. Mensajes frecuentes y solución de problemas
21. Glosario

---

## 1. Introducción

El Sistema de Inventario del Asilo Mis Días Dorados es una aplicación web que permite controlar los alimentos, medicamentos, artículos de higiene y demás insumos que entran y salen de la bodega.

El sistema permite:

- Registrar las **entradas** (compras y donaciones) y las **salidas** (consumo diario, cocina, enfermería, etc.).
- Conocer en todo momento cuánto hay de cada producto (**existencias**).
- Controlar cada ingreso por **lote**, con su fecha de vencimiento.
- Recibir **alertas** de productos con poco stock, por vencer o vencidos.
- Consultar el **historial** completo de movimientos y saber quién hizo cada registro.
- Generar **reportes** imprimibles y exportables a Excel (CSV).
- Ver **métricas** de los productos más consumidos.

---

## 2. Requisitos para usar el sistema

- Una computadora, tableta o teléfono con conexión a internet.
- Un navegador actualizado (Google Chrome, Microsoft Edge, Firefox o Safari).
- Un **usuario y contraseña** entregados por el administrador.

No es necesario instalar ningún programa.

---

## 3. Roles y permisos

Cada persona entra con un rol que define lo que puede hacer:

| Opción del menú | Administrador | Encargado de inventario | Consulta |
| --- | :---: | :---: | :---: |
| Inicio | Sí | Sí | Sí |
| Registrar entrada | Sí | Sí | No |
| Registrar salida | Sí | Sí | No |
| Existencias | Sí | Sí | Sí |
| Lotes | Sí | Sí | Sí |
| Alertas | Sí | Sí | Sí |
| Historial | Sí | Sí | Sí |
| Productos | Sí | Sí | No |
| Categorías | Sí | No | No |
| Reportes | Sí | Sí | Sí |
| Métricas | Sí | Sí | Sí |
| Usuarios | Sí | No | No |
| Roles | Sí | No | No |
| Configuración y respaldos | Sí | No | No |

- **Administrador:** acceso total: usuarios, roles, categorías, configuración y respaldos.
- **Encargado de inventario:** registra entradas, salidas y productos.
- **Consulta:** solo puede ver existencias, alertas, reportes y métricas.

Las opciones a las que el usuario no tiene permiso no aparecen en su menú. Aunque alguien intente entrar escribiendo la dirección, el sistema lo bloquea.

---

## 4. Ingreso al sistema

1. Abra el navegador y entre a la dirección del sistema.
2. Escriba su **Usuario** (por ejemplo: `mlopez`). No es un correo electrónico.
3. Escriba su **Contraseña**.
4. Presione **Ingresar**.

Si los datos son correctos verá la pantalla de **Inicio**. Si su usuario fue desactivado por el administrador, no podrá ingresar.

**Cerrar sesión:** use la opción de salir en el menú (parte inferior o menú de usuario). Hágalo siempre al terminar, sobre todo en computadoras compartidas.

---

## 5. Pantalla principal y menú

La pantalla de **Inicio** muestra:

- Un saludo con el nombre del usuario.
- Accesos rápidos a **Registrar entrada** y **Registrar salida**.
- Los **últimos movimientos** registrados.
- La sección **Requiere atención**, con productos de stock bajo, por vencer o vencidos.

El **menú lateral** contiene todas las opciones permitidas para su rol. La opción **Alertas** muestra un número con la cantidad de avisos pendientes. En teléfonos el menú se abre con el botón de menú en la parte superior.

---

## 6. Registrar una entrada

Use esta opción cada vez que llegue mercadería a la bodega (compra o donación).

1. En el menú, elija **Registrar entrada**.
2. **Producto:** seleccione el producto. Si no existe, primero créelo en **Productos**.
3. **Cantidad:** escriba la cantidad recibida.
   - Si el producto se mide en unidades, cajas, paquetes, etc., solo se aceptan **números enteros**.
   - Si se mide en peso o volumen (libras, kilos, gramos, onzas, litros, mililitros, galones) se aceptan **decimales**.
4. **Fecha de ingreso:** por defecto es hoy. No se permiten fechas futuras.
5. **Fecha de vencimiento:** es **obligatoria** si la categoría del producto lo exige (por ejemplo, medicamentos y alimentos). No puede ser anterior a la fecha de ingreso.
6. **Origen o proveedor** (opcional): por ejemplo "Donación parroquia" o "Compra mercado".
7. **Observaciones** (opcional).
8. Presione **Guardar**.

**Número de lote:** el sistema lo asigna **automáticamente**; el usuario no lo escribe. Tiene la forma:

```
CÓDIGO-AAMMDD-NN      Ejemplo: MED-001-260730-01
```

- `MED-001`: código del producto.
- `260730`: fecha de ingreso (año 26, mes 07, día 30).
- `01`: número correlativo si ese día entró más de un lote del mismo producto.

Así se evitan números repetidos o mal escritos.

---

## 7. Registrar una salida

Use esta opción cada vez que se retire producto de la bodega.

1. En el menú, elija **Registrar salida**.
2. **Producto:** seleccione el producto. Los productos sin existencias no se pueden elegir. Al elegirlo, verá la cantidad disponible y los lotes que tiene.
3. **Cantidad:** no puede ser mayor a lo disponible (misma regla de enteros/decimales que en entradas).
4. **Fecha de salida.**
5. **Destino o motivo** (obligatorio): por ejemplo "Cocina", "Enfermería", "Producto vencido".
6. **Observaciones** (opcional).
7. Presione **Guardar**.

**Asignación automática de lotes:** el sistema descuenta primero del lote que **vence antes** (y, si no tienen vencimiento, del más antiguo). Si un lote no alcanza, completa con el siguiente. Esto evita que se venzan productos en bodega mientras se usan los nuevos. En el historial queda registrado de qué lote(s) salió cada cantidad.

---

## 8. Existencias

Muestra cuánto hay de cada producto en este momento.

- **Buscar** por nombre o código.
- **Filtrar** por categoría o por estado (normal, stock bajo, agotado).
- Cada fila muestra código, nombre, categoría, cantidad total, unidad, stock mínimo, próximo vencimiento y los lotes con existencia.

Un producto está en **stock bajo** cuando su cantidad total es igual o menor al stock mínimo definido.

---

## 9. Lotes

Permite buscar y seguir cada lote individualmente.

- **Buscar** por número de lote, nombre o código del producto.
- **Filtrar** por categoría y por estado: con existencia, por vencer, vencidos, agotados o todos.
- Cada lote muestra su cantidad inicial, cantidad actual, una barra de consumo, fecha de ingreso y vencimiento.
- Al hacer clic en un lote se abre su **detalle**, con el **recorrido del lote**: la entrada que lo creó y todas las salidas que lo consumieron, con fecha, destino y usuario.

Útil para responder preguntas como: "¿A dónde se fue el lote de paracetamol que llegó en julio?".

---

## 10. Alertas

Agrupa los avisos que requieren acción:

- **Stock bajo:** productos con cantidad igual o menor al stock mínimo.
- **Por vencer:** lotes que vencen dentro de los días configurados (por defecto definidos por el administrador en Configuración).
- **Vencidos:** lotes con fecha de vencimiento pasada que aún tienen existencia. Se recomienda darles salida con el motivo "Producto vencido".

---

## 11. Historial de movimientos

Lista todas las entradas y salidas.

- Filtros por **tipo** (entrada/salida), **producto**, **rango de fechas** y búsqueda.
- Muestra fecha, tipo, producto, lote(s), cantidad, origen/destino, observaciones y usuario que registró.
- Los movimientos **no se pueden editar ni borrar**, para mantener un registro confiable. Si hubo un error, registre el movimiento contrario con una observación que lo explique.

---

## 12. Productos

(Administrador y Encargado)

- **Nuevo producto:** Código (ej. `ALI-010`), Categoría, Nombre, Unidad de medida (libras, cajas, unidades…), Stock mínimo y Descripción.
- **Editar** un producto existente.
- **Desactivar / activar:** un producto desactivado deja de aparecer para registrar entradas, pero conserva su historial.

El código debe ser único. Si cambia la unidad de un producto con existencias decimales a una unidad entera, el sistema lo impide.

---

## 13. Categorías

(Solo Administrador)

Permite crear, editar y eliminar categorías (Alimentos, Medicamentos, Higiene, etc.), con:

- Nombre y descripción.
- Color para identificarla visualmente.
- **Requiere vencimiento:** si está activado, todas las entradas de productos de esa categoría exigirán fecha de vencimiento.

No se puede eliminar una categoría que tenga productos.

---

## 14. Reportes (imprimir y exportar)

Hay tres reportes:

1. **Existencias actuales:** cantidad de cada producto con sus lotes.
2. **Entradas y salidas:** movimientos en un rango de fechas, con totales.
3. **Vencimientos:** lotes vencidos y por vencer.

Para cada reporte:

- **Imprimir:** presione el botón **Imprimir**. Se abre la ventana de impresión del navegador; puede imprimir en papel o elegir "Guardar como PDF". El reporte impreso incluye el encabezado del asilo y la fecha.
- **Exportar CSV:** descarga un archivo que se abre en Excel o Google Sheets. Incluye el número de lote de cada registro.

---

## 15. Métricas de consumo

Muestra:

- **Ranking** de los productos más consumidos en el período elegido (mes o año).
- **Tendencia** mensual de consumo de los productos principales durante el año.

Sirve para planificar compras y solicitar donaciones con base en el consumo real.

---

## 16. Usuarios

(Solo Administrador)

- **Crear usuario:** nombre completo, usuario, contraseña y rol.
- **Editar:** cambiar nombre, rol o contraseña.
- **Desactivar / activar:** un usuario desactivado no puede ingresar, pero sus registros se conservan.

---

## 17. Roles

(Solo Administrador)

Muestra los roles del sistema y permite crear roles adicionales con un nombre y una descripción, asignándoles uno de los niveles de acceso existentes (Administrador, Encargado o Consulta). Los roles del sistema no se pueden eliminar.

---

## 18. Configuración y respaldos

(Solo Administrador)

- **Alertas de vencimiento:** número de días de anticipación con que un lote se considera "por vencer".
- **Respaldo de la información:** el botón **Descargar respaldo** genera un archivo con todos los productos, lotes y movimientos. Se muestra la fecha del último respaldo y un aviso si han pasado 7 días o más. Se recomienda hacerlo al menos una vez por semana y guardarlo en una memoria USB o correo.

---

## 19. Reglas que el sistema valida automáticamente

| Regla | Mensaje / comportamiento |
| --- | --- |
| Cantidad mayor que cero | "La cantidad debe ser mayor que cero." |
| Enteros para unidades no divisibles | "La cantidad debe ser un número entero para productos en …" |
| Fecha de ingreso no futura | "La fecha de ingreso no puede ser futura." |
| Vencimiento obligatorio según categoría | "La fecha de vencimiento es obligatoria para …" |
| Vencimiento posterior al ingreso | "La fecha de vencimiento no puede ser anterior a la fecha de ingreso." |
| Salida no mayor a la existencia | Se rechaza la salida |
| Producto desactivado | "El producto está desactivado." |
| Permisos por rol | "No tiene permiso para …" |
| Número de lote único | Asignado automáticamente por el sistema |

Estas reglas se validan tanto en el formulario como en la base de datos, por lo que no pueden saltarse.

---

## 20. Mensajes frecuentes y solución de problemas

| Problema | Solución |
| --- | --- |
| No puedo ingresar | Verifique usuario y contraseña (sin @ ni dominio). Si persiste, pida al administrador que revise si su usuario está activo. |
| No veo una opción del menú | Su rol no tiene permiso. Consulte al administrador. |
| El producto no aparece al registrar una salida | No tiene existencias o está desactivado. |
| No me deja escribir decimales | La unidad del producto es entera (unidades, cajas…). |
| Me equivoqué en un movimiento | Registre el movimiento contrario con una observación explicativa. |
| La página no carga o se ve mal | Recargue la página (Ctrl + F5) y verifique la conexión a internet. |

---

## 21. Glosario

- **Entrada:** ingreso de producto a la bodega.
- **Salida:** retiro de producto de la bodega.
- **Lote:** cantidad de un producto que ingresó en una misma entrada, con su propia fecha de vencimiento.
- **Existencia / stock:** cantidad disponible actualmente.
- **Stock mínimo:** cantidad por debajo de la cual el sistema avisa que hay que reponer.
- **FEFO:** "primero en vencer, primero en salir"; método con el que el sistema elige de qué lote descontar.
- **Respaldo:** copia de seguridad de la información.
- **CSV:** formato de archivo que se abre en Excel.
