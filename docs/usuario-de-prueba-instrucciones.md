# Instrucciones para el usuario de prueba

## Datos de acceso

| Campo | Información |
|---|---|
| Nombre | Ing.Edgar(UMG) |
| Usuario | `prueba_usuario` |
| Contraseña | `Edgar/!$umg#4*` |
| Rol | Administración de pruebas |

## Alcance del rol

El rol **Administración de pruebas** funciona exactamente igual que la administración normal. Está reservado exclusivamente para realizar pruebas, demostraciones y validaciones del sistema.

El usuario puede utilizar las funciones disponibles para la administración, pero todas las acciones deben realizarse siguiendo las reglas de este documento para proteger la información real del asilo.

## Reglas obligatorias

1. **No borrar las existencias actuales.**
2. **No alterar, modificar ni eliminar productos reales.**
3. **No modificar las cantidades reales del inventario.**
4. **No registrar entradas o salidas sobre productos reales del asilo para probar funciones.**
5. **No cambiar fechas de vencimiento, categorías, unidades de medida o stock mínimo de productos reales.**
6. **No eliminar categorías, usuarios, configuraciones, lotes o movimientos existentes.**
7. **No utilizar el usuario de prueba para operaciones reales del asilo.**

Estas reglas son necesarias para evitar pérdida de información, diferencias en las existencias y alteraciones en el historial del Asilo Mis Días Dorados.

## Cómo realizar pruebas correctamente

Cuando desee probar una función, cree registros claramente identificados como pruebas.

### Ejemplos de nombres permitidos

- `Producto prueba`
- `Medicamento prueba`
- `Alimento prueba`
- `Categoría prueba`
- `Proveedor prueba`
- `Producto prueba lote 01`

### Ejemplos de códigos permitidos

- `PRUEBA-001`
- `PROD-PRUEBA-01`
- `TEST-001`

### Ejemplo de registro seguro

Para probar una entrada, cree un producto separado con información de prueba:

- Nombre: `Producto prueba`
- Código: `PRUEBA-001`
- Categoría: `Categoría prueba`
- Unidad: `unidades`
- Stock mínimo: `0`

Después puede registrar entradas y salidas únicamente sobre ese producto. Si el sistema genera un número de lote, este quedará asociado al producto de prueba y no afectará los productos reales.

## Antes de guardar una prueba

Verifique que:

- el nombre contiene la palabra **“prueba”**;
- el código identifica claramente que es un registro de prueba;
- no está modificando un producto real seleccionado por error;
- las cantidades corresponden a la prueba;
- el origen, destino y observaciones también indican que es una prueba.

En las observaciones puede escribir, por ejemplo:

> Registro de prueba - no corresponde a una operación real del asilo.

## Después de realizar una prueba

- Revise que el resultado sea el esperado.
- No mezcle datos de prueba con datos reales.
- Informe al responsable del sistema qué pruebas realizó.
- Si se requiere limpiar los datos de prueba, solicite autorización al administrador responsable antes de eliminar cualquier registro.
- No elimine información por cuenta propia, aunque parezca relacionada con una prueba.

## Importante sobre las existencias

Las existencias actuales representan información real del asilo. Modificarlas puede causar:

- reportes incorrectos;
- compras innecesarias;
- faltantes aparentes;
- errores en medicamentos o alimentos;
- pérdida de trazabilidad;
- diferencias entre el inventario físico y el sistema.

Por esta razón, toda demostración debe hacerse con productos, categorías, entradas y salidas identificados con la palabra **“prueba”**.

## Nota de seguridad

La contraseña de este usuario debe compartirse únicamente con la persona autorizada para realizar las pruebas. No debe publicarse en grupos abiertos ni enviarse junto con información sensible del asilo. Si se sospecha que la contraseña fue compartida con una persona no autorizada, se debe solicitar al administrador que la cambie.

## Contacto para incidencias

Si durante una prueba aparece un error o se modifica información por accidente:

1. Detenga la prueba inmediatamente.
2. No intente corregir el problema modificando más registros.
3. Anote la pantalla, producto, cantidad y hora del incidente.
4. Informe al administrador responsable.
5. Espere instrucciones antes de continuar.

## Confirmación

El usuario de prueba confirma que comprende que:

- su acceso es exclusivamente para pruebas;
- no debe alterar información real;
- debe identificar todas sus pruebas con la palabra **“prueba”**;
- debe reportar cualquier error o modificación accidental;
- la información del asilo tiene prioridad y debe conservarse íntegra.
