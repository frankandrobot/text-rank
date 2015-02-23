What's TextRank? It's an algorithm that adapts Google's PageRank to auto-magically build a
tag cloud from a text.

# Usage

Add text rank to your `package.json`.

```
 "dependencies": {

    //...

    "text-rank": "git://github.com/frankandrobot/text-rank.git#master"
  }
```

Then just do

```
var textrank = require('text-rank'),

    rslt = textrank.generateTags("Content ...")
```

The result will be a JSON object with a `tags` property containing an array of tags

# Run the tests

```
npm install //you may need to do sudo npm install

jasmin-node tests
```
