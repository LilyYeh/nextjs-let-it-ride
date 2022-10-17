import { setNewGame } from "../../lib/db_players";

export default async function handler(req, res) {
	try {
		const baseMoney = JSON.parse(req.body).baseMoney;
		const baseMyMoney = JSON.parse(req.body).baseMyMoney;
		const players = await setNewGame(baseMoney, baseMyMoney);
		res.status(200).json(players);
	}catch (error) {
		res.status(500).json({ error:error.message });
	}
}