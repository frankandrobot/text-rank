var textrank = require('../lib/textrank'),
    filter = require('../lib/filter-en'),
    _ = require('underscore');

function round(value, decimals) {

    return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
}


describe("textrank", function () {

    describe("graphing", function() {

        var content = "first second third",
            wordList,

            stripGraphInfoOnNeighbors = function (rslt) {

                return _.map(rslt, function (wordNode) {

                    var neighbors = stripGraphInfo(wordNode.neighbors);

                    return {
                        word: wordNode.word,
                        neighbors: neighbors
                    };
                });
            },

            stripGraphInfo = function(rslt) {

                return _.pluck(rslt, 'word');
            };


        beforeEach(function () {

            wordList = filter.filter(content);
        });


        it("should init graph", function () {

            var graph = {};

            textrank._initGraph(graph, wordList);

            var rslt = stripGraphInfo(graph);

            expect(rslt).toEqual([
                "first",
                "second",
                "third"
            ])
        });


        it("should create graph", function () {

            var rslt = textrank._createUndirectedGraph(wordList, 1);

            rslt = stripGraphInfoOnNeighbors(rslt);

            expect(rslt).toEqual([
                {
                    word: 'first',
                    neighbors: ['second']
                },
                {
                    word: 'second',
                    neighbors: ['first', 'third']
                },
                {
                    word: 'third',
                    neighbors: ['second']
                }
            ]);
        });
    });


    describe("score", function() {

        var scores = {},

            createUndirectedWordGraph = function(words) {

                var graph = {};

                _.each(words, function(word) {

                    graph[word] = { word: word, neighbors: [] }
                });

                return graph;
            },

            addEdge = function(graph, a, b) {

                graph[a].neighbors.push(graph[b]);
                graph[b].neighbors.push(graph[a]);
            },

            _round = function(scores, decimal) {

                _.each(scores, function(score, index) {

                    scores[index] = round(score, decimal);
                });
            };

            wordGraph = createUndirectedWordGraph(['waka', 'chuy']);


        beforeEach(function() {

            textrank._initScores(wordGraph, scores);
        });

        it("should init scores correctly", function() {

            expect(scores).toEqual( {
                "waka" : 1,
                "chuy" : 1
            });
        });

        it("should get total scores correctly", function() {

            var rslt = textrank._getTotalScore(scores)

            expect(rslt).toBe(2);

        });

        it("should work on the super-simplest case", function() {

            var nodes = createUndirectedWordGraph(['A', 'B']);

            addEdge(nodes, 'A', 'B');

            var rslt = textrank._computeTextRank(nodes, 0.85);

            expect(rslt).toEqual( {
                'A': 1,
                'B': 1
            });
        });

        it("should work on simple case 1", function() {

            var nodes = createUndirectedWordGraph(['A', 'B', 'C']);

            addEdge(nodes, 'A', 'B');
            addEdge(nodes, 'A', 'C');

            var rslt = textrank._computeTextRank(nodes,.85);

            _round(rslt, 3);

            expect(rslt).toEqual( {
                'A': 1.459,
                'B': 0.770,
                'C': 0.770
            })
        });

        it("should work on simple case 2", function() {

            var nodes = createUndirectedWordGraph(['A', 'B', 'C', 'D', 'E']);

            addEdge(nodes, 'A', 'B');
            addEdge(nodes, 'A', 'C');
            addEdge(nodes, 'A', 'D');
            addEdge(nodes, 'B', 'E');

            var rslt = textrank._computeTextRank(nodes,1);

            _round(rslt, 3);

            expect(rslt).toEqual( {
                "A": 2.625,
                "B": 1.75,
                "C": 0.875,
                "D": 0.875,
                'E': 0.875
            })
        });
    });
});
