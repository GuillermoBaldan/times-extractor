////1º Cargamos datos
//open a txt file called example-singledataday using fs node library
const fs = require("fs");
const path = require("path");
const filePath = path.join(__dirname, "dataExample.v3.txt");
let file = fs.readFileSync(filePath, "utf8");

//Load refs data into a constant
const refs = require("./refs.json");

let array = [];
//1º

function extractDays(file) {
  let aux = [];
  let blocks;
  //input: "-12/05/2022-\nZP -> 1h;\nscan-papers -> 15';" output: ["-12/05/2022-"];
  pattern = /-\d{2}\/\d{2}\/\d{4}-/g;
  aux = file.match(pattern);
  for (let i = 0; i < aux.length; i++) {
    aux[i] = aux[i].replace("-", "");
    aux[i] = aux[i].replace("-", "");
  }

  return aux;
}

function extractBlocks(file) {
  let aux = [];
  //input: "-12/05/2022-\nZP -> 1h;\nscan-papers -> 15';\n-13/05/2022-\njob-search -> 1h;\npersonal-planning -> 30'" output: ["ZP -> 1h;\nscan-papers -> 15'","job-search -> 1h;\npersonal-planning -> 30'"];
  pattern =
    /(([a-zíA-Z]+-?:?)+(\s|\n)*(->\s)*([0-9]+,?[0-9]*(h|');?\s?\+?\s?)*)+/g;
  aux = file.match(pattern);
  return aux;
}

function createObject(file) {
  let dates = [];
  let blocks = [];
  let objectArray1 = [];
  let objectArray2 = [];
  dates = extractDays(file);
  blocks = extractBlocks(file);
  for (let i = 0; i < dates.length; i++) {
    objectArray1[i] = {};
    objectArray1[i].date = dates[i];
    objectArray1[i].block = blocks[i];
  }
  /* console.log("--------------Fase 2--------------");
  console.log(objectArray1);
  //Extraemos los términos
  console.log("------------Mostramos las tareas------------");
  objectArray1.forEach((element) => {
    console.log(element.block);
  }); */

 // console.log("------------Mostramos los tiempos------------");

  objectArray1.forEach((element) => {
    objectArray2.push(
      jsonGenerator(extractTasks(element.block), extractTimesv2(element.block))
    );
  });
  //Metemos las fechas
  for (i = 0; i < objectArray2.length; i++) {
    for (let j = 0; j < objectArray2[i].length; j++) {
      objectArray2[i][j].date = objectArray1[i].date;
    }
  }
  //Hacemos un array de objetos general
  let generalArray = [];
  for (i = 0; i < objectArray2.length; i++) {
    for (let j = 0; j < objectArray2[i].length; j++) {
      generalArray.push(objectArray2[i][j]);
    }
  }

  return generalArray;
}


async function orderObject(file){

    try {
    let generalArray = await createObject(file);
    let auxArray = [];
    generalArray.forEach( item => {
    if (isOnObject(item.term, auxArray)) {
      auxArray = insertDataByTerm(item,auxArray)
    }else{
      auxArray.push({ term: item.term, data: [{ count: item.time, date: item.date}]})
    }

    })
    return auxArray;
    } catch(err){
    console.log(err)
     }
    
}

function isOnObject(string,array){
  let flag = false;
  array.forEach( item => {
      for (let key in item ) {
          if (item[key] === string) {
            
            flag = true;
          }
      }
    })
    return flag;
}

function insertDataByTerm(item, array){
  console.log("Dentro de la función insertData")
  array.forEach(element =>{
    if(item.term === element.term){
      element.data.push({count: item.time, date: item.date})
    }
  })
  return array;
}

function extractTasks(string) {
  let tasks = [];
  let pattern = /([a-zA-Z]+-?)+\s->/g;
  tasks = string.match(pattern);
  //Retiramos '->'
  tasks = tasks.map((element) => {
    return element.replace(" ->", "");
  });

  return tasks;
}

function extractTerms(array) {
  let terms = [];
  //write the pattern for the next test input: " word1-word2 -> 1h" output: "word1-word2"
  let pattern = /([a-zA-Z0-9\s-]+)->\s/g;
  array.forEach((element) => {
    terms.push(element.match(pattern));
  });

  //Erase null items
  terms = terms.filter((element) => {
    return element !== null;
  });

  //Erase "\r" and "\n"
  terms = terms.map((element) => {
    return element.toString().replace(/\r?\n|\r/g, "");
  });

  //Erase " -> "
  terms = terms.map((element) => {
    return element.toString().replace(/ -> /g, "");
  });

  return terms;
}

function extractTimesv2(string) {
  let times = [];
  let pattern = /([0-9]+,?[0-9]*[h|']\s?\+?\s?)+;/g;
  times = string.match(pattern);
  //Calculamos los timpos en minutos
  //retiramos ';'
  times = times.map((element) => {
    return element.replace(";", "");
  });

  times = calculateTimev2(times);

  return times;
}

function extractTimes(array) {
  let times = [];
  //write the pattern for the next test input: " software-proyect-ideasrooms -> 1h + 0,5h + 1h" output: "1h + 0,5h + 1h"
  let pattern = /([0-9]+,?[0-9]*[h|'])/g;
  array.forEach((element) => {
    times.push(element.match(pattern));
  });
  //erase null items
  times = times.filter((element) => {
    return element !== null;
  });

  return times;
}

function calculateTimev2(array) {
  let auxArray1 = [];
  let auxArray2 = [];
  let pattern = /([0-9]+,?[0-9]*[h|'])/g;
  for (let i = 0; i < array.length; i++) {
    auxArray1[i] = array[i].toString().match(pattern);
  }
  //phase 1: convert to minutes
  for (i = 0; i < auxArray1.length; i++) {
    for (let j = 0; j < auxArray1[i].length; j++) {
      auxArray1[i][j] = auxArray1[i][j].replace(",", ".");
      if (auxArray1[i][j].includes("h")) {
        auxArray1[i][j] = auxArray1[i][j].replace("h", "");
        auxArray1[i][j] = parseFloat(auxArray1[i][j]) * 60;
      } else if (auxArray1[i][j].includes("'")) {
        auxArray1[i][j] = auxArray1[i][j].replace("'", "");
        auxArray1[i][j] = parseFloat(auxArray1[i][j]);
      }
    }
  }
  //phase 2: sum
  let sum = 0;
  for (i = 0; i < auxArray1.length; i++) {
    for (let j = 0; j < auxArray1[i].length; j++) {
      sum += parseFloat(auxArray1[i][j]);
    }
    auxArray2[i] = sum;
    sum = 0;
  }

  return auxArray2;
}

function calculateTime(array) {
  let auxArray = [];
  //recorrer todos los elementos de la matriz array
  //pasandolos a minutos
  for (i = 0; i < array.length; i++) {
    for (j = 0; j < array[i].length; j++) {
      if (array[i][j].includes("h")) {
        array[i][j] = array[i][j].replace("h", "");
        array[i][j] = array[i][j].replace(",", ".");
        array[i][j] = parseFloat(array[i][j]) * 60;
      } else if (array[i][j].includes("'")) {
        array[i][j] = array[i][j].replace("'", "");
        array[i][j] = parseFloat(array[i][j]);
      }
    }
  }
  //sumar todos los elementos de la matriz array
  for (i = 0; i < array.length; i++) {
    auxArray[i] = 0;
    for (j = 0; j < array[i].length; j++) {
      auxArray[i] += array[i][j];
    }
  }
  return auxArray;
}

function jsonGenerator(terms, times) {
  let aux = [];
  for (i = 0; i < terms.length; i++) {
    aux[i] = {};
    aux[i].term = terms[i];
    aux[i].time = times[i];
  }
  return aux;
}

async function main(){
  console.log("Mostramos el objeto de datos")
  await console.log(createObject(file));
  console.log("Ahora Mostramos el objeto general de datos que será transformoado en un JSON")
  console.log(JSON.stringify(await orderObject(file)));
}


let config = require("./config/config.json");
const { create } = require("domain");
config.iterationNumber++;
console.log("---------------------------------------------------------");
console.log(`Iteration number: ${config.iterationNumber}`);

//Main program
main();

//We save the config.json file
fs.writeFileSync(
  path.join(__dirname, "config/config.json"),
  JSON.stringify(config, null, 2),
  "utf8"
);
