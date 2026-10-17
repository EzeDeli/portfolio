# Calculadora — React Native

Calculadora para celular con el estilo de la de iOS. Arma la cuenta completa en pantalla y la resuelve respetando el orden de las operaciones.

<p align="center">
  <img src="capturas/calculadora.jpeg" alt="Calculadora" width="280">
</p>

## Qué hace

- Suma, resta, multiplicación y división **respetando la precedencia**: `2+3x4` da `14`, no `20`.
- Muestra la fórmula completa mientras se escribe y, debajo, la última cuenta resuelta.
- **Cambio de signo (+/-)** sobre el último número, mostrándolo entre paréntesis: `5x(-3)`.
- Botón **del** para borrar el último carácter y **C** para limpiar todo.
- Validaciones de entrada:
  - un solo punto decimal por número;
  - si se aprietan dos operadores seguidos, el segundo reemplaza al primero;
  - no permite ceros a la izquierda;
  - si la cuenta termina en un operador, no la resuelve.
- **División por cero**: muestra `Error` en vez de un resultado falso.
- Redondeo a 10 decimales, para evitar resultados como `0.1+0.2 = 0.30000000000000004`.

## Cómo resuelve la cuenta

1. **Separa** la fórmula en números y operadores (`["2", "+", "3", "x", "4"]`).
2. **Primera pasada:** resuelve multiplicaciones y divisiones de izquierda a derecha.
3. **Segunda pasada:** resuelve sumas y restas sobre lo que quedó.

No usa `eval()`: el parser es propio.

## Stack

React Native · Expo · Expo Router · TypeScript

## Cómo correrla

```bash
npm install
npx expo start
```

---

Proyecto de la materia *Desarrollo de Aplicativos Móviles* — Tecnicatura Superior en Desarrollo de Software.
Desarrollado por **Ezequiel Delipetro** · [LinkedIn](https://www.linkedin.com/in/ezedelipetro/) · [Portfolio](https://ezedeli.github.io/Proyectos/)
