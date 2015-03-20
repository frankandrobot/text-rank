var Filter = require('./filter-en'),
    _ = require('underscore'),

    edgeWindowSize = 5,
    pageRankConstant = 0.85;



/**
 * Adds only the included words to the word graph
 *
 * @param wordGraph
 * @param wordList
 */
var initGraph = function(wordGraph, wordList) {

    _.each(wordList, function(wordObj) {

        if (wordObj.isIncluded) {

            wordGraph[wordObj.word] = {

                word: wordObj.word,
                neighbors: [],
                _neighborMap: {}
            };
        }
    });
};


var addEdge = function(node1, node2) {

    if (!node1._neighborMap[node2.word]) {

        node1.neighbors.push(node2);
        node1._neighborMap[node2.word] = node2;
    }
};

/**
 * Adds two edges between two words if they're less than #edgeWindowSize words away in #wordList
 *
 * @param wordGraph
 * @param wordList
 * @param edgeWindowSize
 */
var addEdges = function(wordGraph, wordList, edgeWindowSize) {

    _.each(wordList, function(curWord, cur) {

        if (curWord.isIncluded) {

            for (var neighbor = cur+1; neighbor < Math.min(cur+1+edgeWindowSize, wordList.length); neighbor++) {

                var neighborWord = wordList[neighbor];

                if (neighborWord.isIncluded) {

                    var curNode = wordGraph[curWord.word],
                        neighborNode = wordGraph[neighborWord.word];

                    addEdge(curNode, neighborNode);
                    addEdge(neighborNode, curNode);
                }
            }
        }
    });
};


/**
 * Goes thru wordList. If two (included) words are less than #edgeWindowSize away,
 * adds an adge to the word graph
 *
 * @param wordList
 * @param edgeWindowSize
 */
var createUndirectedGraph = function(wordList, edgeWindowSize) {

    var wordGraph = {};

    initGraph(wordGraph, wordList);
    addEdges(wordGraph, wordList, edgeWindowSize);

    return wordGraph;
};



var sum = function(collection, iteree) {

    var sum = 0;

    _.forEach(collection, function(item) {

        sum += iteree(item);
    });

    return sum;
}

var score = function(wordGraph, scores, node, d) {

    var _sum = sum(node.neighbors, function(neighbor) {

        return 1 / neighbor.neighbors.length * scores[neighbor.word];
    });

    return (1 - d) + d * _sum;
};

var initScores = function(wordGraph, scores) {

    _.forEach(wordGraph, function(node) {

        scores[node.word] = 1;
    });
};

var updateScores = function(wordGraph, scores, d) {

    _.forEach(wordGraph, function (node) {

        scores[node.word] = score(wordGraph, scores, node, d);
    });
};

var getTotalScore = function(scores) {

    return sum(scores, function(score) {

        return score;
    });
};

var computeTextRank = function(wordGraph, pageRankConstant) {

    var scores = {},
        len = 0,
        scoreDiff = 1;


    initScores(wordGraph, scores);


    while(scoreDiff > 0.00001 && len++ < 100) {

        var curScore = getTotalScore(scores);

        updateScores(wordGraph, scores, pageRankConstant);

        var newScore = getTotalScore(scores);

        scoreDiff = Math.abs(curScore - newScore);
    }

    return scores;
};

var textrank = function(content, edgeWindowSize, pageRankConstant) {

    var wordList = Filter.filter(content),
        wordGraph = createUndirectedGraph(wordList, edgeWindowSize);

    var scores = computeTextRank(wordGraph, pageRankConstant);

    var sorted = _.sortBy(wordGraph, function(node) {

        return -scores[node.word];
    });

    sorted = _.pluck(sorted, 'word');

    var rslt = [],
        len = 0,
        max = Math.min(10, wordList.length / 3);

    _.find(sorted, function(obj) {

        rslt.push(obj);

        return !(++len < max);
    });

    return rslt;
};


/**
 * Exposing this for testing purposes
 * @type {createUndirectedGraph}
 * @private
 */
exports._initGraph = initGraph;
exports._createUndirectedGraph = createUndirectedGraph;
exports._initScores = initScores;
exports._getTotalScore = getTotalScore;
exports._computeTextRank = computeTextRank;


/**
 * Generates the tags asynchronously
 * returns a promise
 *
 * @param _id
 * @param content
 * @returns {*}
 */
exports.generateTags = function(content) {

    console.log("Generating tags");

    return {tags: textrank(content, edgeWindowSize, pageRankConstant)};
};
