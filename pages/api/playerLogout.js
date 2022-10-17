import { logout } from "../../lib/db_players";

export default async function handler(req, res) {
	try {
		const socketId = JSON.parse(req.body).socketId;
		await logout(socketId);
		res.status(200).json('ok');
	}catch (error) {
		res.status(500).json({ error:error.message });
	}
}