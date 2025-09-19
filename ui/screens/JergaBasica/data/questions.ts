export interface Question {
  q: string;
  choices?: string[];
  a: string; // respuesta canónica
  hint: string;
  mode: 'choices' | 'input';
  accepted?: string[]; // respuestas alternativas aceptadas para modo input
}

export const QUESTIONS_LEVEL_1: Question[] = [
  // 1 - INPUT
  {
    q: "¿Cómo se dice 'muchacho' o 'muchacha' en la jerga venezolana de barrio?",
    a: "convive",
    hint: "Empieza con 'co...'",
    mode: 'input',
    accepted: ['convive', 'convives', 'causa', 'mano'],
  },
  // 2 - INPUT
  {
    q: "Si un chamo se queda sin trabajo y no tiene ni un bolívar para pagar la renta, ¿en qué situación está?",
    a: "en la olla",
    hint: "Expresión de estar en aprietos",
    mode: 'input',
    accepted: ['en la olla'],
  },
  // 3 - INPUT reformulada
  {
    q: "¿Cómo se dice cuando se coquetea o seduce a alguien?",
    a: "echar los perros",
    hint: "Frase con 'perros'",
    mode: 'input',
    accepted: ['echar los perros', 'echando los perros'],
  },
  // 4 - CHOICES (igual)
  {
    q: "En la jerga, ¿qué es un 'coroto'?",
    choices: [
      'Un tipo de comida exótica',
      'Un animal de la calle',
      'Un objeto o una cosa cualquiera que no tiene mucho valor',
      'Una persona muy perezosa',
    ],
    a: 'Un objeto o una cosa cualquiera que no tiene mucho valor',
    hint: 'Todos tenemos corotos en la casa.',
    mode: 'choices',
  },
  // 5 - INPUT (respuesta pensar)
  {
    q: "¿Qué significa 'darle al coco'?",
    a: 'pensar',
    hint: 'Acción de la mente',
    mode: 'input',
    accepted: ['pensar', 'analizar', 'pensarlo']
  },
  // 6 - INPUT reformulada burda
  {
    q: "¿Qué significa 'burda'?",
    a: 'mucho',
    hint: 'Cantidad',
    mode: 'input',
    accepted: ['mucho', 'bastante'],
  },
  // 7 - CHOICES (igual)
  {
    q: "En la jerga, ¿qué significa la frase 'Echar una vaina'?",
    choices: [
      'Tener una discusión o pelear con alguien',
      'Echar algo en un recipiente',
      'Hablar de algo sin importancia',
      'Comer una comida tradicional',
    ],
    a: 'Echar algo en un recipiente',
    hint: 'Acción de poner algo en un',
    mode: 'choices',
  },
  // 8 - INPUT reformulada
  {
    q: "¿Cómo se dice muy bien en venezolano?",
    a: 'chévere',
    hint: 'Lleva tilde en la primera vocal',
    mode: 'input',
    accepted: ['chévere', 'chevere'],
  },
  // 9 - CHOICES (igual)
  {
    q: "Llegas a la casa y tu vecina te dice: '¡Ponte las pilas que en la esquina se armó un brollo!'. ¿Qué te está avisando?",
    choices: [
      'Que hay una fiesta con mucha gente',
      'Que hay un problema, un chisme o un escándalo en la calle',
      'Que alguien está borracho',
      'Que hay mucho tráfico',
    ],
    a: 'Que hay un problema, un chisme o un escándalo en la calle',
    hint: 'WhatsApp vibra con esto',
    mode: 'choices',
  },
  // 10 - INPUT (igual)
  {
    q: "Cuando a alguien le llega una gran cantidad de dinero de forma inesperada, ¿qué dirían los panas que le cayó?",
    a: 'un palo',
    hint: 'Excelente golpe de suerte',
    mode: 'input',
    accepted: ['un palo', 'tremendo palo'],
  },
];

export const QUESTIONS_LEVEL_2: Question[] = [
  // 1 - CHOICES
  {
    q: "Un chamo te dice que su mamá le puso una 'pava' y que por eso no va a salir. ¿Qué significa eso?",
    choices: [
      'Que su mamá le puso un castigo',
      'Que su mamá no le dio permiso',
      'Que su mamá está molesta con él',
      'Que su mamá no le deja ir a la fiesta',
    ],
    a: 'Que su mamá no le deja ir a la fiesta',
    hint: 'A menudo se usa en Venezuela para decir que alguien se va a quedar en casa por una razón que su mamá no aprueba.',
    mode: 'choices',
  },
  // 2 - INPUT
  {
    q: "Te encuentras con tus panas un domingo y todos están aburridos. ¿Qué frase dirían para describir su estado de ánimo?",
    a: "ladillados",
    hint: "Se usa para describir un estado de aburrimiento y molestia.",
    mode: 'input',
    accepted: ['ladillado'],
  },
  // 3 - CHOICES
  {
    q: "En la jerga, ¿a qué se refiere un chamo cuando dice 'Ese carro es viejo, es un perol'?",
    choices: [
      'Que el carro es nuevo',
      'Que el carro es una basura',
      'Que el carro es muy viejo',
      'Que el carro es un objeto sin valor, viejo e inservible',
    ],
    a: 'Que el carro es un objeto sin valor, viejo e inservible',
    hint: 'Es sinónimo de "coroto".',
    mode: 'choices',
  },
  // 4 - INPUT
  {
    q: "Te vas de paseo a la playa con tus panas. Cuando están guardando todo en el carro, ¿cómo llamarías a todas las maletas, bolsos y demás cosas que llevas?",
    a: "trastes",
    hint: "Son todas tus pertenencias, como si te estuvieras mudando.",
    mode: 'input',
    accepted: ['trastes', 'corotos', 'vainas'],
  },
  // 5 - CHOICES
  {
    q: "En un trabajo en equipo, hay un compañero que no ayuda en nada y te deja toda la carga. En la jerga de la calle, ¿qué dirías que es él?",
    choices: [
      'Un flojo',
      'Una carga',
      'Un bulto',
      'Un inútil',
    ],
    a: 'Un bulto',
    hint: 'Es el que solo estorba y no hace nada productivo.',
    mode: 'choices',
  },
  // 6 - CHOICES
  {
    q: "¿Qué significa la frase 'Se formó el sancocho'?",
    choices: [
      'Se formó un alboroto o un desorden',
      'Se está cocinando un sancocho',
      'Se está celebrando una fiesta',
      'Se formó una fila',
    ],
    a: 'Se formó un alboroto o un desorden',
    hint: 'Se usa para describir una situación caótica.',
    mode: 'choices',
  },
  // 7 - CHOICES
  {
    q: "En un partido de béisbol, ¿qué significa si un chamo te dice que 'le salió el tiro por la culata'?",
    choices: [
      'Que un plan salió mal',
      'Que un tiro fue muy bueno',
      'Que una persona fue muy afortunada',
      'Que alguien se salvó de un problema',
    ],
    a: 'Que un plan salió mal',
    hint: 'Es lo que pasa cuando te va muy mal.',
    mode: 'choices',
  },
  // 8 - INPUT
  {
    q: "¿Cómo se dice cuando una persona no entiende o no hace algo que debe hacer?",
    a: "estar pegado",
    hint: "En el juego te puede pasar esto si no ganas metras.",
    mode: 'input',
    accepted: ['estar pegado', 'pegado'],
  },
  // 9 - INPUT
  {
    q: "¿Cómo se dice cuando le pides tanto a alguien?",
    a: "jalar bolas",
    hint: "Se usa para describir a alguien que hace todo para caerle bien a una persona.",
    mode: 'input',
    accepted: ['jalar bolas', 'jalando bolas'],
  },
  // 10 - CHOICES
  {
    q: "¿Qué significa la frase 'Echar una mano'?",
    choices: [
      'Ayudar a alguien',
      'Pelear con alguien',
      'Pedir dinero',
      'Lanzar algo',
    ],
    a: 'Ayudar a alguien',
    hint: 'A veces se usa para decir que quieres ayudar a alguien.',
    mode: 'choices',
  },
];

// Exportar todos los niveles
export const ALL_LEVELS = {
  1: QUESTIONS_LEVEL_1,
  2: QUESTIONS_LEVEL_2,
} as const;

export type LevelNumber = keyof typeof ALL_LEVELS;



