// Script to get LastTx statistics

import LastTx from 0xf8d6e0586b0a20c7

access(all) fun main(): {String: AnyStruct} {
    return {
        "totalCreated": LastTx.getTotalLastTxCreated()
    }
}
