# Insumos para la documentación del proyecto

Sistema de Inventario — Asilo Mis Días Dorados

> Este documento reúne la información técnica y funcional del sistema, organizada según el índice del trabajo. Los puntos marcados con **[COMPLETAR]** dependen de datos de la institución o de su trabajo de campo (encuestas, historia, presupuesto real) que no están en el sistema; se incluye una guía o propuesta de redacción para cada uno.

---

## Capítulo I — Marco conceptual

### 1.1 Título de la investigación

Propuesta: **"Sistema web de control de inventario por lotes para la gestión de insumos del Asilo Mis Días Dorados"**.

Alternativa: "Desarrollo de un sistema web de inventario con control de lotes y vencimientos para mejorar la gestión de insumos del Asilo Mis Días Dorados".

### 1.2 Antecedentes

Ideas para redactar:

- Antes del sistema, el control se hacía **[COMPLETAR: en cuadernos / hojas de Excel / sin registro]**.
- Problemas típicos de ese método: pérdida de productos por vencimiento, desconocimiento de existencias reales, falta de trazabilidad de donaciones, dificultad para elaborar reportes.
- Mencione trabajos o sistemas similares (antecedentes de otras tesis o sistemas de inventario para instituciones de beneficencia, farmacias u hospitales).

#### 1.2.1 Variable A (independiente): Sistema web de inventario

Aplicación web que registra entradas, salidas, lotes y vencimientos de los insumos, con control de acceso por roles, alertas automáticas, reportes y métricas.

#### 1.2.2 Variable B (dependiente): Gestión de inventario de insumos

Conjunto de procesos de control de existencias, abastecimiento, rotación de productos y reducción de pérdidas por vencimiento en el asilo.

### 1.3 Unidad de estudio

#### 1.3.1 Reseña histórica — **[COMPLETAR]**
Año de fundación, fundadores, misión, visión, número de residentes, fuentes de financiamiento (donaciones, municipalidad, iglesia, etc.).

#### 1.3.2 Ubicación — **[COMPLETAR]**
Dirección, municipio, departamento; puede incluir un mapa.

### 1.4 Situación actual

#### 1.4.1 Matriz diagnóstica del planteamiento del problema (propuesta)

| Síntoma | Causa | Pronóstico | Control del pronóstico |
| --- | --- | --- | --- |
| Productos vencidos en bodega | No se registran fechas de vencimiento ni se rota por antigüedad | Pérdidas económicas y riesgo para la salud de los residentes | Control por lotes con salida automática del lote que vence primero (FEFO) y alertas de vencimiento |
| No se conoce la existencia real | Registro manual o inexistente | Compras duplicadas o desabastecimiento | Existencias calculadas en tiempo real |
| Falta de reposición a tiempo | No hay niveles mínimos definidos | Desabastecimiento de alimentos/medicamentos | Stock mínimo por producto y alerta de stock bajo |
| No se sabe a dónde fueron los productos | No se registra destino ni responsable | Falta de transparencia ante donantes | Historial con destino, usuario y lote de cada movimiento |
| Reportes lentos o inexistentes | Información dispersa | Decisiones sin datos | Reportes imprimibles y exportables a CSV, métricas de consumo |
| Pérdida de información | Registros en papel | Imposible reconstruir historial | Base de datos en la nube y respaldos descargables |

#### 1.4.2 Priorización
Ordene los problemas anteriores según su impacto (por ejemplo, con una escala 1–5 de gravedad × frecuencia obtenida en las encuestas). Sugerencia de prioridad: 1) vencimientos, 2) existencias reales, 3) reposición, 4) trazabilidad, 5) reportes, 6) respaldo.

#### 1.4.3 Matriz lógica (marco lógico, propuesta)

| Nivel | Resumen narrativo | Indicadores | Medios de verificación | Supuestos |
| --- | --- | --- | --- | --- |
| Fin | Mejorar la atención de los adultos mayores asegurando insumos disponibles y en buen estado | Disminución de faltantes | Informes de la administración | El asilo mantiene sus fuentes de donación |
| Propósito | Gestión eficiente del inventario de insumos | % de productos vencidos; tiempo de elaboración de reportes | Reportes del sistema, encuestas | El personal utiliza el sistema |
| Componentes | 1. Registro de entradas/salidas por lotes. 2. Alertas. 3. Reportes y métricas. 4. Usuarios y roles. 5. Respaldos | Módulos funcionando | Pruebas funcionales, manual | Hay conexión a internet |
| Actividades | Análisis, diseño, desarrollo, pruebas, capacitación, implementación | Cronograma cumplido | Actas, capturas, repositorio Git | Disponibilidad del personal |

### 1.5 Estudio de factibilidad

#### 1.5.1 Técnica

| Componente | Tecnología | Justificación |
| --- | --- | --- |
| Framework | Next.js 16 (App Router) con React 19 | Framework web moderno; renderiza en el servidor (rápido en equipos modestos) y une interfaz y lógica en un solo proyecto |
| Lenguaje | TypeScript 5.7 | JavaScript con tipos; reduce errores |
| Base de datos | Supabase (PostgreSQL) | Base de datos relacional robusta, gratuita en su plan inicial, con respaldo en la nube |
| Autenticación | Supabase Auth | Manejo seguro de contraseñas y sesiones |
| Seguridad de datos | Row Level Security (RLS) y funciones en la base de datos | Las reglas de permisos y validaciones se aplican en la propia base de datos |
| Estilos | Tailwind CSS 4 + componentes shadcn/ui (Base UI) | Interfaz accesible, adaptable a teléfonos y consistente |
| Gráficas | Recharts | Gráficas de métricas de consumo |
| Íconos | Lucide | Íconos claros para el menú |
| Notificaciones | Sonner | Mensajes de confirmación y error |
| Alojamiento | Vercel | Publicación con HTTPS, sin servidor propio que mantener |
| Control de versiones | Git + GitHub | Historial de cambios y respaldo del código |

Requisitos del usuario final: computadora, tableta o teléfono con navegador e internet. No requiere instalación ni servidor local.

#### 1.5.2 Operativa
- Interfaz en español, letra grande y botones claros, pensada para personal con poca experiencia en computación.
- Funciona en teléfono, por lo que puede usarse dentro de la bodega.
- Ingreso con nombre de usuario (no requiere correo electrónico).
- Roles para que cada persona vea solo lo que necesita.
- Se entrega manual de usuario (`docs/manual-de-usuario.md`) y capacitación **[COMPLETAR: fecha y asistentes]**.

#### 1.5.3 Económica

##### 1.5.3.1 Presupuesto (plantilla — ajustar con costos reales en su moneda)

| Rubro | Detalle | Costo |
| --- | --- | --- |
| Desarrollo | Horas de análisis, diseño, programación y pruebas **[COMPLETAR horas × tarifa]** | [COMPLETAR] |
| Alojamiento | Vercel (plan Hobby) | Gratuito |
| Base de datos | Supabase (plan Free) | Gratuito |
| Dominio propio (opcional) | .com / .org anual | [COMPLETAR] |
| Equipo | Computadora/teléfono existente del asilo | 0 (ya disponible) |
| Internet | Servicio existente | 0 (ya disponible) |
| Capacitación | Sesiones con el personal | [COMPLETAR] |
| Papelería | Impresión de manual y reportes | [COMPLETAR] |
| **Total** | | **[COMPLETAR]** |

Nota: si el uso crece, Supabase Pro y Vercel Pro tienen costo mensual; consulte precios vigentes en sus sitios oficiales.

### 1.6 Justificación (propuesta)
El asilo depende en gran medida de donaciones, por lo que cada producto perdido por vencimiento o mal control representa un recurso que no llega a los residentes. Un sistema que controle los lotes, avise antes de que los productos venzan y descuente automáticamente del lote más próximo a vencer reduce pérdidas, da transparencia ante los donantes y facilita la planificación de compras.

### 1.7 Planteamiento del problema (propuesta)
"¿De qué manera un sistema web de inventario con control por lotes contribuye a mejorar la gestión de insumos del Asilo Mis Días Dorados?"

### 1.8 Importancia
- Para los residentes: insumos disponibles y en buen estado.
- Para la administración: datos reales para decisiones y rendición de cuentas.
- Para los donantes: trazabilidad de lo donado.
- Para el personal: menos tiempo en controles manuales.

### 1.9 Delimitación del problema
- **1.9.1 Espacial:** bodega e instalaciones del Asilo Mis Días Dorados, **[COMPLETAR ubicación]**.
- **1.9.2 Temporal:** **[COMPLETAR: periodo, p. ej. julio–noviembre 2026]**.
- **1.9.3 Institucional:** Asilo Mis Días Dorados (área administrativa y bodega).
- **1.9.4 Personal:** administrador(a), encargados de bodega/inventario y personal de consulta (cocina, enfermería, dirección).

### 1.10 Objetivos

#### 1.10.1 General
Desarrollar un sistema web de control de inventario por lotes que mejore la gestión de los insumos del Asilo Mis Días Dorados.

#### 1.10.2 Específicos
1. Diagnosticar el proceso actual de control de inventario del asilo.
2. Diseñar una base de datos relacional que registre productos, lotes y movimientos.
3. Implementar el registro de entradas y salidas con asignación automática de lotes (FEFO).
4. Implementar alertas de stock bajo y de vencimiento.
5. Generar reportes imprimibles/exportables y métricas de consumo.
6. Establecer control de acceso por roles y respaldo de la información.
7. Evaluar el sistema mediante métricas de funcionalidad, eficiencia y confiabilidad.

### 1.11 Alcances
- Gestión de productos y categorías (con indicador de vencimiento obligatorio).
- Entradas con número de lote automático y fecha de vencimiento.
- Salidas con descuento automático por lote (FEFO) y destino obligatorio.
- Existencias en tiempo real, búsqueda y seguimiento de lotes.
- Alertas: stock bajo, por vencer (días configurables) y vencidos.
- Historial inalterable de movimientos con usuario responsable.
- 3 reportes (existencias, entradas/salidas, vencimientos) imprimibles y exportables a CSV.
- Métricas: ranking y tendencia de consumo.
- Usuarios, roles (Administrador, Encargado, Consulta) y respaldos.
- Diseño adaptable a computadora, tableta y teléfono.

### 1.12 Límites
- Requiere conexión a internet (no funciona sin conexión).
- No maneja facturación, contabilidad ni precios/costos de productos.
- No lee códigos de barras.
- No envía notificaciones por correo o SMS; las alertas se ven dentro del sistema.
- No integra otros sistemas del asilo (expedientes médicos, planilla, etc.).
- Los movimientos no se editan ni eliminan; las correcciones se hacen con movimientos inversos.

---

## Capítulo II — Marco teórico (conceptos sugeridos)

> En su índice aparece "2.1 ¿Qué es una vida saludable?"; si corresponde a otra plantilla, reemplácelo por los conceptos del proyecto.

- Inventario y gestión de inventarios.
- Métodos de rotación: **FIFO** (primero en entrar, primero en salir) y **FEFO** (primero en vencer, primero en salir).
- Control por lotes y trazabilidad.
- Stock mínimo / punto de reorden.
- Sistemas de información y aplicaciones web.
- Arquitectura cliente-servidor y computación en la nube.
- Bases de datos relacionales y PostgreSQL.
- Next.js, React, TypeScript.
- Seguridad: autenticación, autorización por roles, Row Level Security.
- Metodología de desarrollo (p. ej. incremental / Scrum / prototipos — **[COMPLETAR la que usó]**).
- Norma ISO/IEC 25010 (calidad del software: funcionalidad, eficiencia, fiabilidad, usabilidad).

---

## Capítulo III — Marco metodológico

### 3.1 Tipo de investigación
Aplicada, con enfoque mixto (cuantitativo por encuestas y métricas; cualitativo por entrevistas/observación), de alcance descriptivo y diseño cuasi-experimental (antes/después del sistema).

### 3.2 Formulación de hipótesis (propuesta)
"La implementación de un sistema web de inventario con control por lotes mejora la gestión de insumos del Asilo Mis Días Dorados."

#### 3.2.1 Variable independiente: Sistema web de inventario
##### 3.2.1.1 Indicadores
- Porcentaje de requisitos funcionales implementados.
- Tiempo de respuesta de las pantallas.
- Número de errores encontrados en pruebas.
- Nivel de usabilidad percibido (encuesta).

#### 3.2.2 Variable dependiente: Gestión de inventario
##### 3.2.2.1 Indicadores
- Tiempo para conocer la existencia de un producto (antes vs. después).
- Tiempo para elaborar un reporte (antes vs. después).
- Cantidad de productos vencidos por mes.
- Número de faltantes/desabastecimientos.
- Exactitud del inventario (conteo físico vs. sistema).

### 3.3 Técnicas de investigación

#### 3.3.1 Métricas
##### 3.3.1.1 Desarrollo
- 15 pantallas, 2 servicios de exportación/respaldo, 9 tablas/vistas en la base de datos.
- Historial de versiones en GitHub: `FranciscoSuarez1625/sistema-inventario-mis-dias-dorados` (cada cambio integrado mediante pull requests).

##### 3.3.1.2 Funcionalidad
Matriz de requisitos funcionales (RF) para marcar "Cumple / No cumple":

| Código | Requisito |
| --- | --- |
| RF01 | Iniciar sesión con usuario y contraseña |
| RF02 | Gestionar usuarios y activar/desactivar |
| RF03 | Gestionar roles y permisos |
| RF04 | Gestionar categorías |
| RF05 | Gestionar productos |
| RF06 | Registrar entradas con lote automático |
| RF07 | Registrar salidas con asignación FEFO |
| RF08 | Consultar existencias |
| RF09 | Buscar y ver detalle de lotes |
| RF10 | Ver alertas de stock bajo, por vencer y vencidos |
| RF11 | Consultar historial con filtros |
| RF12 | Imprimir y exportar reportes |
| RF13 | Ver métricas de consumo |
| RF14 | Configurar días de alerta |
| RF15 | Descargar respaldo |

Fórmula: $$\text{Funcionalidad} = \frac{\text{RF que cumplen}}{\text{RF totales}} \times 100$$

##### 3.3.1.3 Eficiencia
- Tiempo de carga de cada pantalla (medir con las herramientas del navegador o Lighthouse/Web Vitals).
- Tiempo para registrar una entrada o salida (cronometrar con usuarios).
- Comparar tiempo de tareas antes (manual) y después (sistema).

##### 3.3.1.4 Confiabilidad
- Validaciones duplicadas en formulario y base de datos (ver tabla de reglas en el manual).
- Operaciones atómicas: cada entrada/salida se guarda completa o no se guarda.
- Bloqueo por producto al generar número de lote (evita números duplicados).
- Historial inalterable y respaldos.
- Fórmula sugerida: $$\text{Confiabilidad} = \left(1 - \frac{\text{fallos}}{\text{operaciones realizadas}}\right) \times 100$$

#### 3.3.2 Instrumentos
##### 3.3.2.1 Encuestas (preguntas sugeridas, escala Likert 1–5)
Antes del sistema:
1. ¿Con qué facilidad puede saber cuánto hay de un producto?
2. ¿Con qué frecuencia se vencen productos en bodega?
3. ¿Cuánto tiempo le toma elaborar un informe de inventario?
4. ¿Se sabe a dónde se destinó cada producto donado?

Después del sistema:
1. El sistema es fácil de usar.
2. Encuentro rápidamente la existencia de un producto.
3. Las alertas me ayudan a evitar vencimientos.
4. Los reportes son útiles y claros.
5. Recomendaría seguir usando el sistema.

### 3.4 Unidades de estudio
Asilo Mis Días Dorados — área administrativa y bodega.

### 3.5 Sujetos
> Su índice menciona "Pacientes, Médico, Personal de laboratorios"; para este proyecto los sujetos corresponden a:
- Administrador(a) / director(a).
- Encargados de bodega o inventario.
- Personal de cocina y enfermería (usuarios de consulta).

### 3.6 Diseño de la muestra
Al ser una población pequeña, se recomienda **muestra censal** (toda la población). **[COMPLETAR número de personas]**.

#### 3.6.1 Distribución de la muestra
| Grupo | Población | Muestra |
| --- | --- | --- |
| Administración | [ ] | [ ] |
| Bodega / inventario | [ ] | [ ] |
| Cocina / enfermería | [ ] | [ ] |

### 3.7 Estadística
Tabulación de frecuencias y porcentajes, gráficas de barras/pastel, media de las respuestas Likert y comparación antes/después (diferencia de medias; opcionalmente prueba t de Student para muestras relacionadas).

---

## Capítulo IV — Marco operativo

### 4.1 Propuesta de desarrollo
Sistema web de inventario por lotes, accesible desde cualquier navegador, con base de datos en la nube.

### 4.2 Introducción
(Resuma problema, solución y beneficios en un párrafo.)

### 4.3 Objetivos
Use los objetivos de 1.10 enfocados al producto (general: implementar el sistema; específicos: módulos).

### 4.4 Campo de acción (descripción teórica)

**Arquitectura:**

```
Usuario (navegador: PC / tableta / teléfono)
        │  HTTPS
        ▼
Vercel ─ Aplicación Next.js 16
  ├─ Páginas (React Server Components)
  ├─ Server Actions (registrar entrada, salida, productos, usuarios…)
  ├─ API: /api/exportar (CSV) y /api/respaldo
  └─ proxy.ts (verifica sesión en cada solicitud)
        │
        ▼
Supabase
  ├─ Auth (usuarios y contraseñas)
  └─ PostgreSQL
       ├─ Tablas, vista "existencias"
       ├─ Funciones: registrar_entrada, registrar_salida (FEFO)
       ├─ Disparadores de validación (enteros/decimales, cantidades)
       └─ Row Level Security por rol
```

**Diccionario de datos:**

| Tabla | Campos principales | Descripción |
| --- | --- | --- |
| `profiles` | id, nombre_completo, usuario, rol, activo, created_at | Datos del usuario vinculados a su cuenta |
| `roles` | clave, nombre, descripcion, acceso, sistema | Roles y su nivel de acceso |
| `categorias` | id, nombre, descripcion, color, requiere_vencimiento | Clasificación de productos |
| `productos` | id, codigo, nombre, categoria, unidad_medida, stock_minimo, descripcion, activo | Catálogo de productos |
| `lotes` | id, producto_id, numero_lote, cantidad_inicial, cantidad_actual, fecha_ingreso, fecha_vencimiento | Cada ingreso de un producto |
| `movimientos` | id, tipo (entrada/salida), producto_id, lote_id, cantidad, fecha, destino_o_origen, observaciones, usuario_id | Registro de entradas y salidas |
| `movimiento_lotes` | movimiento_id, lote_id, cantidad | Detalle de qué lote(s) afectó cada movimiento |
| `configuracion` | dias_alerta_vencimiento, fecha_ultimo_respaldo | Parámetros generales |
| `existencias` (vista) | producto + stock_total, proximo_vencimiento, estado_stock | Cálculo de existencias en tiempo real |

**Relaciones:** un producto pertenece a una categoría; un producto tiene muchos lotes; un movimiento pertenece a un producto y a un usuario; un movimiento de salida puede afectar varios lotes (tabla `movimiento_lotes`).

**Seguridad:** contraseñas cifradas por Supabase Auth; sesión verificada en cada página; permisos por rol en la interfaz, en el servidor y en la base de datos (RLS); consultas parametrizadas; encabezados de seguridad HTTP (HSTS, X-Frame-Options, nosniff, Referrer-Policy, Permissions-Policy).

### 4.5 Descripción operativa por fases (propuesta)
1. **Fase 1 — Análisis:** entrevistas, diagnóstico, requisitos.
2. **Fase 2 — Diseño:** base de datos, arquitectura, prototipos de pantallas.
3. **Fase 3 — Desarrollo:** autenticación y roles → productos y categorías → entradas/salidas por lotes → alertas, reportes, métricas → respaldos.
4. **Fase 4 — Pruebas e implementación:** pruebas funcionales, carga de datos, capacitación, puesta en marcha y evaluación.

### 4.6 Planificación
Elabore un diagrama de Gantt con las 4 fases y sus fechas **[COMPLETAR]**.

### 4.7 Presupuesto por fase
Distribuya el presupuesto de 1.5.3.1 en las fases 4.7.1–4.7.4 **[COMPLETAR]**.

### 4.8 Producto final
Sistema web con 14 módulos: Inicio, Registrar entrada, Registrar salida, Existencias, Lotes (con detalle), Alertas, Historial, Productos, Categorías, Reportes, Métricas, Usuarios, Roles y Configuración. Incluya capturas de pantalla de cada módulo (puede tomarlas siguiendo el orden del manual de usuario).

### 4.9 Resultados de la investigación
Presente aquí los resultados de las encuestas antes/después con tablas y gráficas **[COMPLETAR]**.

### 4.10 Métricas
Presente la matriz de requisitos (3.3.1.2), los tiempos medidos (3.3.1.3) y el cálculo de confiabilidad (3.3.1.4) **[COMPLETAR con sus mediciones]**.

### 4.11 Discusión de resultados
Compare los indicadores antes/después y con los antecedentes citados.

### 4.12 Comprobación de la hipótesis
Si los indicadores de la variable dependiente mejoran de forma significativa (p. ej. prueba t con p < 0.05), se acepta la hipótesis.

---

## Bibliografía sugerida (verificar y citar en formato APA)

- Next.js. (2026). *Documentación de Next.js*. https://nextjs.org/docs
- React. (2026). *Documentación de React*. https://react.dev
- Supabase. (2026). *Documentación de Supabase*. https://supabase.com/docs
- PostgreSQL Global Development Group. (2026). *Documentación de PostgreSQL*. https://www.postgresql.org/docs/
- Tailwind CSS. (2026). *Documentación*. https://tailwindcss.com/docs
- Vercel. (2026). *Documentación*. https://vercel.com/docs
- ISO/IEC 25010:2023. *Systems and software engineering — Product quality model*.
- Pressman, R. y Maxim, B. *Ingeniería del software: un enfoque práctico*. McGraw-Hill.
- Sommerville, I. *Ingeniería de software*. Pearson.
- Chopra, S. y Meindl, P. *Administración de la cadena de suministro*. Pearson (gestión de inventarios).
