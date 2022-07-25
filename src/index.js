import fs from "fs";
import getDoc from "./google-service";
import meetingParts from "../fetched-parts.json";
import getWeeklyParts from "./get-weekly-parts";
import * as formats from "./formats";

const START_WEEK_NUMBER = 27; // until where to search?
const UNTIL_WEEK_NUMBER = 35; // until where to search?
const LIFE_AND_MINISTRY = 2; // which tab is the tab of the life and ministry meeting (which tab should be used - index)
const LAST_ASSIGNED_PRESIDENT = 0; // index of the last used Elder in the sheet
const LAST_BIBLE_CONDUCTOR = 1; // index of the last used Elder in the sheet
const today = new Date();

let presidentName = ""; // global state for presidentName, do not change
let bibleStudyConductor = ""; // global state for presidentName, do not change

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const elders = [
  { index: 0, name: "Diego Garcia" },
  { index: 1, name: "Junior Lisboa" },
  { index: 2, name: "Agnaldo Neto" },
  { index: 3, name: "Adriano Vottas" },
  { index: 4, name: "Antonio Tricoli" },
  { index: 5, name: "Danilo Sampaio" },
  { index: 6, name: "Eduardo Barrinha" },
  { index: 7, name: "Marcio Castanheiro" },
  { index: 8, name: "Marcos Garcia" },
  { index: 9, name: "Guilherme Oliveira" },
];

// set year here
const baseUrl = `https://wol.jw.org/pt/wol/meetings/r5/lp-t/2022`;
// const baseUrl = `https://wol.jw.org/pt/wol/meetings/r5/lp-t/${today.getFullYear()}`;

function getWeekNumber() {
  const currentdate = new Date();
  const oneJan = new Date(currentdate.getFullYear(), 0, 1);
  const numberOfDays = Math.floor(
    (currentdate - oneJan) / (24 * 60 * 60 * 1000)
  );
  const result = Math.ceil((currentdate.getDay() + 1 + numberOfDays) / 7);
  return result;
}

// get weekly parts and save into the json file
async function getAllParts(week) {
  let startWeek = week || getWeekNumber();
  console.log("start week ", startWeek);
  const weeklyParts = [];

  while (startWeek <= UNTIL_WEEK_NUMBER) {
    const parts = await getWeeklyParts(baseUrl, startWeek);
    weeklyParts.push(parts);
    startWeek++;
  }

  fs.writeFileSync(
    "./fetched-parts.json",
    JSON.stringify(weeklyParts, null, 2)
  );
  return true;
}

async function addFormatting(partTitle, sheet, row) {
  const format = formats[partTitle] || formats.defaultFormat;

  const positions = row.a1Range.split("!")[1];
  await sheet.loadCells(positions);
  const cellA = sheet.getCellByA1(positions.split(":")[0]);
  const cellB = sheet.getCellByA1(positions.split(":")[1]);

  Object.keys(format).forEach((key) => {
    cellA[key] = format[key];
    cellB[key] = format[key];
  });
}

function isPresident(title) {
  let value = [
    "firstComments",
    "song1",
    "song2",
    "Comentários Finais",
    "Cântico",
  ].includes(title);

  if (title.includes("Comentários finais")) value = true;
  if (title.includes("Cântico")) value = true;
  return value;
}

function isBibleStudy(title) {
  let value = false;
  if (title.includes("Estudo bíblico de congregação")) value = true;
  if (title.includes("Oração Final")) value = true;
  return value;
}

async function addToCell(parts, sheet) {
  const partTitles = Object.keys(parts);

  for (const name of partTitles) {
    const isTitle = [
      "weekTitle",
      "section2Title",
      "section1Title",
      "section3Title",
    ].includes(name);

    const isArray = Array.isArray(parts[name]);
    let DESIGNADO = isTitle && name !== "weekTitle" ? "DESIGNADO" : "";

    let row;
    if (isArray) {
      for (const title of parts[name]) {
        if (isPresident(title)) DESIGNADO = presidentName;
        if (isBibleStudy(title)) DESIGNADO = bibleStudyConductor;
        // DESIGNADO = isPresident(title) ? presidentName : "";
        row = await sheet.addRow({ PARTE: title, DESIGNADO });
        DESIGNADO = "";
        await addFormatting(title, sheet, row);
      }
    } else {
      if (isPresident(name)) DESIGNADO = presidentName;
      row = await sheet.addRow({ PARTE: parts[name], DESIGNADO }).catch((e) => {
        console.log("error while adding row", e);
        return {};
      });

      await addFormatting(name, sheet, row);
    }

    await sheet.saveUpdatedCells();
  }
}

async function main(week) {
  //// Comment here if you dont want to fetch the parts
  const createdFile = await getAllParts(week);
  if (!createdFile) {
    console.error("Something went wrong while getting parts");
  }

  console.log('-----------------')
  const doc = await getDoc();
  const sheet = doc.sheetsByIndex[LIFE_AND_MINISTRY];

  let presidentIndex = LAST_ASSIGNED_PRESIDENT + 1;
  let bibleConductorIndex = LAST_BIBLE_CONDUCTOR - 1;

  for (const meeting of meetingParts) {
    if (presidentIndex > elders.length - 1) {
      presidentIndex = 0;
    }

    if (bibleConductorIndex < 0) {
      bibleConductorIndex = elders.length - 1;
    }
    console.log(meeting);
    presidentName = elders[presidentIndex].name;
    bibleStudyConductor = elders[bibleConductorIndex].name;

    await addToCell(meeting, sheet);
    presidentIndex++;
    bibleConductorIndex--;

    await sleep(15 * 1000);
  }
}

// set the year and week that you want to start and until the week number you wanna go
// set the index of the last president
// set the index of the last study bible conductor
// run npm start
main(START_WEEK_NUMBER).catch(console.log);
