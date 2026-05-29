# WebFriends

Sitio sencillo para que amigos o parejas a distancia se conecten, jueguen y compartan cosas.

## Qué hay aquí
- `index.html` — Interfaz principal (chat local, tic-tac-toe, notas locales, compartir imágenes).
- `style.css` — Estilos responsive y tema.
- `script.js` — Interacciones (almacenamiento local para prototipo).

## Pasos para crear el repositorio y desplegar
1. Inicializar repo local y hacer commit:

```powershell
git init
git add .
git commit -m "Initial commit: WebFriends"
git branch -M main
```

2. Crear un repositorio en GitHub (por UI o con `gh`), luego enlazar y subir:

```powershell
git remote add origin https://github.com/tu-usuario/nombre-repo.git
git push -u origin main
```

3. Desplegar en Vercel (opciones):

- Opción A: Conectar el repositorio en https://vercel.com (recomendado). Vercel detecta sitio estático y desplegará automáticamente en cada push.

- Opción B: Usar la CLI de Vercel:

```powershell
npm i -g vercel
vercel login
vercel --prod
```

4. Variables y secretos: para futuras funciones en tiempo real o almacenamiento, usa `VERCEL` Environment Variables o un backend.

## Notas
- Este prototipo usa `localStorage` para persistencia local; para que sea realmente en tiempo real habrá que añadir un backend (WebSocket, Supabase Realtime, Firebase, etc.).

Si quieres, puedo:
- Crear el repositorio en GitHub por ti (necesitaré un token o permisos), o
- Explicarte y automatizar el despliegue por CLI.
