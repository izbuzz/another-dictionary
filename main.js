// api endpoints
const RANDOMWORD = "https://random-word-api.herokuapp.com/word";
const DEFINITION = "https://api.dictionaryapi.dev/api/v2/entries/en/";

// definition container
const definitionBox = document.getElementById("definition");
const word = document.getElementById("define-word");
const mainPhonetic = document.getElementById("phonetic");
const otherPhonetics = document.getElementById("phonetics");
const origin = document.getElementById("origin");
const meanings = document.getElementById("meanings");

// searching for words
const searchbox = document.getElementById("searchbox");
const input = document.getElementById("search-input");
// random word
const randomBtn = document.getElementById("random-btn");

// error message
const notFound = document.getElementById("not-found");
const errorMessage = document.getElementById("error-message");

// start off with random word
getRandomWord().then(word => constructDefinitionBox(word));

// searching for words
searchbox.addEventListener("submit", (event) => {
  event.preventDefault();
  constructDefinitionBox(input.value.toLowerCase());
});

// gettinag a random word
randomBtn.addEventListener("click", (event) => {
  event.preventDefault();
  getRandomWord().then(word => constructDefinitionBox(word));
});

/** 
 * Renders the entire definition to the DOM, 
 * or in case of error, an error message
 * @param {string} the word to construct a definition for
 */
async function constructDefinitionBox(word) {
  // grab the definition of the word
  const json = await getDefinition(word);

  // handle no definition and error
  if (!json || !json[0]) {
    if (!json) {
      // no json, such as when random word errors
      errorMessage.textContent = "An error has occured.";
    } else if (!json[0]) {
      // no definitions
      errorMessage.textContent = "No definition found for " + word + ".";
    }

    // show error message
    notFound.style.visibility = "visible";
    notFound.style.display = "block";

    // hide definitions
    definitionBox.style.display = "none"
    definitionBox.style.visibility = "hidden";

    return;
  } 

  // render to DOM
  new Definition(json[0]).render();

  // hide definitions
  definitionBox.style.visibility = "visible";
  definitionBox.style.display = "block";

  // show error message
  notFound.style.display = "none"
  notFound.style.visibility = "hidden";
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
  return await response.json();
}

/**
 * 
 * @class
 * @classdesc Representation of a definition repsonse object
 */
class Definition {
  constructor(json) {
    // a definition has the word, an phonetic, and potentially an origin
    this.word = json.word;
    this.phonetic = json.phonetic;
    this.origin = json.origin;

    // but a definition could have multiple pronunctionas
    this.phonetics = json.phonetics.map((p) => new Phonetic(p));
    // and for each partOfSpeech, there are definitions
    this.meanings = json.meanings.map((m) => new Meaning(m));
  }

  render() {
    // render to DOM
    word.textContent = this.word;
    mainPhonetic.textContent = this.phonetic;
    origin.textContent = this.origin;

    // these ones each have different rendering methods
    otherPhonetics.replaceChildren(...this.phonetics.map((p) => p.render()));
    meanings.replaceChildren(...this.meanings.map((m) => m.render()));
  }
}

/**
 * 
 * @class
 * @classdesc Representation of a phonetic in Definition response
 */
class Phonetic {
  constructor(phonetic) {
    // sometimes the phonetic has no tetx
    this.text = phonetic.text || "";
    // nothing is done with the audio at the moment
    this.audio = phonetic.audio;
  }

  render() {
    // render to dom
    const element = document.createElement("div");
    element.textContent = this.text;
    return element;
  }
}

/**
 * 
 * @class
 * @classdesc Representation of a meaning in Definition response
 */
class Meaning {
  constructor(meaning) {
    // separates definitions by part of speech
    this.speech = meaning.partOfSpeech;
    // there are multiple definitions
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

      // parse examples
      if (definition.example) {
	const exampleText = document.createElement("code");
	exampleText.textContent = definition.example;
	e.append(exampleText);
      }

      // definitions can have synonyms and antonyms too, 
      // but we will add them to the same list above
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
