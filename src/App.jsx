import { EthereumClient, w3mConnectors, w3mProvider } from '@web3modal/ethereum'
import { Web3Modal } from '@web3modal/react'
import { configureChains, createConfig, WagmiConfig } from 'wagmi'
import { sepolia } from 'wagmi/chains'
import ConnectWallet from './Pages/ConnectWallet/ConnectWallet'
import { useState } from 'react'

const chains = [sepolia]
const projectId = '641b78ab05eb8ddcdc68fc15be6cd561'

const { publicClient } = configureChains(chains, [w3mProvider({ projectId })])
const wagmiConfig = createConfig({
  autoConnect: true,
  connectors: w3mConnectors({ projectId, chains }),
  publicClient
})
const ethereumClient = new EthereumClient(wagmiConfig, chains)

function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [accountAddress, setAccountAddress] = useState(null);
  return (
    <>
      <WagmiConfig config={wagmiConfig}>
        <ConnectWallet setIsConnected={setIsConnected} setAccountAddress={setAccountAddress} />
      </WagmiConfig>

      <Web3Modal projectId={projectId} ethereumClient={ethereumClient} />
    </>
  )
}
export default App
