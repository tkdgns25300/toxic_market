import {Service} from "typedi";
import {InjectRepository} from "typeorm-typedi-extensions";
import Caver from "caver-js";
import {UserQueryRepo} from "../repository/UserQueryRepo";
import {User} from "../entity";
import {PageResObj} from "../api";
import {ABI, CONTRACT_ADDRESS} from "../middlewares/smartContract";
import {EntityManager, Transaction, TransactionManager} from "typeorm";

const caver = new Caver('https://public-node-api.klaytnapi.com/v1/cypress')
//const caver = new Caver('https://api.baobab.klaytn.net:8651/')
const keyring = caver.wallet.keyring.createFromPrivateKey(process.env.WALLET_PRIVATE_KEY)
caver.wallet.add(keyring)

@Service()
export class ExchangeService {
    constructor(
        @InjectRepository()
        readonly userQueryRepo: UserQueryRepo
    ) {
    }


    @Transaction()
    async toxToPoint(amount: number, public_address: string, @TransactionManager() manager: EntityManager) {
        // @ts-ignore
        const contractInstance = caver.contract.create(ABI, CONTRACT_ADDRESS);
        const user: User = await manager.findOne(User, {public_address: public_address});
        user.point_balance = user.point_balance + amount;
        await manager.update(User, public_address, user);
        //sending coin
        await contractInstance.send(
            {from: keyring.address, gas: '0x4bfd200'},
            'transferFrom', public_address,
            keyring.address, `${BigInt(amount * Math.pow(10, 18))}`)
        return new PageResObj(user, "TOX 코인을 포인트로 교환하는데 성공했습니다.");
    }

    @Transaction()
    async pointToTox(amount: number, public_address: string, @TransactionManager() manager: EntityManager) {
        const user: User = await manager.findOne(User, {public_address: public_address});
        if (user.point_balance < amount) {
            return new PageResObj({}, "포인트가 부족합니다.");
        }
        user.point_balance = user.point_balance - amount;
        await manager.update(User, public_address, user);
        const amountOfCoins = BigInt(amount * 0.95 * Math.pow(10, 18))   // 95% of pointAmount
        // @ts-ignore
        const contractInstance = caver.contract.create(ABI, CONTRACT_ADDRESS);
        //sending coin to User
        await contractInstance.send({
            from: keyring.address,
            gas: '0x4bfd200'
        }, 'transferFrom', keyring.address, public_address, `${amountOfCoins}`)
        return new PageResObj(user, "포인트를 TOX 코인으로 교환하는데 성공했습니다.");
    }

}
