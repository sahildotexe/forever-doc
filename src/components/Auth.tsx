import { useState, useEffect, useRef } from 'react'
import SocialLogin from '@biconomy/web3-auth'
import { ChainId } from '@biconomy/core-types'
import { ethers } from 'ethers'
import SmartAccount from '@biconomy/smart-account'
import Docs from './Docs'

export default function Home() {
  const [smartAccount, setSmartAccount] = useState<SmartAccount | null>(null)
  const [interval, enableInterval] = useState(false)
  const sdkRef = useRef<SocialLogin | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [provider, setProvider] = useState<any>(null);


  useEffect(() => {
    let configureLogin:any
    if (interval) {
      configureLogin = setInterval(() => {
        if (!!sdkRef.current?.provider) {
          setupSmartAccount()
          clearInterval(configureLogin)
        } 
      }, 1000)
    }

  }, [interval])

  useEffect(() => {
    if (localStorage.getItem('smartAccount')) {
      login()
    }
  }, [])

  async function login() {
    if (!sdkRef.current) {
      const socialLoginSDK = new SocialLogin()
      const signature1 = await socialLoginSDK.whitelistUrl('http://localhost:3000')
      await socialLoginSDK.init({
        chainId: ethers.utils.hexValue(ChainId.POLYGON_MUMBAI),
        whitelistUrls: {
          'http://localhost:3000': signature1,
        }
      })
      sdkRef.current = socialLoginSDK
    }
    if (!sdkRef.current.provider) {
      sdkRef.current.showWallet()
      enableInterval(true)
    } else {
      setupSmartAccount()
    }
  }

  async function setupSmartAccount() {
    if (!sdkRef?.current?.provider) {
      console.log('no provider found... ')
      return
    } 
    sdkRef.current.hideWallet()
    setLoading(true)
    const web3Provider = new ethers.providers.Web3Provider(
      sdkRef.current.provider
    )
    setProvider(web3Provider)
    console.log('web3 provider created... ', web3Provider)
    try {
      const smartAccount = new SmartAccount(web3Provider, {
        activeNetworkId: ChainId.POLYGON_MUMBAI,
        supportedNetworksIds: [ChainId.POLYGON_MUMBAI],
        networkConfig: [
          {
            chainId: ChainId.POLYGON_MUMBAI,
            dappAPIKey: "FESVe0fGT.0d50b7dd-d352-44ea-8e55-458f074451bf",
          },
        ],
      })
      await smartAccount.init()
      setSmartAccount(smartAccount)
      console.log('smart account created... ', smartAccount)
      // store account address in local storage
      localStorage.setItem('smartAccount', smartAccount.address )
      setLoading(false)
    } catch (err) {
      console.log('error setting up smart account... ', err)
    }
  }

  const logout = async () => {
    if (!sdkRef.current) {
      console.error('Web3Modal not initialized.')
      return
    }
    await sdkRef.current.logout()
    localStorage.removeItem('smartAccount')
    sdkRef.current.hideWallet()
    setSmartAccount(null)
    enableInterval(false)
  }


  return (
    <div>
      <h1>BICONOMY AUTH</h1>
      {
        !smartAccount && !loading && <button onClick={login}>Login</button>
      }
      {
        loading && <p>Loading account details...</p>
      }
      {
        !!smartAccount && (
          <div>
            <h3>Smart account address:</h3>
            <p>{smartAccount.address}</p>
            <Docs smartAccount={smartAccount} provider={provider}  />
            <button onClick={logout}>Logout</button>
          </div>
        )
      }
    </div>
  )
}
