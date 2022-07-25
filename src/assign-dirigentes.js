// fazer algoritmo para pegar os dias.
// listar os dirigentes (mesmas pessoas ficam em ordens diferentes)
// colocá-los por dia
// resolver feriados

import fs from 'fs';
import getDoc from "./google-service";

let m = new Date().getMonth();
let y = new Date().getFullYear();
const DIRIGENTES_TAB = 3;

function getLastDayOfTheMonth(currentMonth, currentYear) {
  let nextMonth = currentMonth + 1;
  let date = new Date(currentYear, nextMonth, 0);

  return date.getDate();
}

function getDaysWithPreaching() {
  const [sunday, monday, tuesday, wednesday, saturday] = [0, 1, 2, 3, 6];

  return {
    [sunday]: [],
    [monday]: [],
    [tuesday]: [],
    [wednesday]: [],
    [saturday]: [],
  };
}

function fillDaysWithPreaching(currentMonth, currentYear) {
  const lastDay = getLastDayOfTheMonth(currentMonth, currentYear);
  const fieldServiceDays = getDaysWithPreaching();

  for (let i = 1; i <= lastDay; i++) {
    // sunday == 0
    const date = new Date(currentYear, currentMonth, i)
    const dayOfTheWeek = date.getDay();
    const day = date.getDate();

    if (!fieldServiceDays[dayOfTheWeek]) {
      continue
    }
    
    fieldServiceDays[dayOfTheWeek].push(day);
  }

  return fieldServiceDays;
}

console.log(fillDaysWithPreaching(m, y));

const [sunday, monday, tuesday, wednesday, saturday] = [0, 1, 2, 3, 6];

const dirigentes = {
  [sunday]: [],
  [monday]: [],
  [tuesday]: [],
  [wednesday]: [],
  [saturday]: [],
};

dirigentes[monday].push(
  "Adriano Vottas",
  "Monica Figueiredo", 
  "Danilo Figueiredo"
);

dirigentes[tuesday].push(
  "Diego Garcia",
  "Junior Lisboa",
  "Guilherme Oliveira",
  "Adriano Vottas",
  "Paola Eduarda",
);

dirigentes[wednesday].push(
  "Letícia Figueiredo",
  "Evelyn Ferreira",
  "Wilma Centoducato",
  "Constantinos",
  "Renan Augusto",
);

dirigentes[saturday].push(
  // anciaos

  // "Adriano Vottas",
  "Renan Augusto", // servo
  "Antonio Tricoli",
  "Guilherme Oliveira",
  "Danilo Figueiredo", // servo
  "Diego Garcia",
  "Newton Radaic", // servo
  "Rafael Lopes", // servo
  "Junior Lisboa ",
  "Marcio Castanheiro",
  "Gerson Hypolito", // servo
  "Danilo Figueiredo", // servo (repetido)
  "Agnaldo Santos",
  "Eduardo Barrinha",
  "Renan Augusto", // servo (repetido)
  "Newton Radaic", // servo (repetido)
  "Marcos Garcia",
  "Danilo Sampaio",
  "Rafael Lopes" // servo (repetido)
);

const designacoes = {}
function assignByDay(lastAssigned, day, availableDirigentes) {
  if (!designacoes[day]) {
    designacoes[day] = [];
  }
  designacoes[day].push(availableDirigentes[lastAssigned]);
  lastAssigned++;

  // start to assign again, from the begining
  if (lastAssigned >= availableDirigentes.length) {
    lastAssigned = 0;
  }

  return lastAssigned;
}

function fillDirigentes() {
  const preachingDays = fillDaysWithPreaching(m, y);
  let lastMondayDirigente = 0
  let lastTuesdayDirigente = 0
  let lastWednesdayDirigente = 0
  let lastSaturdayDirigente = 0
  for (const dayOfTheWeek in preachingDays) {
    const availableDirigentes = dirigentes[dayOfTheWeek]

    console.log("preaching days", preachingDays[dayOfTheWeek]);
    preachingDays[dayOfTheWeek].forEach((day) => {
      if (dayOfTheWeek == monday) {
        lastMondayDirigente = assignByDay(lastMondayDirigente, `${day}-segunda-noite`, availableDirigentes); 
      }

      if (dayOfTheWeek == tuesday) {
        lastTuesdayDirigente = assignByDay(lastTuesdayDirigente, `${day}-terca-noite`, availableDirigentes); 
      }

      if (dayOfTheWeek == wednesday) {
        lastWednesdayDirigente = assignByDay(lastWednesdayDirigente, `${day}-quarta-noite`, availableDirigentes); 
      }

      if (dayOfTheWeek == saturday) {
        lastSaturdayDirigente = assignByDay(lastSaturdayDirigente, `${day}-sabado-manha`, availableDirigentes);
        lastSaturdayDirigente = assignByDay(lastSaturdayDirigente, `${day}-sabado-tarde`, availableDirigentes);
      }
    });

  }
}

fillDirigentes()
console.log("designacoes", designacoes);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

fs.writeFileSync(
  "./designacoes.json",
  JSON.stringify([designacoes], null, 2)
);

async function main() {
  const doc = await getDoc();
  const sheet = doc.sheetsByIndex[DIRIGENTES_TAB];

  // console.log(sheet);

  const [DATA,	DIA,	HORARIO,	DIRIGENTE, OBSERVACAO] = ["DATA", "DIA", "HORÁRIO", "DIRIGENTE", "OBSERVAÇÃO"]
  const keys = Object.keys(designacoes)
  const entries = Object.values(designacoes)

  for (let i = 0; i < keys.length; i++) {
    const designacao = keys[i];
    const [designado] = entries[i]
    console.log("designacao", designacao, "designado", designado);

    const info = designacao.split("-")
    const dia = info[0]
    const diaSemana = info[1]
    const horario = info[2]

    horario = {
      "manha": "10:00",
      "tarde": "15:30",
      "noite": "19:00",
    }[horario]


    diaSemana = {
      "segunda": "Segunda-feira",
      "terca": "Terça-feira",
      "quarta": "Quarta-feira",
      "sabado": "Sábado",
    }[diaSemana]

    console.log("info", info);

    const headers = {
      [DATA]: `${dia}/julho`,
      [DIA]: diaSemana,
      [HORARIO]: horario,
      [DIRIGENTE]: designado,
      [OBSERVACAO]: "",
    }

    console.log("headers", headers);

    await sheet.addRow(headers);
    await sheet.saveUpdatedCells();
  }
    


}

main().catch(console.log);
