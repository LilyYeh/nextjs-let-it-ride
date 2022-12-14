import { setKeepGoing } from "../../lib/db_players";

export default async function handler(req, res) {
	try {
		const baseMoney = JSON.parse(req.body).baseMoney;
		const players = await setKeepGoing(baseMoney);
		res.status(200).json(players);
	}catch (error) {
		res.status(500).json({ error:error.message });
	}
}