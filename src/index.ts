import { createServer } from 'http';
import { Server } from 'socket.io';
import app from './app';
import config from './config';
import { registerSocketEvents } from './events/socket';

const port = config.port;

// app.listen(port, () => {
//     console.log(`Server is running at http://localhost:${port}`);
// });

const httpServer = createServer(app);

const io = new Server(httpServer, {
    cors: {
        origin: '*',
    },
});

registerSocketEvents(io);

httpServer.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
