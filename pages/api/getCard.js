import { countCards, getCards, shuffle } from "../../lib/db_cards";
import { goaling } from "../../lib/db_players";

/*
 * return 一張撲克牌
 * a=黑桃, b=愛心, c=菱形, d=梅花
 */
export default async function handler(req, res) {
	try {
		// 牌庫是否有牌？
		var totalCards = await countCards();

		// fail 重新洗牌
		if(totalCards < 1){
			await shuffle();
		}

		// 拿取手牌
		const socketId = JSON.parse(req.body).socketId;
		const card = await getCards(socketId,1);
		const my3edCards = card[0];

		// 射龍門(補牌)
		const myCards = JSON.parse(req.body).myCards;
		let bets = JSON.parse(req.body).bets;
		let bigOrSmall = JSON.parse(req.body).bigOrSmall;
		if(myCards[0].number == myCards[1].number){
			if((bigOrSmall == 'big' && my3edCards.number < myCards[0].number) || (bigOrSmall == 'small' && my3edCards.number > myCards[0].number)){
				bets = -1 * bets;
			}else if(my3edCards.number == myCards[0].number){
				bets = -3 * bets;
			}else if(bigOrSmall === ''){ //正常不回發生
				bets = -1 * bets;
			}
		}else if(myCards[0].number <= my3edCards.number || my3edCards.number <= myCards[1].number){
			if(my3edCards.number == myCards[0].number || myCards[1].number == my3edCards.number){
				bets = -2 * bets;
			}else{
				bets = -1 * bets;
			}
		}

		const baseMoney = JSON.parse(req.body).baseMoney;
		const baseMyMoney = JSON.parse(req.body).baseMyMoney;
		const players = await goaling(socketId, bets, baseMoney, baseMyMoney);

		res.status(200).json({my3edCards: my3edCards, players: players});
	} catch (error) {
		res.status(500).json({ error:error.message });
	}
}

