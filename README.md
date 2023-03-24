# OpenReef

Openreef is an aquarium game, where you score points when fish are fed which can be embedded in any react application, like a marketplace. There are 2 fish in the aquarium: one representing USDC and the other Polygon. The more tokens you have in your wallet, the faster the fish move. You can select on the aquarium to drop food, or wait to have food dropped atomatically every 4 seconds.

# technology
The example utilizes the sequence indexer to get the balances of both the native token balance and the ERC20 USDC balance on polygon in order to decide on the relative pace of the fish. The example as to how this is implemented is seen here:

```js
import { SequenceIndexerClient } from '@0xsequence/indexer'

const indexer = new SequenceIndexerClient('https://polygon-indexer.sequence.app')

...
// query Sequence Indexer for all token balances of the account on Polygon
const tokenBalances = await indexer.getTokenBalances({
    accountAddress: address,
    includeMetadata: true
})

// query Sequence Indexer for the MATIC balance on Polygon
const balance = await indexer.getEtherBalance({
  accountAddress: address,
})
// relative 
const pace: any = {
  polygon: 0,
  usdc: 0 
}

// token balance store, can be extended to multiple tokens
const ownerBalance = {
  usdc: 0
}

tokenBalances.balances.map((token: any) => {
  if(token.contractAddress == "0x2791bca1f2de4661ed88a30c99a7a9449aa84174"){ // usdc
    console.log('usdc')
    console.log(token)
    ownerBalance.usdc = token.balance
  }
})

pace.polygon = Number((BigInt(balance!.balance!.balanceWei)/BigInt(10e18))) / Number(BigInt(BigInt(balance.balance.balanceWei)/BigInt(10e18) + BigInt(ownerBalance.usdc)/BigInt(1e5)))
pace.usdc = Number(BigInt(ownerBalance.usdc)/BigInt(1e5)) / Number(BigInt(BigInt(balance.balance.balanceWei)/BigInt(10e18) + BigInt(ownerBalance.usdc)/BigInt(1e5)))

```

# inspiration

what if you browsed NFTs (or the internet) with fish? they'd get in the way randomly when you're trying to make a bid or click a button.

To appreciate the work in protecting waters around the globe, including the [states](https://www.morningstar.com/news/marketwatch/20230321341/biden-declares-first-ocean-climate-action-plan-meant-to-help-fishing-and-limit-warming-seas)

# assistance
part of this codebase was generated with chatGPT
