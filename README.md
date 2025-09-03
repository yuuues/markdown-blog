# Markdown Blog

Un mini blog estático basado en ficheros Markdown. Cada URL limpia como `/mi-post` carga y renderiza `files/mi-post.md`. No requiere build ni backend: basta con servir estos archivos estáticos en cualquier servidor web.

## Características
- Sin dependencias de build: HTML + CSS + JS plano.
- Render de Markdown con `marked` vía CDN.
- Modo claro/oscuro con persistencia en `localStorage` y respeto al tema del sistema.
- Branding configurable (título y texto del pie) mediante `config.json`.
- Página 404 personalizada (`files/404.md`).
- Rutas limpias: `/` → `files/index.md`, `/algo` → `files/algo.md`.

## Estructura del proyecto
- `index.html`: plantilla principal (carga el parser y app.js).
- `app.js`: lógica del enrutado y render de Markdown.
- `styles.css`: estilos (incluye variables para tema claro/oscuro).
- `config.base.json`: base de configuración. Cópiala a `config.json` para personalizar.
- `files/`: aquí van tus páginas en Markdown.
  - `index.md`: portada.
  - `404.md`: mostrado cuando no se encuentra la página.

## Cómo funciona el enrutado
- La ruta actual se convierte en un “slug”.
  - `/` → `index` → se carga `files/index.md`.
  - `/alto` → se carga `files/algo.md`.
- Si el fichero no existe, se intenta mostrar `files/404.md`.
- El título del documento se actualiza con el primer `# Título` del Markdown y el título base del sitio.

## Configuración (opcional)
1. Copia `config.base.json` como `config.json` en la raíz del proyecto.
2. Ajusta los campos disponibles:
   - `title`: Título del sitio. También actualiza el “brand” del header.
   - `footerSpan`: Texto que aparece antes de “Generado con …” en el pie.

Ejemplo `config.json`:
```json
{
  "title": "Mi Blog",
  "footerSpan": "Mi Blog · "
}
```

Notas:
- `config.json` se carga en tiempo de ejecución. Si no existe, se usan valores por defecto.
- El pie añade automáticamente un espacio si falta al final de `footerSpan`.

## Añadir contenido
- Crea un archivo Markdown dentro de `files/` con el nombre de tu slug.
- Visita la URL correspondiente en el navegador.

Ejemplos:
- `files/index.md` → `/` o `/index`
- `files/mi-primer-post.md` → `/mi-primer-post`

Sugerencia: empieza el archivo con `# Mi título` para que el `title` del documento se componga como “Mi título · <Título del sitio>”.

## Desarrollo local
Para evitar problemas con `fetch()` al abrir archivos con `file://`, sirve el directorio con un servidor HTTP simple.

Opciones:
- Apache/Nginx/IIS (cualquier hosting clásico).
- Node (opcional): `npx serve` o `npx http-server` en la carpeta del proyecto.
- Laragon/XAMPP/MAMP: coloca la carpeta dentro del directorio del servidor y navega a la URL local.

## Despliegue
Es una SPA mínima: todas las rutas deberían resolver a `index.html` para que el JS decida qué Markdown cargar. Configura una regla de rewrite o fallback en tu hosting para que las rutas no existentes se sirvan con `index.html`.

Ejemplo (Apache, .htaccess):
```
FallbackResource /index.html
```
O reglas equivalentes en Nginx/Netlify/Vercel/etc.

## Personalización
- Modifica colores y tipografías en `styles.css` (variables CSS al inicio).
- El botón “🌓” alterna el tema y guarda la preferencia en `localStorage`.
- Edita la navegación en `index.html` si necesitas más enlaces.

## Solución de problemas
- Veo 404 del navegador al navegar a `/mi-post` en producción:
  - Falta una regla de fallback a `index.html` en el servidor.
- La portada carga pero no se actualiza el brand o el pie:
  - Revisa que `config.json` exista, sea JSON válido y esté en la raíz.
- El Markdown no se renderiza y veo el texto en `<pre>`:
  - La librería `marked` del CDN no cargó; revisa la conexión o la etiqueta `<script>` en `index.html`.

## Licencia
MIT
