var WordObj = require('./wordobj'),
    _ = require('underscore'),
    pos = require('pos'),

    tagger = new pos.Tagger();


var syntacticFilter = function(tag) {

    //skip Web links
    if (/^http\:\/\/.*$/.test(tag[0])) return false;

    switch(tag[1]) {

        case 'FW' : //foreign word

        case 'JJ' : //adjectives
        case 'JJR' :
        case 'JJS' :

        case 'NN' : //nouns
        case 'NNP' :
        case 'NNPS' :
        case 'NNS' :

        case 'URL' : //special case. there should be no URLS at this point

            return true;

        default: return false;
    }
};

var normalize = function(word) {

    var normalizedWord = "";

    //normalize words that don't have alpha numeric characters to ""
    //(either typo or punctuation)
    if (/.*\w.*/.test(word)) {

        //to lower case
        var _word = word.toLowerCase();

        //strip end of word punctuation
        //(likely to be punctuation and not special characters in a name. Ex: wil.i.am
        normalizedWord = _word.replace(/^(.*)[\W]$/, "$1");

        //strip beginning of word punctuation
        normalizedWord = normalizedWord.replace(/^[^a-z](.*)$/, "$1");
    }

    return normalizedWord;
};

/**
 * Convert sentence(s) to list of words.
 * Exclude "words" with no alphanumeric characters (likely to be markup)
 *
 * Ex: 'http://drudge.com is da bomb' ==>
 *
 * [0] : http://drudge.com  //URL is a "word"
 * [1] : is
 * [2] : da
 * [3] : bomb
 *
 * @param content
 * @returns {Array}
 */
var parseWordList = function(content) {

    var rawWordList = content.split(/\s+/),
        wordList = [];

    _.each(rawWordList, function(rawWord) {

        var word = normalize(rawWord);

        if (word) {

            wordList.push(word);
        }
    });

    return wordList;
} ;


/**
 * Tagging valid "words" for use w/ textrank.
 * Only nouns/adjectives are marked included
 *
 * @param content
 * @returns {Array}
 */
exports.filter = function(content) {

    var wordObjList = [],

        wordList = parseWordList(content),
        taggedWords = tagger.tag(wordList);


    _.each(taggedWords, function(tag, index) {

        var word = tag[0];

        var wordObj = new WordObj.WordObj(index, word, syntacticFilter(tag));

        wordObjList.push(wordObj);
    });

    return wordObjList;
};
