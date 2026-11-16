# Meet the Oca

Un juego para conocerse en pareja basado en el clásico juego de la oca. En lugar de casillas de suerte, cada casilla es una excusa para hablar: preguntas, retos, juegos de adivinar y casillas especiales que cambian el ritmo de la partida.

Se juega con un solo móvil, pasándolo entre las dos personas.

## Modos de juego

| Modo | De qué va |
|---|---|
| **Básico** | Tablero de 63 casillas con preguntas ligeras y divertidas: gustos, comida, manías, viajes y «¿y si...?». |
| **Personal** | Para conocerse de verdad: infancia, familia y amistades, sueños, valores, miedos y cómo os veis. |
| **Caliente** (+18) | Atracción, provocación, deseos, fantasías y retos de contacto. Más juego que charla. |
| **Infierno** (+18) | La versión explícita de Caliente. Se activa al empezar una partida de Caliente, confirmando que los dos sois mayores de edad. |
| **Aleatorio** | Elegís qué mazos mezclar, qué casillas especiales hay y qué tipos de tarjeta quitar, o lo dejáis todo al azar. |
| **Dado de temas** | Sin tablero: un dado de seis caras reparte entre 3 y 9 temas elegidos y sale una tarjeta del tema que queda arriba. |
| **Cartas** | Sin tablero: preguntas por rondas con cinco cartas en la mano y cartas especiales (roba dos, te la devuelvo, doble, salta turno...). |

> Los modos Caliente e Infierno son para mayores de edad y vienen **ocultos por defecto**. Para verlos hay que desactivar «Ocultar contenido +18» en Ajustes.

## Qué tiene

- **Tablero en espiral** con casillas especiales: oca, verdad o reto, posada, pozo, cárcel, dados, espejo, pregunta libre y cambio.
- **Cuatro mazos de unas 200 tarjetas** (Básico, Personal, Caliente e Infierno), con tres niveles de intensidad que suben según avanza la partida.
- **Tipos de tarjeta**: preguntas, retos (algunos con cuenta atrás), «¿qué prefieres?», adivina sobre mí, yo nunca, completa la frase, debate, escalas y propuestas del 1 al 10.
- **Memoria entre partidas**: la app recuerda las tarjetas que han salido y prioriza las que no se han visto hace poco.
- **Mazos editables** desde Ajustes: activar o desactivar tarjetas, añadir tarjetas propias y editar las existentes.
- **Pases** para saltarse tarjetas, historial de turnos y resumen de respuestas al final.
- **Dado en 3D** que cae sobre la mesa y rueda hasta el resultado.
- **Ajustes**: volumen de música y efectos, vibración, número de pases, pregunta final, ocultar contenido +18 (activado por defecto), reducir animaciones y textura de papel.
- **Reglas** de cada modo dentro de la partida y un resumen de todos desde el inicio.

## Tecnología

- [Expo](https://expo.dev) SDK 58 con React Native y TypeScript
- `expo-router` para la navegación
- `react-native-svg` para el tablero, las ilustraciones y el dado
- `expo-audio` y `expo-haptics` para sonido y vibración
- `AsyncStorage` para guardar ajustes, mazos y tarjetas vistas
- Jest para los tests de la lógica del juego

## Estructura

```
src/
  app/          Pantallas (inicio, modos, jugadores, partida, dado, cartas, ajustes, mazos, reglas)
  components/   Tablero, dado, tarjetas, ventanas, ilustraciones
  data/         Mazos, tablero, modos, temas del dado y reglas
    decks/      Mazos de tarjetas
  engine/       Lógica del juego: tiradas, casillas, barajas y modo Cartas
  assets/       Sonidos y texturas
```

## Puesta en marcha

```bash
npm install
npx expo start
```

Escanea el QR con Expo Go en el móvil (los dos en la misma red Wi-Fi).

Tests y comprobación de tipos:

```bash
npx jest
npx tsc --noEmit
```

## Publicar una versión

Las versiones de prueba se publican con EAS Update en la rama `TESTS`:

```bash
npx eas-cli update --branch TESTS --message "qué ha cambiado"
```

En Expo Go se abren desde Projects, meet-the-oca, TESTS.

## Créditos

- Efectos de sonido: [Casino Audio de Kenney](https://kenney.nl/assets/casino-audio) (licencia CC0).
- Inspiración para algunas preguntas: el juego de cartas *We're Not Really Strangers*.

## Licencia

MIT. Consulta el archivo `LICENSE`.
