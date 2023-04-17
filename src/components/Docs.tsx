import React, { useState, useEffect } from "react";
import SmartAccount from "@biconomy/smart-account";
import abi from "../utils/counterAbi.json";
import { ethers } from "ethers";
import { Web3Storage } from "web3.storage";
import { Box, Button, Card, CardBody, CardFooter, CardHeader, Center, defineStyle, defineStyleConfig, Heading, HStack, Input, Link, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, SimpleGrid, Spinner, Text, useDisclosure, useToast } from "@chakra-ui/react";
import { LocaleRouteNormalizer } from "next/dist/server/future/normalizers/locale-route-normalizer";

interface Props {
  smartAccount: SmartAccount
  provider: any
}


const Docs: React.FC<Props> = ({ smartAccount, provider }) => {
  const [count, setCount] = useState<number>(0)
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [counterContract, setCounterContract] = useState<any>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [documents, setDocuments] = useState<any>(null);
  const [docName, setDocName] = useState<string>("");
  const [file, setFile] = useState<any | null>(null);
  const toast = useToast()
  const [isUploading, setIsUploading] = useState<boolean>(false)

const counterAddress: any = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
const web3token: any = process.env.NEXT_PUBLIC_WEB3_TOKEN;
const storage = new Web3Storage({ token : web3token });


  useEffect(() => {
    setIsLoading(true)
    getDocs()
  },[documents])

  const getDocs = async () => {
    const contract = new ethers.Contract(
      counterAddress,
      abi,
      provider,
    )
    setCounterContract(contract)
    const currentDocCount = await contract.getDocumentCount(smartAccount.address)
    const docs =  await contract.getAllDocuments(smartAccount.address)
    setDocuments(docs)
    setCount(currentDocCount.toNumber())
  }

  // function to add a document
  const addDocument = async () => {
    // upload file to web3 storage

    setIsUploading(true)
    if(!docName) {
      toast({
        title: 'no name given',
        description: "please give your doc a name",
        status: 'error',
        duration: 9000,
        isClosable: true,
      })
    setIsUploading(false)
    return
    }
    if(!file) {
      toast({
        title: 'no file selected',
        description: "please select a file to upload",
        status: 'error',
        duration: 9000,
        isClosable: true,
      })
    setIsUploading(false)
    return
    }

    var newFile = new File([file], docName , {
      type: file.type,
    });
    const cid = await storage.put([newFile])
    console.log(cid)
    toast({
      title: 'please wait...',
      description: "we're making your doc immortal!!",
      status: 'info',
      duration: 9000,
      isClosable: true,
    })

    try {
      const addDocTx = await counterContract.populateTransaction.uploadDocument(smartAccount.address, docName, cid)
      const tx1 = {
        to: counterAddress,
        data: addDocTx.data,
      }
      const txResponse = await smartAccount.sendTransaction({ transaction: tx1})
      const txHash = await txResponse.wait();
      await getDocs()
      setIsUploading(false)
      toast({
        title: 'doc uploaded!',
        description: "we've made your doc immortal!!",
        status: 'success',
        duration: 9000,
        isClosable: true,
      })
      setFile(null)
      setDocName("")
      onClose()
    } catch (error) { 
      console.log({error})
    }
  }


  return(
    <>
      <div>
      <Center>
      <Button onClick={onOpen} colorScheme='blue' m='8' mx='0' > + add new doc</Button>
      </Center>
  <Modal isOpen={isOpen} onClose={onClose}>
  <ModalOverlay />
  <ModalContent >
    <ModalHeader > upload new doc: </ModalHeader>
    <ModalCloseButton />
    <ModalBody >
      <Text>doc name: </Text>
      <Input type="text" p='3' m='4' mx='0' name="doc_name"  id="doc_name"    onChange= { (e) => setDocName(e.target.value) } />
      <Input type="file" p='2' m='4' mx='0' name="doc" id="doc" onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            // max size 10MB
            if (e.target.files[0].size > 10000000) {
              alert("File size is too big. Max size is 10MB")
              e.target.value = ""
              return
            }
            setFile(e.target.files[0])
          }
        }} />
    </ModalBody>

    <ModalFooter >
      <Button colorScheme='blue' onClick={addDocument} >
         {
          isUploading ? (
            <Spinner m='2' />
          ) : ""
         }
         confirm 
      </Button>
    </ModalFooter>
  </ModalContent>
</Modal>
 <Box p='4'>
 <Heading size='lg'>{

 }
  uploaded docs ({
    documents && documents.length
  }) : 
  </Heading>
 </Box>
 <SimpleGrid spacing={10} m='4' templateColumns='repeat(auto-fill, minmax(200px, 1fr))'>
        {
          documents && documents.map((doc: any, index: number) => {
            return (
  <Card key={index} p='2' m='4' mx='0' >
    <CardHeader>
      <Heading size='md'> {doc.name}</Heading>
    </CardHeader>
    <CardFooter>
      <Link href={`https://ipfs.io/ipfs/${doc.ipfsHash}/${doc.name}`}isExternal style={{ textDecoration: 'none' }}>
          <Button color='blue' >view doc</Button>
      </Link>
    </CardFooter>
  </Card>
            )
          })
        }
        </SimpleGrid>
      </div>
    </>
  )
};

export default Docs;