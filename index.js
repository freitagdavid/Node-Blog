const getPort = require('get-port');
const server = require('./server.js');

getPort({ port: 5000 }).then(port =>
    server.listen(port, () => console.log('Serveris listening on port: ', port))
);
