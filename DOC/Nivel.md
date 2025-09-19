# Sistema de Niveles - Malandrario

## 📋 Resumen

El sistema de niveles permite a los usuarios progresar a través de diferentes niveles de dificultad en el juego "Traduce la Jerga", desbloqueando contenido nuevo a medida que completan niveles y ganando recompensas.

## 🏗️ Arquitectura

### Componentes Principales

1. **UserProgressService** (`/services/UserProgressService.ts`)
   - Servicio principal para manejar el progreso del usuario
   - Utiliza AsyncStorage para persistencia local
   - Maneja niveles, pistolitas, estadísticas y progresión

2. **Questions Data** (`/ui/screens/JergaBasica/data/questions.ts`)
   - Estructura de datos para preguntas por nivel
   - Exporta `ALL_LEVELS` con todos los niveles disponibles
   - Soporte para preguntas tipo 'choices' e 'input'

3. **JergaBasicaScreen** (`/ui/screens/JergaBasica/JergaBasicaScreen.tsx`)
   - Pantalla principal del juego
   - Carga preguntas dinámicamente según el nivel
   - Actualiza progreso al completar niveles

4. **InicioScreen** (`/ui/screens/Inicio/InicioScreen.tsx`)
   - Muestra nivel actual y pistolitas del usuario
   - Se actualiza automáticamente al regresar de niveles

## 📊 Estructura de Datos

### UserProgress Interface
```typescript
interface UserProgress {
  currentLevel: number;        // Nivel actual desbloqueado
  completedLevels: number[];   // Niveles completados
  gemsEarned: number;          // Gemas totales ganadas
  totalCorrectAnswers: number; // Respuestas correctas totales
  totalQuestions: number;      // Preguntas totales respondidas
  streakRecord: number;        // Mejor racha conseguida
}
```

### Question Interface
```typescript
interface Question {
  q: string;                   // Texto de la pregunta
  choices?: string[];          // Opciones para modo 'choices'
  a: string;                   // Respuesta correcta canónica
  hint: string;                // Pista para ayuda
  mode: 'choices' | 'input';   // Tipo de pregunta
  accepted?: string[];         // Respuestas alternativas aceptadas (modo input)
}
```

## 🎮 Flujo del Sistema

### 1. Inicialización
- Al abrir la app, se carga el progreso del usuario desde AsyncStorage
- Si no existe progreso, se inicializa con valores por defecto (Nivel 1, 0 pistolitas)
- El `InicioScreen` muestra el nivel y pistolitas actuales

### 2. Selección de Nivel
- Los usuarios solo pueden acceder a su nivel actual
- Niveles futuros están bloqueados hasta completar el nivel actual
- El `JergaBasicaScreen` carga las preguntas correspondientes al nivel

### 3. Progresión
- Al completar todas las preguntas de un nivel correctamente:
  - Se desbloquea el siguiente nivel
  - Se otorgan pistolitas basadas en el rendimiento
  - Se actualizan las estadísticas del usuario
- Si el usuario falla, debe reintentar el nivel actual

### 4. Recompensas
- **Pistolitas por Pregunta**: 2 pistolitas por respuesta correcta + bonus por racha
  - Racha de 3+ respuestas: +1 pistolita adicional
  - Animación visual al ganar pistolitas
- **Bonus por Completar Nivel**: 10 pistolitas adicionales al terminar el nivel
- **Total por Nivel Perfecto**: ~30 pistolitas (20 por preguntas + 10 bonus)
- Las pistolitas se pueden usar para comprar ayudas en el juego
- **Costos de Ayuda**:
  - Revelar una letra: 25 pistolitas
  - Quitar letras incorrectas: 50 pistolitas
  - Validar respuesta: 150 pistolitas
  - Continuar tras derrota: 2 pistolitas

## 📁 Estructura de Niveles

### Nivel 1 (Jerga Básica)
- 10 preguntas mezclando 'choices' e 'input'
- Conceptos fundamentales de jerga venezolana
- Preguntas: convive, en la olla, echar los perros, coroto, etc.

### Nivel 2 (Jerga Intermedia)  
- 10 preguntas con mayor dificultad
- Preguntas específicas con teclado: ladillados, trastes, estar pegado, jalar bolas
- Conceptos: pava, perol, bulto, sancocho, etc.

### Niveles Futuros
- La estructura permite agregar fácilmente más niveles
- Solo agregar al objeto `ALL_LEVELS` en `questions.ts`

## 🔧 API del UserProgressService

### Métodos Principales

```typescript
// Obtener progreso actual
static async getUserProgress(): Promise<UserProgress>

// Completar un nivel
static async completeLevel(
  levelNumber: number,
  correctAnswers: number, 
  totalQuestions: number,
  streakAchieved: number,
  gemsEarned: number
): Promise<UserProgress>

// Verificar si un nivel está desbloqueado
static async isLevelUnlocked(levelNumber: number): Promise<boolean>

// Verificar si un nivel está completado
static async isLevelCompleted(levelNumber: number): Promise<boolean>

// Actualizar pistolitas (para compras/recompensas)
static async updateGems(gemsToAdd: number): Promise<UserProgress>

// Resetear progreso (para testing)
static async resetProgress(): Promise<void>
```

## 🎯 Características del Sistema

### ✅ Implementado
- [x] Persistencia local con AsyncStorage
- [x] Progresión lineal de niveles
- [x] Sistema de pistolitas como recompensa
- [x] Estadísticas de rendimiento
- [x] Preguntas dinámicas por nivel
- [x] Interfaz actualizada en tiempo real
- [x] Nivel 1 y Nivel 2 completos

### 🔄 Posibles Mejoras Futuras
- [ ] Sistema de logros/achievements
- [ ] Modo multijugador/ranking global
- [ ] Niveles con temáticas específicas
- [ ] Sistema de vidas/energía con recarga temporal
- [ ] Modo práctica para niveles completados
- [ ] Estadísticas detalladas por nivel

## 🐛 Debugging y Testing

### Para Testing
```typescript
// Resetear progreso del usuario
await UserProgressService.resetProgress();

// Verificar estado actual
const progress = await UserProgressService.getUserProgress();
console.log('Current progress:', progress);
```

### Logs Importantes
- Carga de progreso: "Error loading user progress"
- Guardado: "Error saving user progress" 
- Actualización: "Error updating user progress"

## 📝 Notas de Implementación

1. **AsyncStorage**: Todos los datos se almacenan localmente en el dispositivo
2. **Nivel Dinámico**: El juego carga automáticamente las preguntas del nivel actual
3. **Progresión Segura**: Solo se puede avanzar completando el nivel actual
4. **Recompensas Balanceadas**: Las pistolitas se otorgan de manera proporcional al rendimiento
5. **UI Reactiva**: La interfaz se actualiza automáticamente al cambiar de nivel

---

## 🚀 Cómo Agregar un Nuevo Nivel

1. Crear las preguntas en `questions.ts`:
```typescript
export const QUESTIONS_LEVEL_3: Question[] = [
  // ... tus preguntas aquí
];
```

2. Agregar al objeto `ALL_LEVELS`:
```typescript
export const ALL_LEVELS = {
  1: QUESTIONS_LEVEL_1,
  2: QUESTIONS_LEVEL_2,
  3: QUESTIONS_LEVEL_3, // ← Nuevo nivel
} as const;
```

3. ¡Listo! El sistema automáticamente:
   - Detectará el nuevo nivel
   - Lo desbloqueará cuando se complete el nivel anterior
   - Cargará las preguntas correspondientes
   - Otorgará recompensas al completarlo
