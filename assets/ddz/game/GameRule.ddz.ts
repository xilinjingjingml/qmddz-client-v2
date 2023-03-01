export enum ECardPoint {
	P3 = 3,
	P4,
	P5,
	P6,
	P7,
	P8,
	P9,
	P10,
	Pj,
	Pq,
	Pk,
	Pa,
	P2,
	Wang,
	Wang_Big,
}
enum ETypeBomb {
	None,
	Soft,
	Hard
}

interface ICardInfos {
	size: number
	vecCardInfos: { num: number, long: number }[]
}

/**
 * 游戏规则
 */
export namespace GameRule {
	const m_cardPointCount: number[] = [] //牌值的统计
	const m_cardInfo1s: ICardInfos = { size: 1, vecCardInfos: [] } //牌值的统计
	const m_cardInfo2s: ICardInfos = { size: 2, vecCardInfos: [] }
	const m_cardInfo3s: ICardInfos = { size: 3, vecCardInfos: [] }
	const m_cardInfo31s: ICardInfos = { size: 4, vecCardInfos: [] }
	const m_cardInfo32s: ICardInfos = { size: 5, vecCardInfos: [] }
	const m_cardInfo42s: ICardInfos = { size: 6, vecCardInfos: [] } //四带二单
	const m_cardInfo44s: ICardInfos = { size: 8, vecCardInfos: [] } //四带二对
	let m_cards: Iproto_CCard[] = [] //处理的牌
	let m_typeNum: number = -1

	export let m_tipCards: Iproto_CCard[][] = [] //提示牌
	export const m_chooseCardType: Iproto_CCardsType = { mNTypeValue: 0, mNTypeNum: 0, mNTypeBomb: 0 }

	//记录牌型对应的信息
	initCardInfos()

	function initCardInfos() {
		//顺子
		for (let i = 5; i < 13; i++) {
			m_cardInfo1s.vecCardInfos.push({ num: i, long: i })
		}

		const values = []
		//连对
		for (let i = 3; i < 10; i++) {
			values.length = 0
			for (let j = 0; j < i; j++) {
				values.push("2")
			}
			m_cardInfo2s.vecCardInfos.push({ num: parseInt(values.join("")), long: i })
		}
		m_cardInfo2s.vecCardInfos.push({ num: 2000000000, long: 10 })

		//三顺
		for (let i = 1; i < 7; i++) {
			values.length = 0
			for (let j = 0; j < i; j++) {
				values.push("3")
			}
			m_cardInfo3s.vecCardInfos.push({ num: parseInt(values.join("")), long: i })
		}

		//三带一
		for (let i = 1; i < 5; i++) {
			values.length = 0
			for (let j = 0; j < i; j++) {
				values.unshift("3")
				values.push("1")
			}
			m_cardInfo31s.vecCardInfos.push({ num: parseInt(values.join("")), long: i })
		}
		m_cardInfo31s.vecCardInfos.push({ num: 531, long: 5 })

		//三带二
		for (let i = 1; i < 5; i++) {
			values.length = 0
			for (let j = 0; j < i; j++) {
				values.unshift("3")
				values.push("2")
			}
			m_cardInfo32s.vecCardInfos.push({ num: parseInt(values.join("")), long: i })
		}
	}

	export function checkChooseCardsType(cards: Iproto_CCard[], handCards: Iproto_CCard[], cardType: Iproto_CCardsType) {
		m_cards = cards
		m_typeNum = cardType.mNTypeNum
		setChooseCardType(0, 0, 0)

		// 检测牌的完整性
		if (!checkCardsIntact(handCards)) {
			cc.log("[GameRule.checkCardsIntact] 检测牌的完整性 失败")
			return false
		}

		// 检测出牌是否成型
		if (!makeCardsType()) {
			cc.log("[GameRule.checkCardsType] 检测出牌是否成型 失败")
			return false
		}

		// 比较大小
		if (!compareCardsType(cardType)) {
			cc.log("[GameRule checkChooseCards] 比较大小 失败")
			return false
		}

		return true

	}

	// 检测牌的完整性 橙红的话 设置选中牌
	function checkCardsIntact(handCards: Iproto_CCard[]) {
		let cardCount = 0
		for (const card1 of m_cards) {
			for (const card2 of handCards) {
				if (card1.mNValue == card2.mNValue && card1.mNColor == card2.mNColor) {
					cardCount++
				}
			}
		}

		return cardCount == m_cards.length
	}

	// 检测出牌是否成形
	function makeCardsType() {
		countCardsPoint()

		if (m_cards.length == 0) {
			return false
		} else if (m_cards.length == 1) {
			// 单张
			if (checkCardsTypeNum(is1, m_cards.length)) {
				return true
			}
		} else if (m_cards.length == 2) {
			// 火箭
			if (checkCardsTypeNum(isHuoJian, m_cards.length, ETypeBomb.Hard)) {
				return true
			}

			// 对子
			if (checkCardsTypeNum(is2, m_cards.length)) {
				return true
			}
		} else if (m_cards.length == 3) {
			// 三不带
			if (checkCardsTypeNum(is3, m_cards.length)) {
				return true
			}
		} else if (m_cards.length == 4) {
			// 硬炸弹
			if (checkCardsTypeNum(isHardBomb, m_cards.length, ETypeBomb.Hard)) {
				return true
			}
		} else if (m_cards.length == 6) {
			// 四带两单
			if (checkCardsTypeNum(is411, 411)) {
				return true
			}
		} else if (m_cards.length == 8) {
			// 四带两对
			if (checkCardsTypeNum(is422, 422)) {
				return true
			}
		}

		if (m_cards.length >= 5 && m_cards.length <= 12) {
			// 顺子
			if (checkCardsTypeNumInfo(is1s, m_cardInfo1s)) {
				return true
			}
		}
		if (m_cards.length >= 6 && m_cards.length % 2 == 0) {
			// 连对
			if (checkCardsTypeNumInfo(is2s, m_cardInfo2s)) {
				return true
			}
		}

		if (m_cards.length >= 6 && m_cards.length % 3 == 0) {
			// 连对
			if (checkCardsTypeNumInfo(is3s, m_cardInfo3s)) {
				return true
			}
		}
		if (m_cards.length % 4 == 0) {
			// 三带一
			if (checkCardsTypeNumInfo(is31s, m_cardInfo31s)) {
				return true
			}
		}
		if (m_cards.length % 5 == 0) {
			// 三带二
			if (checkCardsTypeNumInfo(is32s, m_cardInfo32s)) {
				return true
			}
		}

		return false
	}

	// 比较大小
	function compareCardsType(cardType: Iproto_CCardsType) {
		// 不出
		if (m_chooseCardType.mNTypeNum == 0) {
			return true
		}

		// 自己出牌
		if (cardType.mNTypeNum == 0) {
			return true
		}

		// 自己火箭
		if (m_chooseCardType.mNTypeBomb == ETypeBomb.Hard && m_chooseCardType.mNTypeValue == ECardPoint.Wang) {
			return true
		}

		// 别人火箭
		if (cardType.mNTypeBomb == ETypeBomb.Hard && cardType.mNTypeValue == ECardPoint.Wang) {
			return false
		}

		if (m_chooseCardType.mNTypeBomb > cardType.mNTypeBomb) {
			// 自己炸弹
			return true
		} else if (m_chooseCardType.mNTypeBomb < cardType.mNTypeBomb) {
			// 别人炸弹
			return false
		} else if (m_chooseCardType.mNTypeNum == cardType.mNTypeNum) {
			// 铜牌性比较大小
			return m_chooseCardType.mNTypeValue > cardType.mNTypeValue
		}

		return false
	}

	// 统计牌值
	function countCardsPoint() {
		for (let i = ECardPoint.P3; i <= ECardPoint.Wang; i++) {
			m_cardPointCount[i] = 0
		}

		for (const card of m_cards) {
			m_cardPointCount[card.mNValue] += 1
		}
	}

	// 设置选中牌的类型
	function setChooseCardType(bomb: ETypeBomb, num: number, value: number) {
		m_chooseCardType.mNTypeBomb = bomb
		m_chooseCardType.mNTypeNum = num
		m_chooseCardType.mNTypeValue = value
	}

	function checkCardsTypeNum(func: () => number, num: number, bomb: ETypeBomb = ETypeBomb.None) {
		if (m_typeNum == 0 || m_typeNum == num || bomb > 0) {
			const value = func()
			if (value) {
				setChooseCardType(bomb, num, value)
				return true
			}
		}
	}

	function checkCardsTypeNumInfo(func: () => number, cardInfos: ICardInfos) {
		const cardInfo = getCardInfoByNum(cardInfos, m_cards.length)
		if (!cardInfo) {
			return
		}

		return checkCardsTypeNum(func, cardInfo.num)
	}

	function getCardInfoByNum(cardInfos: ICardInfos, num: number) {
		for (const cardInfo of cardInfos.vecCardInfos) {
			if (cardInfo.long * cardInfos.size == num) {
				return cardInfo
			}
		}

		cc.warn("[GameRule.getCardInfoByNum]", cardInfos.size, num)
	}

	function is1() {
		const value = m_cards[0].mNValue
		if (value == ECardPoint.Wang) {
			return value + m_cards[0].mNColor
		}
		return value
	}

	function isHuoJian() {
		if (m_cardPointCount[ECardPoint.Wang] == 2) {
			return ECardPoint.Wang
		}
	}

	function is2() {
		return isSame(2)
	}

	function is3() {
		return isSame(3)
	}

	function isHardBomb() {
		return isSame(4)
	}

	function isSame(same: number) {
		const value = m_cards[0].mNValue
		if (m_cardPointCount[value] == same) {
			return value
		}
	}

	function is1s() {
		return isSeries(1)
	}

	function is2s() {
		return isSeries(2)
	}

	function is3s() {
		return isSeries(3)
	}

	function isSeries(same: number) {
		if (m_cardPointCount[ECardPoint.P2] > 0 || m_cardPointCount[ECardPoint.Wang] > 0) {
			return
		}

		const long = m_cards.length / same
		for (let i = ECardPoint.P2 - long; i >= ECardPoint.P3; i--) {
			if (checkSeries(i, long, same)) {
				return i
			}
		}
	}

	function checkSeries(point: number, long: number, same: number) {
		if (long <= 0) {
			return true
		}

		if (m_cardPointCount[point] >= same) {
			return checkSeries(point + 1, long - 1, same)
		}
	}

	function is411() {
		for (let i = ECardPoint.P2; i >= ECardPoint.P3; i--) {
			if (m_cardPointCount[i] == 4) {
				return i
			}
		}
	}

	function is422() {
		if (m_cardPointCount[ECardPoint.Wang] > 0) {
			return
		}
		for (let i = ECardPoint.P2; i >= ECardPoint.P3; i--) {
			if (m_cardPointCount[i] == 4) {
				if (count2(i, 1) == 2) {
					return i
				}
			}
		}
	}

	function is31s() {
		const long = m_cards.length / m_cardInfo31s.size
		const maxValue = long > 1 ? ECardPoint.P2 - long : ECardPoint.P2

		for (let i = maxValue; i >= ECardPoint.P3; i--) {
			if (checkSeries(i, long, 3)) {
				return i
			}
		}
	}

	function is32s() {
		if (m_cardPointCount[ECardPoint.Wang] > 0) {
			return
		}

		const long = m_cards.length / m_cardInfo32s.size
		const maxValue = long > 1 ? ECardPoint.P2 - long : ECardPoint.P2

		for (let i = maxValue; i >= ECardPoint.P3; i--) {
			if (checkSeries(i, long, 3)) {
				if (count2(i, long) == long) {
					return i
				}
			}
		}
	}

	function count2(value: number, long: number) {
		let num = 0
		for (let i = ECardPoint.P2; i >= ECardPoint.P3; i--) {
			if (i >= value && i < value + long) {
				continue
			}

			if (m_cardPointCount[i] > 0 && m_cardPointCount[i] % 2 == 0) {
				num += m_cardPointCount[i] / 2
			}
		}

		return num
	}

	export function checkCardsType(cards: Iproto_CCard[]) {
		m_cards = cards
		m_typeNum = 0
		return makeCardsType()
	}

	// 提示 自主出牌
	export function tipsAuto(cards: Iproto_CCard[]) {
		m_cards = cards
		m_tipCards = []
		if (cards.length == 0) {
			return
		}

		countCardsPoint()

		const value = m_cards[0].mNValue
		if (m_cardPointCount[value] == m_cards.length) {
			addTipsGroup(m_cards.length, value)
		}

		//从单张牌开始提示
		for (let i = 1; i <= 4; i++) {
			for (let j = ECardPoint.P3; j <= ECardPoint.Wang; j++) {
				if (m_cardPointCount[j] == i && (j != ECardPoint.Wang || i == 1)) {
					addTipsGroup(i, j)
				}
			}
		}

		//2个王
		if (m_cardPointCount[ECardPoint.Wang] == 2) {
			addTipsGroup(2, ECardPoint.Wang)
		}
	}

	// 提示出牌
	export function tips(cards: Iproto_CCard[], cardType: Iproto_CCardsType) {
		m_cards = cards
		m_tipCards = []

		countCardsPoint()

		if (cardType.mNTypeBomb == ETypeBomb.None) {
			const typeNum = cardType.mNTypeNum
			if (typeNum == 1) {
				if (m_cards.length >= 1) {
					tipsSearch1(cardType)
				}
			} else if (typeNum == 2) {
				if (m_cards.length >= 2) {
					tipsSearch2(cardType)
				}
			} else if (typeNum == 3) {
				if (m_cards.length >= 3) {
					tipsSearch3(cardType)
				}
			} else if (typeNum == 411) {
				if (m_cards.length >= 6) {
					tipsSearch411(cardType)
				}
			} else if (typeNum == 422) {
				if (m_cards.length >= 8) {
					tipsSearch422(cardType)
				}
			} else if (tipsSearchCardInfo(m_cardInfo1s, tipsSearch1s, cardType)) {

			} else if (tipsSearchCardInfo(m_cardInfo2s, tipsSearch2s, cardType)) {

			} else if (tipsSearchCardInfo(m_cardInfo3s, tipsSearch3s, cardType)) {

			} else if (tipsSearchCardInfo(m_cardInfo31s, tipsSearch31s, cardType)) {

			} else if (tipsSearchCardInfo(m_cardInfo32s, tipsSearch32s, cardType)) {

			}
		}

		// 去除含有炸弹的牌型
		let tipCards: Iproto_CCard[][] = []
		for (let i = m_tipCards.length - 1; i >= 0; i--) {
			const cards = m_tipCards[i]
			for (const card of cards) {
				if (m_cardPointCount[card.mNValue] == 4 || card.mNValue == ECardPoint.Wang && m_cardPointCount[card.mNValue] == 2) {
					tipCards.push(cards)
					m_tipCards.splice(i, 1)
					break
				}
			}
		}

		tipsSearchBomb(cardType)

		if (tipCards.length > 0) {
			m_tipCards = m_tipCards.concat(tipCards)
		}
	}

	function addTipsGroup(num: number, value: number, tipCards?: Iproto_CCard[][]) {
		tipCards = tipCards || m_tipCards

		const vecCards = []
		addTipsCards(vecCards, num, value)
		tipCards.push(vecCards)
	}

	function addTipsCards(cards: Iproto_CCard[], num: number, value: number) {
		for (let i = 0; i < num; i++) {
			cards.push({
				mNValue: value,
				mNColor: -1,
				mNCard_Baovalue: -1
			})
		}
	}

	function tipsSearch1(cardType: Iproto_CCardsType) {
		if (cardType.mNTypeValue == ECardPoint.Wang) {
			if (m_cardPointCount[ECardPoint.Wang] == 1) {
				for (let i = 0; i < m_cards.length; i++) {
					if (m_cards[i].mNValue == ECardPoint.Wang) {
						if (m_cards[i].mNColor == 1) {
							addTipsGroup(1, ECardPoint.Wang)
						}
						return
					}
				}
			}

			return
		}

		tipsSearchSame(cardType, 1)
	}

	function tipsSearch2(cardType: Iproto_CCardsType) {
		tipsSearchSame(cardType, 2)
	}

	function tipsSearch3(cardType: Iproto_CCardsType) {
		tipsSearchSame(cardType, 3)
	}

	function tipsSearchSame(cardType: Iproto_CCardsType, same: number) {
		const tempTipsCards = []

		const maxValue = (same == 1) ? ECardPoint.Wang_Big : ECardPoint.Wang
		for (let i = cardType.mNTypeValue + 1; i < maxValue; i++) {
			if (m_cardPointCount[i] == same) {
				addTipsGroup(same, i)
			} else if (m_cardPointCount[i] > same && m_cardPointCount[i] < 4) {
				addTipsGroup(same, i, tempTipsCards)
			}
		}

		m_tipCards = m_tipCards.concat(tempTipsCards)
	}

	function tipsSearch411(cardType: Iproto_CCardsType) {
		for (let i = cardType.mNTypeValue + 1; i < ECardPoint.Wang; i++) {
			if (m_cardPointCount[i] < 4) {
				continue
			}

			const cards = []
			addTipsCards(cards, 4, i)

			//找单张
			let count = 2
			for (let j = ECardPoint.P3; j <= ECardPoint.Wang; j++) {
				if (i == j) {
					continue
				}

				if (m_cardPointCount[j] >= 1) {
					const num = Math.min(m_cardPointCount[j], count)
					addTipsCards(cards, num, j)
					count -= num
				}

				if (count <= 0) {
					m_tipCards.push(cards)
					break
				}
			}
		}
	}

	function tipsSearch422(cardType: Iproto_CCardsType) {
		for (let i = cardType.mNTypeValue + 1; i < ECardPoint.Wang; i++) {
			if (m_cardPointCount[i] < 4) {
				continue
			}

			const cards = []
			addTipsCards(cards, 4, i)

			//找对子
			let count = 2
			for (let j = ECardPoint.P3; j < ECardPoint.Wang; j++) {
				if (i == j) {
					continue
				}

				if (m_cardPointCount[j] >= 2) {
					const num = Math.min(Math.floor(m_cardPointCount[j] / 2), count)
					addTipsCards(cards, num * 2, j)
					count -= num
				}

				if (count <= 0) {
					m_tipCards.push(cards)
					break
				}
			}
		}
	}

	function tipsSearchCardInfo(cardInfos: ICardInfos, func: (cardType: Iproto_CCardsType, long: number) => void, cardType: Iproto_CCardsType) {
		const cardInfo = getCardInfoByTypeNum(cardInfos, cardType.mNTypeNum)
		if (!cardInfo) {
			return false
		}

		if (m_cards.length >= cardInfo.long * cardInfos.size) {
			func(cardType, cardInfo.long)
		}
		return true
	}

	function getCardInfoByTypeNum(cardInfos: ICardInfos, typeNum: number) {
		for (const cardInfo of cardInfos.vecCardInfos) {
			if (cardInfo.num == typeNum) {
				return cardInfo
			}
		}
	}

	function tipsSearch1s(cardType: Iproto_CCardsType, long: number) {
		tipsSearchSeries(cardType, 1, long)
	}

	function tipsSearch2s(cardType: Iproto_CCardsType, long: number) {
		tipsSearchSeries(cardType, 2, long)
	}

	function tipsSearch3s(cardType: Iproto_CCardsType, long: number) {
		tipsSearchSeries(cardType, 3, long)
	}

	function tipsSearchSeries(cardType: Iproto_CCardsType, same: number, long: number) {
		for (let i = cardType.mNTypeValue + 1; i < ECardPoint.Wang - long; i++) {
			let find = true
			for (let j = 0; j < long; j++) {
				if (m_cardPointCount[i + j] < same) {
					find = false
					break
				}
			}

			if (!find) {
				continue
			}

			const cards = []
			for (let j = 0; j < long; j++) {
				addTipsCards(cards, same, i + j)
			}
			m_tipCards.push(cards)
		}
	}

	function tipsSearch31s(cardType: Iproto_CCardsType, long: number) {
		let maxValue = long == 1 ? ECardPoint.Wang : ECardPoint.Wang - long
		for (let i = cardType.mNTypeValue + 1; i < maxValue; i++) {
			let find = true
			for (let j = 0; j < long; ++j) {
				if (m_cardPointCount[i + j] < 3) {
					find = false
					break
				}
			}
			if (!find) {
				continue
			}

			const cards = []
			for (let j = 0; j < long; ++j) {
				addTipsCards(cards, 3, i + j)
			}

			//找单张
			let count = long
			find = false
			for (let j = ECardPoint.P3; j <= ECardPoint.Wang; j++) {
				if (j >= i && j < i + long) {
					continue
				}

				if (m_cardPointCount[j] == 1) {
					const num = Math.min(m_cardPointCount[j], count)
					addTipsCards(cards, num, j)
					count -= num
				}

				if (count <= 0) {
					m_tipCards.push(cards)
					find = true
					break
				}
			}

			if (find) {
				continue
			}

			for (let j = ECardPoint.P3; j <= ECardPoint.Wang; j++) {
				if (j >= i && j < i + long) {
					continue
				}

				if (m_cardPointCount[j] > 1) {
					const num = Math.min(m_cardPointCount[j], count)
					addTipsCards(cards, num, j)
					count -= num
				}

				if (count <= 0) {
					m_tipCards.push(cards)
					break
				}
			}
		}
	}

	function tipsSearch32s(cardType: Iproto_CCardsType, long: number) {
		let maxValue = long == 1 ? ECardPoint.Wang : ECardPoint.Wang - long
		for (let i = cardType.mNTypeValue + 1; i < maxValue; i++) {
			let find = true
			for (let j = 0; j < long; ++j) {
				if (m_cardPointCount[i + j] < 3) {
					find = false
					break
				}
			}
			if (!find) {
				continue
			}

			const cards = []
			for (let j = 0; j < long; ++j) {
				addTipsCards(cards, 3, i + j)
			}

			//找对子
			let count = long
			find = false
			for (let j = ECardPoint.P3; j < ECardPoint.Wang; j++) {
				if (i == j) {
					continue
				}

				if (m_cardPointCount[j] == 2) {
					const num = Math.min(Math.floor(m_cardPointCount[j] / 2), count)
					addTipsCards(cards, num * 2, j)
					count -= num
				}

				if (count <= 0) {
					m_tipCards.push(cards)
					find = true
					break
				}
			}

			if (find) {
				continue
			}

			for (let j = ECardPoint.P3; j < ECardPoint.Wang; j++) {
				if (j >= i && j < i + long) {
					continue
				}

				if (m_cardPointCount[j] > 2) {
					const num = Math.min(Math.floor(m_cardPointCount[j] / 2), count)
					addTipsCards(cards, num * 2, j)
					count -= num
				}

				if (count <= 0) {
					m_tipCards.push(cards)
					break
				}
			}
		}
	}

	function tipsSearchBomb(cardType: Iproto_CCardsType) {
		//硬炸弹
		const value = (cardType.mNTypeBomb == 0) ? ECardPoint.P3 : cardType.mNTypeValue + 1
		for (let i = value; i < ECardPoint.Wang; i++) {
			if (m_cardPointCount[i] == 4) {
				addTipsGroup(4, i)
			}
		}

		//火箭
		if (m_cardPointCount[ECardPoint.Wang] == 2) {
			addTipsGroup(2, ECardPoint.Wang)
		}
	}

	//检测顺子
	export function checkShunZi(typeNum: number) {
		const cardInfo = getCardInfoByTypeNum(m_cardInfo1s, typeNum)
		if (!cardInfo) {
			return false
		}

		return true
	}

	//检测顺子
	export function checkLianDui(typeNum: number) {
		const cardInfo = getCardInfoByTypeNum(m_cardInfo2s, typeNum)
		if (!cardInfo) {
			return false
		}

		return true
	}

	//检测飞机
	export function checkFeiJi(typeNum: number) {
		let cardInfo = getCardInfoByTypeNum(m_cardInfo3s, typeNum)
		if (cardInfo && cardInfo.long > 1) {
			return true
		}

		cardInfo = getCardInfoByTypeNum(m_cardInfo31s, typeNum)
		if (cardInfo && cardInfo.long > 1) {
			return true
		}

		cardInfo = getCardInfoByTypeNum(m_cardInfo32s, typeNum)
		if (cardInfo && cardInfo.long > 1) {
			return true
		}

		return false
	}

	//检测三带一
	export function checkSanDai_1(typeNum: number) {
		// let cardInfo = getCardInfoByTypeNum(m_cardInfo3s, typeNum)
		// if (cardInfo && cardInfo.long == 1) {
		// 	return true
		// }

		let cardInfo = getCardInfoByTypeNum(m_cardInfo31s, typeNum)
		if (cardInfo && cardInfo.long == 1) {
			return true
		}

		// cardInfo = getCardInfoByTypeNum(m_cardInfo32s, typeNum)
		// if (cardInfo && cardInfo.long == 1) {
		// 	return true
		// }

		return false
	}

	//检测三带二
	export function checkSanDai_2(typeNum: number) {
		// let cardInfo = getCardInfoByTypeNum(m_cardInfo3s, typeNum)
		// if (cardInfo && cardInfo.long == 1) {
		// 	return true
		// }

		// let cardInfo = getCardInfoByTypeNum(m_cardInfo31s, typeNum)
		// if (cardInfo && cardInfo.long == 1) {
		// 	return true
		// }

		let cardInfo = getCardInfoByTypeNum(m_cardInfo32s, typeNum)
		if (cardInfo && cardInfo.long == 1) {
			return true
		}

		return false
	}

	//计算炸弹个数
	export function countBomb(cards: Iproto_CCard[]) {
		const cardcount = {}
		cards.forEach(card => {
			if (cardcount[card.mNValue] == null) {
				cardcount[card.mNValue] = 1
			} else {
				cardcount[card.mNValue]++
			}
		})
		let bomb = 0
		for (const key in cardcount) {
			if (cardcount[key] >= 4) {
				bomb++
			}
		}
		if (cardcount[ECardPoint.Wang] && cardcount[ECardPoint.Wang] >= 2) {
			bomb++
		}
		return bomb
	}
}
