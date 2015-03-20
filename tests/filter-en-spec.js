var filter = require('../lib/filter-en'),
    _ = require('underscore');

describe("filter", function () {

    var transform = function(rslt) {

        var _t = [];

        _.forEach(rslt, function(wordObj) {

            if (wordObj.isIncluded) _t.push(wordObj.word);
        });

        return _t;
    };

    it("should recognize words", function () {

        var content = "Uriel sells seashells",
            rslt = transform(filter.filter(content));

        expect(rslt).toEqual(['uriel', 'seashells']);
    });

    it("should strip out punctuation", function() {

        var content = "Uriel, sometimes, sells seashells. - Yea! +booya (uriel)",
            rslt = transform(filter.filter(content));

        expect(rslt).toEqual(['uriel', 'seashells', 'yea', "booya", 'uriel']);
    });

    it("it should recognize non-standard words", function() {

        var content = "If C++, then ka-pow will.i.am!",
            rslt = transform(filter.filter(content));

        expect(rslt).toEqual(['c++', 'ka-pow', 'will.i.am']);
    });

    it("it should skip http links", function() {

        var content = "Best news http://drudgereport.com",
            rslt = transform(filter.filter(content));

        expect(rslt).toEqual(['best', 'news']);
    });

    it("it should filter non nouns/adjectives", function() {

        var content = "the\n" +
                " ONE DOLLAR AND EIGHTY-SEVEN CENTS. THAT WAS ALL. AND SIXTY CENTS of it was in pennies.\n" +
                " Pennies saved one and two at a time by bulldozing the grocer and\n",
                //" the vegetable man and the butcher until one's cheeks burned with the silent imputation of parsimony that such close dealing implied. Three times Della counted it. One dollar and eighty-seven cents. And the next day would be Christmas.",
            rslt = transform(filter.filter(content));

        expect(rslt).toEqual([
            'one', 'dollar', 'eighty-seven', 'cents', 'sixty', 'cents', 'pennies',
            'pennies', 'one', 'two', 'time', 'grocer'
        ]);
    });
});
