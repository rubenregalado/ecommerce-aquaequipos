# 📘 Guía básica de Git

## 📦 1. Clonar el repositorio (si no lo tienes)
```bash
git clone https://github.com/tu_usuario/tu_repositorio.git
cd tu_repositorio
```

---

## 🔀 2. Cambiar a `master` y actualizar
```bash
git checkout master
git pull origin master
```

---

## 🌿 3. Crear una nueva rama llamada `frontend-update`
```bash
git checkout -b frontend-update
```

---

## ✏️ 4. Realizar los cambios en el frontend
Edita los archivos necesarios en la carpeta correspondiente.

---

## ✅ 5. Verificar qué cambió
```bash
git status
```

---

## 📥 6. Agregar los cambios
```bash
git add .
```

---

## ✍️ 7. Hacer un commit con mensaje claro
```bash
git commit -m "Actualización del frontend: mejoras visuales y ajustes"
```

---

## 🚀 8. Subir la rama a GitHub
```bash
git push origin frontend-update
```

---

## 🌐 9. Crear un Pull Request en GitHub (opcional)
Desde GitHub, crea un Pull Request para fusionar `frontend-update` con `master`. Así pueden revisar los cambios antes de aceptarlos.

Pasos:
1. Ir al repositorio en GitHub.
2. Te sugerirá crear un Pull Request automáticamente.
3. Verifica que la base sea `master` y la rama a fusionar sea `frontend-update`.
4. Haz clic en "Create Pull Request".
5. Comenten, revisen y luego hagan clic en "Merge Pull Request".

---

## 🔁 10. Hacer merge manual desde la terminal (sin Pull Request)
### Solo si ya revisaron los cambios y desean hacerlo directamente:

```bash
git checkout master            # Volver a la rama principal
git pull origin master         # Traer los últimos cambios

git merge frontend-update      # Fusionar la rama

# Si no hay conflictos:
git push origin master         # Subir los cambios fusionados
```

---

## ✅ Buenas prácticas
- Nunca trabajes directamente en `master`
- Siempre haz `pull` antes de crear una nueva rama
- Escribe mensajes de commit claros y concisos
- Nombrar bien las ramas ayuda a mantener el orden
- Para grandes cambios, usar Pull Request permite mayor control


