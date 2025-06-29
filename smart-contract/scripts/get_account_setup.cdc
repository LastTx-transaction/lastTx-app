import LastTx from 0xf8d6e0586b0a20c7

access(all) fun main(account: Address): Bool {
    let cap = getAccount(account).capabilities.get<&LastTx.Collection>(LastTx.LastTxPublicPath)
    return cap.check()
}
