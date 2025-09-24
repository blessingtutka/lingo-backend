// socket.ts
import { Server, Socket } from 'socket.io';
import * as callService from '../modules/call/call.service';
import { peerService } from '../modules/call/peer.service';

export const registerSocketEvents = (io: Server) => {
    io.on('connection', (socket: Socket) => {
        console.log('User connected:', socket.id);

        socket.on('join', (userId: string) => {
            socket.join(userId);
        });

        socket.on('call-user', async ({ callerId, receiverId }) => {
            const peerId = await peerService.initialize();

            const call = await callService.createCall({
                callerId,
                receiverId,
                startedAt: new Date(),
                endedAt: null,
                peerId,
                status: 'REQUESTING',
            });

            const timeout = setTimeout(async () => {
                const currentCall = await callService.getCall(call.id);
                if (currentCall?.status === 'REQUESTING') {
                    await callService.updateCall(call.id, {
                        status: 'MISSED',
                        endedAt: new Date(),
                    });
                    peerService.cleanup();
                    io.to(callerId).emit('call-missed', { callId: call.id });
                }
            }, 60000);

            peerService.setCallTimeout(call.id, timeout);

            io.to(receiverId).emit('incoming-call', { callerId, callId: call.id, peerId });
        });

        socket.on('accept-call', async ({ callId, receiverId }) => {
            const call = await callService.getCall(callId);
            if (!call || call.receiverId !== receiverId) return;

            peerService.clearCallTimeout(callId);

            await callService.updateCall(callId, { status: 'ONGOING' });

            const receiverPeerId = await peerService.initialize();

            io.to(call.callerId).emit('call-accepted', {
                callerPeerId: call.peerId,
                receiverPeerId,
            });
        });

        socket.on('reject-call', async ({ callId, receiverId }) => {
            const call = await callService.getCall(callId);
            if (!call || call.receiverId !== receiverId) return;

            peerService.clearCallTimeout(callId);

            await callService.updateCall(callId, {
                status: 'REJECTED',
                endedAt: new Date(),
            });

            peerService.cleanup();

            io.to(call.callerId).emit('call-rejected', { callId });
        });

        socket.on('end-call', async ({ callId, userId }) => {
            const call = await callService.getCall(callId);
            if (!call) return;

            if (call.callerId !== userId && call.receiverId !== userId) return;

            await callService.updateCall(callId, {
                endedAt: new Date(),
                status: 'ENDED',
            });

            peerService.cleanup();

            const targetUserId = call.callerId === userId ? call.receiverId : call.callerId;
            io.to(targetUserId).emit('call-ended', { callId });
        });

        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id);
        });
    });
};
