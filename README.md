# CFD Demo — Página lista para Vercel

Demo educativa interactiva sobre conceptos básicos de flujos computacionales (CFD).

## Características

- 🎨 **Visualizador 2D de flujo** con partículas en tiempo real
- 📊 **Calculadora de Reynolds y Péclet** para análisis numérico
- 🧮 **Simulador 1D** de advección-difusión con discretización automática
- 📐 **Visualizador de stencils** (plantillas de discretización FD)
- 📈 **Gráfico de convergencia** log-log interactivo
- 🎓 **Resumen de Unidades 2-5** sobre discretización CFD

## Archivos

- `index.html` — Estructura principal (HTML5)
- `styles.css` — Estilos (fondo negro, tema oscuro)
- `script.js` — Lógica interactiva (canvas, simulaciones)
- `vercel.json` — Configuración para Vercel
- `README.md` — Este archivo

## Uso Local

**Opción 1: Abrir directamente en navegador**
```bash
start index.html
```

**Opción 2: Servidor HTTP (si tienes Python)**
```bash
python -m http.server 8080
# Abre: http://localhost:8080
```

**Opción 3: Con Node.js**
```bash
npx http-server . -p 8080
```

⚠️ Nota: Los estilos CSS no se cargan correctamente desde `file://` en navegadores modernos por razones de seguridad. **Usa un servidor HTTP** o **desplega en Vercel** para ver todos los estilos.

## Despliegue en Vercel

### Método 1: Upload directo (sin Git)
1. Ve a [vercel.com/new](https://vercel.com/new)
2. Click en **"Upload"** (arriba a la derecha)
3. Selecciona la carpeta `proyectos`
4. Click en **"Deploy"**

Tu sitio estará en vivo en ~1 minuto con URL: `https://tu-proyecto.vercel.app`

### Método 2: Con Git (GitHub/GitLab)
1. Push la carpeta a un repositorio Git
2. Ve a [vercel.com](https://vercel.com)
3. Click en "New Project"
4. Selecciona tu repositorio
5. Framework: selecciona **"Other"** (sitio estático)
6. Click en "Deploy"

## Estructura del Proyecto

```
proyectos/
├── index.html         ← Página principal
├── styles.css         ← Estilos (fondo negro)
├── script.js          ← JavaScript interactivo
├── vercel.json        ← Config Vercel
├── README.md          ← Este archivo
├── .gitignore         ← Archivos a ignorar en Git
└── .vercelignore      ← Archivos a ignorar en Vercel
```

## Contenido Educativo

### Secciones

1. **Visualizador de flujo 2D** — Simula campos (vórtice, cizalla, fuente)
2. **Calculadora Reynolds (Re)** — Clasifica régimen laminar/turbulento
3. **Calculadora Péclet (Pe)** — Recomienda esquema numérico
4. **Simulador 1D** — Advección-difusión con Δt ajustable
5. **Stencils** — Muestra patrones de discretización (3-point, 5-point, upwind)
6. **Convergencia** — Gráfico log-log de orden de exactitud
7. **Unidades 2-5** — Teoría CFD (discretización espacial/temporal, ecuaciones)

## Notas Técnicas

- **Fondo**: Negro (#000000) con gradiente animado sutil
- **Canvas**: Renderizado 2D con WebGL-ready (si se expande)
- **Responsivo**: Se adapta a móviles y tablets
- **Sin dependencias**: JavaScript vanilla, HTML5 puro
- **Vercel**: Detecta automáticamente como sitio estático

## Créditos

Creado para estudiantes de CFD (Unidades 2-5: Simulación Numérica de Fluidos).

---

**¿Preguntas?** Revisa la sección "Unidades 2-5" en la página web.

