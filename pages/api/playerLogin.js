import { countPlayers, createPlayer, getPlayers } from "../../lib/db_players";
import { createBanker, getBanker } from "../../lib/db_banker";

export default async function handler(req, res) {
	try {
		const socketId = JSON.parse(req.body).socketId;
		const baseMoney = JSON.parse(req.body).baseMoney;
		const baseMyMoney = JSON.parse(req.body).baseMyMoney;
		let totalPlayers = await countPlayers();

		let isCurrentPlayer = 0;
		if(totalPlayers === 0) {
			isCurrentPlayer = 1;
			// 建立莊家
			await createBanker();
		}

		const banker = await getBanker();
		//ranking 狀態
		let bankerId = 0;
		if(banker.length !== 0){
			bankerId = banker[0].id;
		}

		const playerData = {
			socketId: socketId,
			isCurrentPlayer: isCurrentPlayer,
			money: baseMyMoney-baseMoney,
			bankerId: bankerId
		}

		await createPlayer(playerData);

		if(banker.length == 0){
			res.status(200).json(false);
			return false;
		}

		const players = await getPlayers();
		res.status(200).json(players);
	}catch (error) {
		res.status(500).json({ error:error.message });
	}
}