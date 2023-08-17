// import "definition.js"
// for reference then could be for the most part replaced with await
// and usually results in shorter and more readable code
// but just remember to use .then() when using the result of a
// async function

const definitionBox = document.getElementById("definition");
const word = document.getElementById("define-word");
const mainPhonetic = document.getElementById("phonetic");
const otherPhonetics = document.getElementById("phonetics");
const origin = document.getElementById("origin");
const meanings = document.getElementById("meanings");

class Phonetic {
  constructor(phonetic) {
    this.text = phonetic.text || "";
    this.audio = phonetic.audio;
  }

  render() {
    const element = document.createElement("div");
    element.textContent = this.text;
    return element;
  }
}

class Meaning {
  constructor(meaning) {
    this.speech = meaning.partOfSpeech;
    this.definitions = meaning.definitions;
    this.synonyms = meaning.synonyms;
    this.antonyms = meaning.antonyms;
  }

  render() {
    // create an element to hold our meaning
    const element = document.createElement("div");
    element.classList.add("meaning");

    const speech = document.createElement("h3");
    speech.textContent = this.speech;

    // parse synonyms and antonyms
    const synonyms = document.createElement("div");
    if (this.synonyms && this.synonyms.length > 0) {
      const title = document.createElement("h4");
      title.textContent = "Synonyms";
      title.classList.add("synonyms");
      synonyms.append(title);

      const text = document.createElement("p");
      text.textContent = this.synonyms.join(", ");
      text.classList.add("margin-left");
      synonyms.append(text);
    } 

    const antonyms = document.createElement("div");
    if (this.antonyms && this.antonyms.length > 0) {
      const title = document.createElement("h4");
      title.textContent = "Antonyms";
      title.classList.add("antonyms");
      antonyms.append(title);

      const text = document.createElement("p");
      text.textContent = this.antonyms.join(", ");
      text.classList.add("margin-left");
      antonyms.append(text);
    } 

    // get all definitions and create a list from them
    const definitions = document.createElement("ul");
    for (const definition of this.definitions) {
      const e = document.createElement("li");

      const definitionText = document.createElement("div");
      definitionText.textContent = definition.definition;
      e.append(definitionText);

      if (definition.example) {
	const exampleText = document.createElement("code");
	exampleText.textContent = definition.example;
	e.append(exampleText);
      }

      // these can have synonyms and antonyms too, add them to the one above
      const syn = document.createElement("div");
      if (definition.synonyms && definition.synonyms.length > 0) {
	syn.textContent = "synonyms: " + definition.synonyms.join(", ");
      } 
      synonyms.append(syn);

      const ant = document.createElement("div");
      if (definition.antonyms && definition.antonyms.length > 0) {
	antonyms.textContent = "antonyms: " + definition.antonyms.join(", ");
      } 
      antonyms.append(ant);

      definitions.append(e);
    }

    element.append(speech, definitions, synonyms, antonyms);
    return element;
  }
}

class Definition {
  constructor(json) {
    this.word = json.word;
    this.phonetic = json.phonetic;
    this.origin = json.origin;

    // these are arrays so convert them into our own format
    this.phonetics = json.phonetics.map((p) => new Phonetic(p));
    this.meanings = json.meanings.map((m) => new Meaning(m));
  }

  render() {
    word.textContent = this.word;
    mainPhonetic.textContent = this.phonetic;
    origin.textContent = this.origin;
    otherPhonetics.replaceChildren(...this.phonetics.map((p) => p.render()));
    meanings.replaceChildren(...this.meanings.map((m) => m.render()));
  }
}

const RANDOMWORD = "https://random-word-api.herokuapp.com/word";
const DEFINITION = "https://api.dictionaryapi.dev/api/v2/entries/en/";

const randomWord = document.getElementById("random-word");

const searchbox = document.getElementById("searchbox");
const input = document.getElementById("search-input");
const randomBtn = document.getElementById("random-btn");
const notFound = document.getElementById("not-found");

// start off with random word
getRandomWord().then(word => constructDefinitionBox(word));

searchbox.addEventListener("submit", (event) => {
  event.preventDefault();
  constructDefinitionBox(input.value.toLowerCase());
  input.value = "";
});

randomBtn.addEventListener("click", (event) => {
  event.preventDefault();
  
  getRandomWord().then(word => constructDefinitionBox(word));
});

async function constructDefinitionBox(word) {
  const json = await getDefinition(word);
  if (!json) {
    const h = document.createElement("h1");
    h.textContent = "An error occured.";
    notFound.replaceChildren(h);

    notFound.style.visibility = "visible";
    notFound.style.display = "block";

    definitionBox.style.display = "none"
    definitionBox.style.visibility = "hidden";
    return;
  } else if (!json[0]) {
    const h = document.createElement("h1");
    h.textContent = "No definition found for " + word + ".";
    notFound.replaceChildren(h);

    notFound.style.visibility = "visible";
    notFound.style.display = "block";

    definitionBox.style.display = "none"
    definitionBox.style.visibility = "hidden";
    return;
  }

  definitionBox.style.visibility = "visible";
  definitionBox.style.display = "block";

  notFound.style.display = "none"
  notFound.style.visibility = "hidden";
  new Definition(json[0]).render();
}

/** 
 * Fetches a random word
 * @return {PROMISE} a promise holding a string
 */
async function getRandomWord() {
  const response = await fetch(RANDOMWORD);
  const result = await response.json();
  return result[0];
}

/** 
 * Fetches the definition of a word
 * @param {STRING} word the word to define
 * @return {PROMISE} a promise holding a json
 */
async function getDefinition(word) {
  // encode word, in case there are special characters in it
  const response = await fetch(DEFINITION + encodeURIComponent(word));
  if (!response.ok) {
    return null;
  }
  return await response.json();
}
