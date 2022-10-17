import { getPlayers } from "../../lib/db_players";

/*
 * return 一張撲克牌
 * a=黑桃, b=愛心, c=菱形, d=梅花
 */
export default async function handler(req, res) {
	try {
		const players = await getPlayers();

		res.status(200).json(players);
	} catch (error) {
		res.status(500).json({ error:error.message });
	}
}

