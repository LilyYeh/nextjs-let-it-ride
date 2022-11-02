import Head from 'next/head';
import styles from './index.module.scss';
import pocker from './pocker.module.scss';
import { useEffect, useState } from 'react';
import useRate from "./useRate";
import PlayerMoney from './playerMoney';
import PlayerRanking from './playerRanking';
import io from "socket.io-client";
let socket;

export default function Home() {
	const [ socketId, setSocketId ] = useState('');
	const [ myId, setMyId ] = useState(0);
	const [ players, setPlayers ] = useState([]);
	const [ playersMoney, setPlayersMoney ] = useState([]);
	const [ currentPlayer, setCurrentPlayer ] = useState(0);
	const [ isMyTurn, setMyTurn ] = useState(false);
	const [ minPrivateMoney, setMinPrivateMoney ] = useState(0);
	const [ maxPrivateMoney, setMaxPrivateMoney ] = useState(0);

	//myCards[0]、myCards[1] 龍柱
	const defaultMyCards = [{"number":0,"type":"","imgName":"back"},{"number":0,"type":"","imgName":"back"}]
	const [ myCards, setMyCard ] = useState(defaultMyCards);
	const [ my3edCards, set3edCard ] = useState({});

	const baseMoney = 10;
	const baseMyMoney = 1000;
	const [ inputBets, setInputBets ] = useState(0);
	const [ buttonBets, setButtonBets ] = useState(0);
	const [ bets, setBets ] = useState(0);
	const [ bigOrSmall, setBigOrSmall ] = useState('');
	const [ myMoney, setMyMoney ] = useState(baseMyMoney);
	const [ totalMoney, setTotalMoney ] = useState(0);
	const [ isAnyPlayerCanPlay, setIsAnyPlayerCanPlay ] = useState(false);
	const [ isAnyPlayerCantPlay, setIsAnyPlayerCantPlay ] = useState(false);

	const [ ranking, setRanking ] = useState([]);
	const [ getCardFlag, setClickedGetCard ] = useState(false);
	const [ isNavOpen, setNavOpen ] = useState(false);

	async function dealCards(e) {
		// 人物表情 Default
		setClickedGetCard(false);
		socket.emit('clicked-getCard',false);

		e.target.disabled = true;
		const apiUrlEndpoint = `/api/dealCards`;
		const getData = {
			method: "POST",
			header: { "Content-Type": "application/json" },
			body: JSON.stringify({
				socketId: socketId,
				baseMyMoney: baseMyMoney,
				baseMoney: baseMoney,
				players: players
			})
		}
		const response = await fetch(apiUrlEndpoint, getData);
		const res = await response.json();
		setMyCard(res.data.cards);
		set3edCard({});
		setPlayers(res.data.players);
		socket.emit('update-players', res.data.players);
	}

	async function getCard(e) {
		// 人物表情變換
		setClickedGetCard(true);
		socket.emit('clicked-getCard',true);

		e.target.disabled = true;
		const apiUrlEndpoint = `/api/getCard`;
		const getData = {
			method: "POST",
			header: { "Content-Type": "application/json" },
			body: JSON.stringify({
				socketId: socketId,
				myCards: myCards,
				bets: bets,
				bigOrSmall: bigOrSmall
			})
		}
		const response = await fetch(apiUrlEndpoint, getData);
		const res = await response.json();
		set3edCard(res.my3edCards);
		setPlayers(res.players);
		socket.emit('set-next-player', res.players);
	}

	async function nextPlayer(e) {
		e.target.disabled = true;
		const apiUrlEndpoint = `/api/setNextPlayer`;
		const getData = {
			method: "POST",
			header: { "Content-Type": "application/json" },
			body: JSON.stringify({
				socketId: socketId
			})
		}
		const response = await fetch(apiUrlEndpoint, getData);
		const res = await response.json();
		socket.emit('set-next-player', res);
		setDefault(res);
	}

	async function playerLogin() {
		const apiUrlEndpoint = `/api/playerLogin`;
		const getData = {
			method: "POST",
			header: { "Content-Type": "application/json" },
			body: JSON.stringify({
				socketId: socketId,
				baseMoney: baseMoney,
				baseMyMoney: baseMyMoney
			})
		}
		const response = await fetch(apiUrlEndpoint, getData);
		const res = await response.json();
		if(!res) {
			displayBlock('waiting');
		}else{
			displayBlock('game');
			setPlayers(res);
			socket.emit('update-players',res);
		}
	}

	async function onChangeInputBets(value) {
		let input = 0;
		if(value=='+'){
			if(buttonBets){
				input = inputBets + buttonBets;
			}else{
				input = bets+10;
			}
		}else if(value=='-'){
			if(buttonBets){
				//input = inputBets - buttonBets;
				input = inputBets - 10;
			}else{
				input = bets-10;
			}
		}
		const myBets = await checkBets(input);
		setInputBets(myBets);
		setBets(myBets);
	}

	async function onChangeButtonBets(value) {
		const myBets = await checkBets(value);
		if(myBets == value) {
			setButtonBets(value);
			setInputBets(value);
			setBets(value);
		}
	}

	function checkBets(value) {
		let maxBets = Math.floor(myMoney / 2);
		if(myCards[0].number == myCards[1].number){
			maxBets = Math.floor(myMoney / 3);
		}
		if(value > totalMoney) {
			//alert('最多可下注 $'+totalMoney);
			return totalMoney;

		}else if(value > maxBets) {
			let mB = Math.floor(maxBets/10) * 10;
			//alert('沒錢了(ಥ﹏ಥ) 最多可下注 $'+mB);
			return mB;
		}else if(value <= 0) {
			return 0;
		}
		return value;
	}

	async function socketInitializer() {
		await fetch('/api/socket');
		socket = io();

		socket.on('connect', () => {
			setSocketId(socket.id);
		});

		socket.on('update-players', playersData => {
			setPlayers(playersData);
		});

		socket.on('set-next-player', playersData => {
			setDefault(playersData);
		});

		socket.on('game-over', rankingData => {
			setRanking(rankingData);
		});

		socket.on('new-game', playersData => {
			setDefault(playersData);
		});

		socket.on('clicked-getCard', getCardFlag => {
			setClickedGetCard(getCardFlag);
		});
	}

	async function gameOver(e) {
		const apiUrlEndpoint = `/api/gameOver`;
		const getData = {
			method: "POST",
			header: { "Content-Type": "application/json" },
			body: JSON.stringify({
				totalMoney: totalMoney
			})
		}
		const response = await fetch(apiUrlEndpoint, getData);
		const res = await response.json();
		setRanking(res);
		socket.emit('game-over',res);
	}

	async function newGame(e) {
		// 人物表情 Default
		setClickedGetCard(false);
		socket.emit('clicked-getCard',false);

		const apiUrlEndpoint = `/api/newGame`;
		const getData = {
			method: "POST",
			header: { "Content-Type": "application/json" },
			body: JSON.stringify({
				baseMoney: baseMoney,
				baseMyMoney: baseMyMoney,
				totalMoney: totalMoney
			})
		}
		const response = await fetch(apiUrlEndpoint, getData);
		const res = await response.json();
		setDefault(res)
		socket.emit('new-game',res);
	}

	function setDefault(playersData) {
		setPlayers(playersData);
		setMyCard(defaultMyCards);
		set3edCard({});
		setBets(0);
		setInputBets(0);
		setButtonBets(0);
		setNavOpen(false);
		displayBlock('game');
	}

	function displayBlock(value) {
		document.getElementById(styles['game']).style.display = "none";
		document.getElementById(styles['gameOver']).style.display = "none";
		document.getElementById(styles['waiting']).style.display = "none";
		document.getElementById(styles[value]).style.display = "block";
	}

	useEffect(()=>{
		socketInitializer();
	},[]);

	useEffect(()=>{
		async function f(){
			if(socketId!==''){
				await playerLogin();
			}
		}
		f();
	},[socketId]);

	useEffect(()=>{
		let playersMoney = [];
		let playersGroup = [];
		let baseAllMoney = players.length * baseMyMoney;
		let totalPlayersMoney = 0;
		let canPlay = false;
		let someoneCantPlay = false;
		let minMoney = 9999;
		let maxMoney = 0;
		let minMoneyPlayer = 0;
		let maxMoneyPlayer = 0;
		players.forEach((player,index)=>{
			if(player.money >= 20){
				//還有人有錢
				canPlay = true;
			}
			if(player.money < 30){
				//有人沒錢了
				someoneCantPlay = true;
			}
			//剩餘錢最少的玩家
			if(player.money < minMoney){
				minMoney = player.money;
				minMoneyPlayer = player.playerId;
			}
			//剩餘錢最多的玩家
			if(player.money > maxMoney){
				maxMoney = player.money;
				maxMoneyPlayer = player.playerId;
			}
			totalPlayersMoney += player.money;
			let playerName = '';
			if(player.socketId == socketId){
				setMyId(player.playerId);
				setMyMoney(player.money);
				playerName = 'isMe';
			}
			if(player.isCurrentPlayer){
				setCurrentPlayer(player.playerId)
			}
			playersGroup[player.playerId] = {name:playerName, playerId:player.playerId, money:player.money};
			if(player.rowNum % 2 == 0){
				playersMoney.push(playersGroup);
				playersGroup = [];
			}
		});
		if(playersGroup.length > 0){
			playersMoney.push(playersGroup);
		}
		if(maxMoney > minMoney) {
			setMinPrivateMoney(minMoneyPlayer);
			setMaxPrivateMoney(maxMoneyPlayer);
		}else{
			setMinPrivateMoney(0);
			setMaxPrivateMoney(0);
		}
		setPlayersMoney(playersMoney);
		setTotalMoney(baseAllMoney - totalPlayersMoney);
		setIsAnyPlayerCanPlay(canPlay);
		setIsAnyPlayerCantPlay(someoneCantPlay);
	},[players]);

	useEffect(()=>{
		if(currentPlayer == myId){
			setMyTurn(true);
		}else{
			setMyTurn(false);
		}
	},[currentPlayer,myId]);

	useEffect(()=>{
		if(myCards[0].number>0 && myCards[0].number == myCards[1].number){
			if(myCards[0].number >= 7){
				setBigOrSmall('small');
			}else{
				setBigOrSmall('big');
			}
		}else{
			setBigOrSmall('');
		}
	},[myCards]);

	useEffect(()=>{
		if(ranking.length > 0){
			displayBlock('gameOver')
			document.getElementsByClassName(styles['newGame'])[0].disabled = false;
		}
	},[ranking]);

	let the3edCardDev = <>
		<button className={'btn '+'btn-red-outline '+styles.shoot} onClick={getCard} disabled={!isMyTurn || !myCards[0].number || bets<=0 || totalMoney <=0}>射</button>
		<button className={'btn '+'btn-black-outline '+styles.pass} onClick={nextPlayer} disabled={!isMyTurn || !myCards[0].number || totalMoney <=0}>pass</button>
	</>;
	if(my3edCards.imgName) {
		the3edCardDev = '';
	}

	let theDealCardDev = <>
		<button className={'btn '+'btn-red-outline '+styles.deal} onClick={dealCards} disabled={!isMyTurn || myCards[0].number}>重新發牌</button>
	</>
	if(!isAnyPlayerCanPlay){
		theDealCardDev = <button className={'btn '+'btn-black-outline '+styles.endGame} onClick={gameOver}>遊戲結束</button>;
	}else if(myMoney<=0 && isMyTurn){
		theDealCardDev = <button className={'btn '+'btn-black-outline '+styles.pass} onClick={nextPlayer} disabled={false}>pass</button>;
	}

	return (
		<>
			<Head>
				<meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1.0, maximum-scale=1.0" />
				<title>射龍門</title>
			</Head>
			<div className={styles.mainContent} id={styles.game}>
				<h1 className={styles.h1}></h1>
				<div className={styles.publicMoney}>${useRate(totalMoney)}</div>
				<div className={styles.myGameBoard}>
					<div className={styles.gameBoard}>
						<div className={`${styles.card1} ${pocker['bg-'+myCards[0].imgName]}`}></div>
						<div className={`${styles.card3} ${my3edCards.imgName ? pocker['bg-'+my3edCards.imgName] : ''}`}>{the3edCardDev}</div>
						<div className={`${styles.card1} ${pocker['bg-'+myCards[1].imgName]}`}></div>
					</div>
					<div className={styles.bets+(myCards[0].number? " "+styles.active : "")}>
						<label className={styles.title}>下注</label>
						<div className={styles.bigOrSmallArea+(myCards[0].number==myCards[1].number? " "+styles.active : "")}>
							<span className={styles.inputRadio} onClick={(e) => setBigOrSmall('big')}>
								<input type="radio" name="bigOrSmall" value="big" onChange={(e) => setBigOrSmall('big')} checked={bigOrSmall=='big'} />大
							</span>
							<span className={styles.inputRadio} onClick={(e) => setBigOrSmall('small')}>
								<input type="radio" name="bigOrSmall" value="small" onChange={(e) => setBigOrSmall('small')} checked={bigOrSmall=='small'} />小
							</span>
						</div>
						<div className={styles.coin+(inputBets==10? " "+styles.active : "")} onClick={() => onChangeButtonBets(10)}>$10</div>
						<div className={styles.coin+(inputBets==30? " "+styles.active : "")} onClick={() => onChangeButtonBets(30)}>$30</div>
						<div className={styles.coin+(inputBets==50? " "+styles.active : "")} onClick={() => onChangeButtonBets(50)}>$50</div>
						<div className={styles.inputCoin+" "+(bets && bets==inputBets? styles.active : "")}>
							<button className={styles.minus} onClick={() => onChangeInputBets('-')}>–</button>
							<input type="text" value={`$${inputBets}`} onChange={onChangeInputBets}/>
							<button className={styles.plus} onClick={() => onChangeInputBets('+')}>+</button>
						</div>
					</div>
					<div className={styles.dealCards}>
						{theDealCardDev}
					</div>
				</div>
				<div id={styles.menu}>
					<ul className={styles.nav + ' ' + (isNavOpen? styles.active:'')}>
						<li><button className={'btn '+'btn-black-outline '+styles.endGame} onClick={gameOver}>遊戲結束</button></li>
						<li><button className={'btn '+'btn-red-outline '+styles.newGame} onClick={newGame}>重新遊戲</button></li>
					</ul>
					<div className={styles.openNav} onClick={()=>setNavOpen(isNavOpen? false:true)}>{isNavOpen? '✕':'⚛'}︎</div>
					<table className={styles.privateMoney}>
						<tbody>
						{
							playersMoney.map( (groups, index) => {
								return(
									<tr key={index}>
										{
											groups.map((plmny, index) => {
												return (<PlayerMoney key={index}
												                     playerData={plmny}
												                     currentPlayer={currentPlayer}
												                     baseMyMoney={baseMyMoney}
												                     getCardFlag={getCardFlag}
												/>)
											})
										}
									</tr>
								)
							})
						}
						</tbody>
					</table>
				</div>
			</div>
			<div className={styles.mainContent} id={styles['gameOver']}>
				<h1 className={styles.h1}></h1>
				<div className={styles.publicMoney}>${totalMoney}</div>
				<table>
					<thead>
						<tr>
							<th>排名</th>
							<th>玩家</th>
							<th>$$</th>
							<th>勝負</th>
						</tr>
					</thead>
					<tbody>
					{
						ranking.map((rank, index) => {
							return (<PlayerRanking key={index}
						                         ranking={index+1}
							                     playerData={rank}
							                     baseMyMoney={baseMyMoney}
							                     minPrivateMoney={minPrivateMoney}
							                     maxPrivateMoney={maxPrivateMoney}
							/>)
						})
					}
					</tbody>
				</table>
				<button className={'btn '+'btn-red-outline '+styles.newGame} onClick={newGame}>重新遊戲</button>
			</div>
			<div className={styles.mainContent} id={styles.waiting}>
				<h1 className={styles.h1}></h1>
				<div className={styles.waitingText}>遊戲進行中，請稍候</div>
			</div>
		</>
	)
}
