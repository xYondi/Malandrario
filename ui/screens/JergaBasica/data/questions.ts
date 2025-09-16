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
    accepted: ['convive', 'convives'],
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
    a: 'Tener una discusión o pelear con alguien',
    hint: 'Acción de conflicto',
    mode: 'choices',
  },
  // 8 - INPUT reformulada
  {
    q: "¿Cómo se dice muy bien o calidad en venezolano?",
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



