const { PeerServer } = require('peer');

const peerServer = PeerServer({
    port: 9000,
    path: '/lingo-backend',
});

console.log('✅ PeerJS server running at http://localhost:9000/myapp');
