const definitionBox = document.getElementById("definition");
const word = document.getElementById("define-word");
const mainPhonetic = document.getElementById("main-phonetic");
const otherPhonetics = document.getElementById("other-phonetics");
const origin = document.getElementById("origin");
const meanings = document.getElementById("meanings");

class Phonetic {
  constructor(text, audio) {
    this.text = text;
    this.audio = audio;
  }

  render() {
    return document.createTextNode(this.text || "");
  }
}

class Meaning {
  constructor(speech, definition, example, synonymns, antonyms) {
    this.speech = speech;
    this.definition = definition;
    this.example = example;
    this.synonymns = synonymns;
    this.antonymns = antonyms;
  }

  render() {
    const element = document.createElement("div");
    const speech = document.createTextNode(this.speech);
    const definition = document.createTextNode(this.definition);
    const example = document.createTextNode(this.example);
    
    const synonymns = document.createTextNode(this.synonymns.join(", "));
    const antonymns = document.createTextNode(this.antonymns.join(", "));
    element.append(speech, definition, example, synonymns, antonymns);
    return element;
  }
}

class Definition {
  constructor() {
    this.word;
    this.mainPhonetic;
    this.otherPhonetics;
    this.origin;
    this.meanings;
  }
  
  setWord(word) {
    this.word = word;
    return this;
  }

  setMainPhonetic(phonetic) {
    this.mainPhonetic = phonetic;
    return this;
  }

  setOtherPhonetics(phonetics) {
    this.otherPhonetics = phonetics.map((p) => new Phonetic(p.text, p.audio));
    return this;
  }

  setOrigin(origin) {
    this.origin = origin;
    return this;
  }

  setMeanings(meanings) {
    this.meanings = meanings.map((m) => {
      return new Meaning(m.partOfSpeech, 
                  m.definitions[0].example, 
                  m.definitions[0].definition, 
                  m.synonyms, 
                  m.antonyms
                 );
    });
    return this;
  }

  render() {
    word.textContent = this.word;
    mainPhonetic.textContent = this.mainPhonetic;
    origin.textContent = this.origin;
    otherPhonetics.replaceChildren(...this.otherPhonetics.map((p) => p.render()));
    meanings.replaceChildren(...this.meanings.map((m) => m.render()));
  }
}

export { Definition, Phonetic, Meaning }
