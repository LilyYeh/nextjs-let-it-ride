import { getPlayers } from "../../lib/db_players";
import { setTotalMoney } from "../../lib/db_banker";

export default async function handler(req, res) {
	try {
		const players = await getPlayers();
		players.sort((a, b) => {
			if(a.money > b.money){
				return -1;
			}else{
				return 1;
			}
		})

		const totalMoney = JSON.parse(req.body).totalMoney;
		const bankerId = players[0].bankerId
		await setTotalMoney(bankerId, totalMoney);

		res.status(200).json(players);
	}catch (error) {
		res.status(500).json({ error:error.message });
	}
}