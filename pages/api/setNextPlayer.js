import { setNextPlayer } from "../../lib/db_players";

export default async function handler(req, res) {
	try {
		const socketId = JSON.parse(req.body).socketId;
		let currentPlayerId = await setNextPlayer(socketId);
		res.status(200).json(currentPlayerId);
	}catch (error) {
		res.status(500).json({ error:error.message });
	}
}