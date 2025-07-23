import Peer from 'peerjs';

class PeerService {
    private peer: Peer | null = null;
    private peerId: string | null = null;
    private callTimeouts: Record<string, NodeJS.Timeout> = {};

    initialize() {
        this.peer = new Peer({
            host: 'your-peerjs-server.com',
            port: 9000,
            path: '/myapp',
            secure: true,
        });

        return new Promise<string>((resolve, reject) => {
            this.peer?.on('open', (id) => {
                this.peerId = id;
                resolve(id);
            });

            this.peer?.on('error', (error) => {
                reject(error);
            });
        });
    }

    getPeer() {
        return this.peer;
    }

    getPeerId() {
        return this.peerId;
    }

    cleanup() {
        if (this.peer) {
            this.peer.destroy();
            this.peer = null;
            this.peerId = null;
        }
    }

    setCallTimeout(callId: string, timeout: NodeJS.Timeout) {
        this.callTimeouts[callId] = timeout;
    }

    clearCallTimeout(callId: string) {
        if (this.callTimeouts[callId]) {
            clearTimeout(this.callTimeouts[callId]);
            delete this.callTimeouts[callId];
        }
    }
}

export const peerService = new PeerService();
