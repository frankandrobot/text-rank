var textrank = require('./textrank');


var id = 0,
    results = {},
    STATUS_WAIT = "processing",
    STATUS_OK = "ok";


/**
 * currently NOT multi-thread safe
 * @param content
 */
var generateId = function(content) {

    return id++;
};


exports.startTagging = function(req, res) {

    var content = req.body.content,
        _id = generateId(content);

/*    console.log("Starting to tag content with id "+_id);

    results._id = {
        status: STATUS_WAIT,
        data: ""
    };

    textrank.generateTags(content).then(function(rslt) {

        results._id = {
            status: STATUS_OK,
            data: rslt
        };

        console.log("Finished tagging. Tags are "+rslt);
    });

    res.send({cid: _id});
    */

    res.send(textrank.generateTags(content));
};


exports.getResults = function(req, res) {

    var id = req.params.id;

    res.send(results.id);
};