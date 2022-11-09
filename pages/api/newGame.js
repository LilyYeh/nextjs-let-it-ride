import { getPlayers, setNewGame } from "../../lib/db_players";
import { createBanker, getBanker } from "../../lib/db_banker";

export default async function handler(req, res) {
	try {
		const baseMoney = JSON.parse(req.body).baseMoney;
		const baseMyMoney = JSON.parse(req.body).baseMyMoney;

		// 建立莊家
		await createBanker();
		const banker = await getBanker();
		let bankerId = banker[0].id;

		const data = {bankerId:bankerId, money: baseMyMoney-baseMoney};
		await setNewGame(data)

		const players = await getPlayers();
		res.status(200).json(players);
	}catch (error) {
		res.status(500).json({ error:error.message });
	}
}