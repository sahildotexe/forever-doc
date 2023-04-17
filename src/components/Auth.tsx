import { useState, useEffect, useRef } from 'react'
import SocialLogin from '@biconomy/web3-auth'
import { ChainId } from '@biconomy/core-types'
import { ethers } from 'ethers'
import SmartAccount from '@biconomy/smart-account'
import Docs from './Docs'
import { Box, Button, ButtonGroup, Card, CardBody, CardFooter, CardHeader, Center, Flex, Grid, Heading, HStack, IconButton, Img, Link, Menu, MenuButton, MenuItem, MenuList, SimpleGrid, Spacer, Spinner, Stack, StackDivider, Text, VStack } from '@chakra-ui/react'
import { AddIcon, ExternalLinkIcon, HamburgerIcon, RepeatIcon } from '@chakra-ui/icons'
import Image from 'next/image'
import mockup from "../../public/mockup.png"

export default function Home() {
  const [smartAccount, setSmartAccount] = useState<SmartAccount | null>(null)
  const [interval, enableInterval] = useState(false)
  const sdkRef = useRef<SocialLogin | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [provider, setProvider] = useState<any>(null);
  const biconomyKey: any = process.env.NEXT_PUBLIC_BICONOMY_API

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
            dappAPIKey: biconomyKey,
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
    <div className='main-app'>
      <div className='head'>
      <Flex minWidth='max-content' p='4' alignItems='center' gap='2' display={{ base: 'none', md: 'flex' }}>
  <Box p='2'>
    <Heading size='xl'  >immortal docs</Heading>
  </Box>
  <Spacer />
   {!smartAccount && !loading && (

  <ButtonGroup gap='2'>
    <Button colorScheme='blue' onClick={login}>sign in</Button>
  </ButtonGroup>

    )} 
    {smartAccount && !loading && (
      <ButtonGroup gap='2'>
        {smartAccount && smartAccount.address && (
  <Box p='2'>
    <Heading size='sm'>signed in as: 
      <Link href={`https://explorer-mumbai.maticvigil.com/address/${smartAccount.address}`} isExternal>
      {
        " " + smartAccount.address.slice(0, 6) + '...' + smartAccount.address.slice(-4)
      }
      </Link>
    </Heading>
  </Box>
  )}
              <Button colorScheme='blue' onClick={logout}>sign out</Button>
      </ButtonGroup>
    )}
    {
      loading && (<Button colorScheme='blue'> 
        <Spinner m='2' />signing in</Button>) 
    }
</Flex>

  {/* for mobile view */}
  <Flex minWidth='max-content' p='4' alignItems='center' gap='2' display={{ base: 'flex', md: 'none' }}>
  <Box p='2'>
    <Heading size='xl'  >immortal docs</Heading>
  </Box>
  <Spacer />
  <Menu>
  <MenuButton
    as={IconButton}
    aria-label='Options'
    icon={<HamburgerIcon />}
    variant='outline'
  />
  <MenuList>
    {!smartAccount && !loading && (
      <MenuItem onClick={login}>sign in</MenuItem>
    )}
    {smartAccount && !loading && (
      <MenuItem onClick={logout}>sign out</MenuItem>
    )}
    {
      loading && (<MenuItem>
        <Spinner m='2' />signing in
      </MenuItem>)
    }
  </MenuList>
</Menu>
</Flex>

      </div>
      {
        !smartAccount && !loading && (
            <VStack>
              <Box m='5' >
              <Image src={mockup} alt='logo' height={400} />
              <Heading size='xl' m='8' my='10'>immortalize your docs - no wallet needed!</Heading>
              </Box>
              <Box minWidth='max-content' m='5' >
                <Button colorScheme='blue' onClick={login}> get started</Button>
              </Box>
              <Box p='10' >
              {/* <Card bgColor={"gray.100"} textColor={"blackAlpha.800"} variant={"filled"}  >
  <CardHeader>
    <Heading size='md'>Key Features</Heading>
  </CardHeader>

  <CardBody>
    <Stack divider={<StackDivider />} spacing='4'>
      <Box>
        <Heading size='xs' textTransform='uppercase'>
        Gasless transactions
        </Heading>
        <Text pt='2' fontSize='sm'>
        Keep your wallet fat, no fees attached!
        </Text>
      </Box>
      <Box>
        <Heading size='xs' textTransform='uppercase'>
        Social sign-in
        </Heading>
        <Text pt='2' fontSize='sm'>
        No crypto wallet needed, just a couple of clicks!
        </Text>
      </Box>
      <Box>
        <Heading size='xs' textTransform='uppercase'>
        Immortalization of documents
        </Heading>
        <Text pt='2' fontSize='sm'>
        Personal digital vault for your files!
        </Text>
      </Box>
      <Box>
        <Heading size='xs' textTransform='uppercase'>
        Web2-like UX
        </Heading>
        <Text pt='2' fontSize='sm'>
        Immortalize your documents without the tech hassle!
        </Text>
      </Box>
    </Stack>
  </CardBody>
             </Card>         */}
              </Box>
              
            </VStack>
        )
      }
      {
        loading && (
          <Box  minHeight='max-content'  className='loading'>
            <Center><Spinner m='2' size='xl' color='blue' /></Center>
            </Box>
        )
      }
      {
        !!smartAccount && (
          <div>
            <Docs smartAccount={smartAccount} provider={provider}  />
          </div>
        )
      }

<Box className='footer' my={"0px"} bgColor={"white"} position={'fixed'} bottom='0' width='100vw'>
        <Center>
          <Text size='md'  > crafted by &nbsp;
            <Link fontWeight={"bold"} href='https://twitter.com/sahilkaling_' isExternal>
              sahilkaling_ 👨‍💻 
            </Link>      
          </Text>
        </Center>
      </Box>
    </div>
    
  )
}
