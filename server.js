var express = require('express'),
    app = express();

app.use('/', express.static('public', {
    index: "index.html"
}));
app.use('/static', express.static('static'));

var server = app.listen(3000, function() {
    var port = server.address().port;
    console.log('TrellBan listening at port:%s', port);
});
