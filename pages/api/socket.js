import { Server } from 'socket.io';
import { logout, getPlayers } from "../../lib/db_players";

export default function handler(req, res) {
	// It means that socket server was already initialised
	if (res.socket.server.io) {
		console.log("Already set up");
		res.end();
		return;
	}

	const io = new Server(res.socket.server);
	res.socket.server.io = io;

	let playersData;
	io.on('connection', socket => {
		socket.on('disconnect', () => {
			console.log(`${socket.id} disconnect !`);
			async function disconn(){
				await logout(socket.id);
				playersData = await getPlayers();
				socket.broadcast.emit('update-players', playersData);
			}
			disconn();
		});

		socket.on('update-players', playersData => {
			async function getply(){
				//playersData = await getPlayers();
				socket.broadcast.emit('update-players', playersData);
			}
			getply();
		});

		socket.on('set-next-player', playersData => {
			socket.broadcast.emit('set-next-player', playersData);
		});

		socket.on('game-over', rankingData => {
			socket.broadcast.emit('game-over', rankingData);
		});

		socket.on('new-game',  playersData => {
			socket.broadcast.emit('new-game', playersData);
		});

		socket.on('clicked-getCard',  getCardFlag => {
			socket.broadcast.emit('clicked-getCard', getCardFlag);
		});
	});
	res.end();
}