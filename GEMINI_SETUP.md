# Configuración de API Keys

Para usar Gemini en la app Lexia, necesitas obtener tu API key gratuita:

## 1. Obtener tu API Key

1. Ve a [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Inicia sesión con tu cuenta de Google
3. Haz clic en "Get API Key" o "Create API Key"
4. Copia tu API key

## 2. Configurar la API Key en la app

Abre el archivo `src/services/gemini.ts` y reemplaza `'TU_API_KEY_AQUI'` con tu API key:

```typescript
const API_KEY = 'tu-api-key-aqui'; // Reemplazar con tu API key real
```

## 3. Reiniciar el servidor

Después de configurar tu API key, reinicia el servidor de Expo:

```bash
npx expo start --tunnel --clear
```

## Límites del Tier Gratuito

- **Modelo**: Gemini 3 Pro Preview
- **Requests por minuto**: 2 RPM (aproximado)
- **Contexto**: 1 millón de tokens

## Notas de Seguridad

⚠️ **IMPORTANTE**: En una app de producción, NUNCA debes incluir tu API key directamente en el código. 

Para producción, considera usar:
- Variables de entorno
- Backend proxy que maneje las llamadas a la API
- Servicios de gestión de secretos

Para desarrollo/pruebas, está bien usar la API key directamente como en este ejemplo.
