# Notas de Seguridad - Proyecto AquaEquipos

## 📦 Dependencias Auditadas

**Resultado del análisis (`npm audit`):**

- Paquetes vulnerables detectados:
  - `axios` ≤ 0.29.0
  - `follow-redirects` ≤ 1.15.5

## 🔒 Detalles de Vulnerabilidades Críticas

### 1. `axios`

- **Tipo de vulnerabilidad:**
  - Server-Side Request Forgery (SSRF)
  - Cross-Site Request Forgery (CSRF)
  - Regex Denial of Service
  - Credential leakage

- **Dependencias afectadas:** `@woocommerce/woocommerce-rest-api` depende de esta versión de `axios`.

- **Estado del fix:** ⚠️ **No hay solución oficial disponible aún** compatible con WooCommerce REST API (en su versión actual).

- **Referencias:**
  - https://github.com/advisories/GHSA-4w2v-q235-vp99
  - https://github.com/advisories/GHSA-wf5p-g6vw-rhxx
  - https://github.com/advisories/GHSA-jr5f-v2jv-69x6

### 2. `follow-redirects`

- **Tipo de vulnerabilidad:**
  - Exposición de información sensible
  - Fallos al gestionar headers como `Proxy-Authorization`

- **Dependencias afectadas:** utilizada internamente por `axios`.

- **Estado del fix:** ❌ No hay corrección estable publicada hasta la fecha.

---

## 🛡️ Medidas Actuales

- Solo se utilizan conexiones HTTPS seguras en llamadas a WooCommerce.
- Restricción de las peticiones salientes del servidor a dominios de confianza (solo `aquaequipos.com`).
- La clave pública y secreta de WooCommerce serán movidas a un archivo `.env` para protección del código fuente.

---

## 📘 Mejoras Futuras Sugeridas

1. **Actualizar WooCommerce REST API** cuando sea compatible con `axios` ≥ 0.21.1.
2. **Agregar proxy inverso o firewall** para filtrar y registrar solicitudes salientes.
3. **Migrar a una alternativa moderna de `axios`** en caso de no recibir mantenimiento continuo (ej. `undici`, `node-fetch`).
4. **Auditoría de seguridad automatizada semanal** mediante GitHub Actions o npm scripts.
5. **Validación estricta de URLs** antes de permitir llamadas externas desde el backend.

---

## ✅ Estado General

| Elemento                      | Estado    |
|------------------------------|-----------|
| Dependencias críticas seguras| ❌ No      |
| Fijación de claves API       | 🔜 En progreso |
| Auditoría completa aplicada  | ✅ Sí      |

---

_Última actualización: 22 de abril de 2025_
