//1º Cargamos datos
//open a txt file called example-singledataday using fs node library
const fs = require("fs");
const path = require("path");
const filePath = path.join(__dirname, "example-singledataday.txt");
let file = fs.readFileSync(filePath, "utf8");

//Load refs data into a constant
const refs = require("./refs.json");

let array = [];
//1º

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

//using regex to extract the word of the next expression: "ZP -> 1h;" ouput: "ZP"
file = file.split(";");
console.log("---------------------------------------------------------");
console.log(extractTerms(file));
console.log(extractTimes(file));
console.log(calculateTime(extractTimes(file)));
console.log(
  jsonGenerator(extractTerms(file), calculateTime(extractTimes(file)))
);
