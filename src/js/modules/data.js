import {
    prefix
} from './string.js';

let data;

/**
 * Get a set with all terms starting with the letter, resp, the first letter of the term in the case of a string
 * @param letter
 * @returns {Set}
 */
const getBlock = letter => {
    if (!data.grouped[letter]) {
        return new Set();
    }
    return data.grouped[letter];
}

const refresh = (app, foundTerms) => {

    // {Set} terms that have not been used yet
    data.foundTerms = new Set(foundTerms);

    // {String} last term entered
    data.lastTerm = foundTerms[foundTerms.length - 1] || '';

    // {String} last letter entered
    data.lastLetter = data.lastTerm ? data.lastTerm.slice(-1) : '';

    // {Set} letters that have been used
    data.foundLetters = new Set();

    // {Set} terms that have not been used yet
    data.remainingTerms = new Set(Array.from(data.dictionary).filter(term => !data.foundTerms.has(term)));

    data.foundTerms.forEach(term => {
        term.split('').forEach(letter => {
            data.foundLetters.add(letter);
        })
    })

    // {Set} letters that have not been used yet
    data.remainingLetters = new Set();

    data.allLetters.forEach(letter => {
        if (!data.foundLetters.has(letter)) {
            data.remainingLetters.add(letter);
        }
    })

    // {Object} words grouped by first letter
    data.grouped = {};
    data.remainingTerms.forEach(term => {
        const letter = term.charAt(0);
        if (!data.grouped[letter]) {
            data.grouped[letter] = new Set();
        }
        data.grouped[letter].add(term);
    })

    console.log(data)

    app.trigger(prefix('wordsUpdated'));
}

/**
 * Build initial data set
 * @param {App} app
 * @param {HTMLElement} foundTerms
 * @param {Integer} maxWords
 */
const init = (app, foundTerms, maxWords) => {
    data = {
        // {Set} all available terms
        dictionary: new Set(window.gameData.dictionary),

        // {Set} all available letters
        allLetters: new Set(window.gameData.sides.join('').split('')),

        // {Integer} maximal number of words allowed
        maxWords: maxWords,

        // {Set} solution
        solution: new Set(window.gameData.ourSolution)
    }

    app.on(prefix('resultChange'), (evt) => {
        refresh(app, evt.detail)
    });

    refresh(app, foundTerms);
}

/**
 * Get the number of elements in a data set
 * @param {Integer} type 
 */
const getSize = type => {
    if(!data[type] || (typeof data[type].length === 'undefined' && typeof data[type].size === 'undefined')) {
        console.error(`data[${type}] is not countable`);
        return false;
    }
    return data[type].size || data[type].length;
}

/**
 * Returns a list
 * @param {String} type
 * @returns {Array}
 */
const getData = type => {
    return data[type];
}

export default {
    init,
    getData,
    getSize,
    getBlock
}
