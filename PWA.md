# 📱 Configuración PWA - La Púrpura

## ✅ Estado Actual

La aplicación está completamente configurada como PWA (Progressive Web App) con:

- ✅ **Manifest.json** configurado
- ✅ **Service Worker** para funcionalidad offline
- ✅ **Iconos** en todos los tamaños requeridos (72px a 512px)
- ✅ **Metadata** optimizada para instalación
- ✅ **Theme color** configurado (#851c74)
- ✅ **Apple Web App** compatible

## 🚀 Cómo Instalar la PWA

### En Android (Chrome/Edge)
1. Abre la app en el navegador
2. Toca el menú (⋮) → "Agregar a pantalla de inicio"
3. Confirma la instalación
4. ¡Listo! Aparecerá como app nativa

### En iOS (Safari)
1. Abre la app en Safari
2. Toca el botón Compartir (□↑)
3. Selecciona "Agregar a pantalla de inicio"
4. Confirma
5. ¡Listo! Aparecerá en tu home screen

### En Desktop (Chrome/Edge)
1. Abre la app en el navegador
2. Busca el ícono de instalación (⊕) en la barra de direcciones
3. Click en "Instalar"
4. ¡Listo! Se abrirá como app de escritorio

## 🔧 Características PWA

### Offline First
- La app funciona sin conexión
- Cache inteligente de recursos
- Sincronización automática cuando vuelve la conexión

### Instalable
- Se instala como app nativa
- No ocupa espacio en tiendas de apps
- Actualizaciones automáticas

### Responsive
- Funciona en móvil, tablet y desktop
- Diseño adaptativo
- Touch-friendly

## 📊 Verificar PWA

### Lighthouse Audit
```bash
# En Chrome DevTools
1. F12 → Lighthouse
2. Seleccionar "Progressive Web App"
3. Click "Generate report"
```

### Checklist PWA
- [x] HTTPS (requerido en producción)
- [x] Manifest.json válido
- [x] Service Worker registrado
- [x] Iconos 192x192 y 512x512
- [x] Responsive design
- [x] Metadata completa

## 🎨 Personalización

### Cambiar Iconos
Los iconos están en `public/icons/`. Para cambiarlos:

1. Crea un icono base de 512x512px
2. Genera todos los tamaños:
   ```bash
   # Usar herramienta online como:
   # https://realfavicongenerator.net/
   # o
   # https://www.pwabuilder.com/imageGenerator
   ```
3. Reemplaza los archivos en `public/icons/`

### Cambiar Theme Color
Edita `src/app/layout.tsx`:
```tsx
themeColor: "#TU_COLOR_AQUI"
```

Y `public/manifest.json`:
```json
"theme_color": "#TU_COLOR_AQUI"
```

## 🐛 Troubleshooting

### "La app no se puede instalar"
- Verifica que estés en HTTPS (en producción)
- Revisa que manifest.json sea válido
- Comprueba que los iconos existan

### "Service Worker no se registra"
- Abre DevTools → Application → Service Workers
- Verifica errores en la consola
- Asegúrate de que `sw.js` esté en `/public/`

### "Los cambios no se ven"
- Desregistra el SW: DevTools → Application → Service Workers → Unregister
- Limpia caché: DevTools → Application → Clear storage
- Recarga con Ctrl+Shift+R

## 📚 Recursos

- [PWA Checklist](https://web.dev/pwa-checklist/)
- [Manifest Generator](https://www.simicart.com/manifest-generator.html/)
- [Service Worker Cookbook](https://serviceworke.rs/)
- [PWA Builder](https://www.pwabuilder.com/)

## 🔐 Seguridad

En producción, asegúrate de:
- ✅ Usar HTTPS (Vercel/Netlify lo hacen automáticamente)
- ✅ Configurar CSP headers
- ✅ Validar manifest.json
- ✅ Mantener SW actualizado

---

**Nota**: Los screenshots en `public/screenshots/` son opcionales pero recomendados para mejorar la experiencia de instalación en Android.
