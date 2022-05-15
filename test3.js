const fs = require("fs");
const path = require("path");

//open test.txt
const filePath = path.join(__dirname, "test3.txt");
let file = fs.readFileSync(filePath, "utf8");

function process(file) {
  let aux = [];
  let blocks;

  pattern = /([a-zíA-Z]+-?[a-zíA-Z]*(\s|\n)*(->\s)*([0-9]+,[0-9]+)*)+/g;
  aux = file.match(pattern);

  return aux;
}

console.log("------------------------------------------");
console.log(process(file).length);
process(file).forEach((element) => {
  console.log("-------");
  console.log(element);
});
