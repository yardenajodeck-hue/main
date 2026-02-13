# CFD demo — Página lista para Vercel

Demo educativa simple sobre conceptos básicos de flujo (visualización 2D y partículas).

Cómo usar localmente

1. Abrir `index.html` en un navegador moderno.
2. Ajustar controles (tipo de campo, intensidad) y presionar "Reiniciar partículas" si quieres volver al estado inicial.

Desplegar en Vercel

- Con la CLI (instala `vercel` si no la tienes):

```bash
vercel deploy --prod
```

- O conecta este repositorio a Vercel desde el dashboard; Vercel detectará un sitio estático y servirá `index.html`.

Notas

- Esta demo es educativa, no un solver CFD. Para integrar C++ real considera compilar a WebAssembly o desplegar un backend separado.
