import React, { useState, useEffect } from "react";
import SmartAccount from "@biconomy/smart-account";
import abi from "../utils/counterAbi.json";
import { ethers } from "ethers";
import { Web3Storage } from "web3.storage";

interface Props {
  smartAccount: SmartAccount
  provider: any
}


const Docs: React.FC<Props> = ({ smartAccount, provider }) => {
  const [count, setCount] = useState<number>(0)
  const [counterContract, setCounterContract] = useState<any>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [documents, setDocuments] = useState<any>(null);
  const [docName, setDocName] = useState<string>("");
  const [file, setFile] = useState<any | null>(null);


const counterAddress: any = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
const web3token: any = process.env.NEXT_PUBLIC_WEB3_TOKEN;
const storage = new Web3Storage({ token : web3token });


  useEffect(() => {
    setIsLoading(true)
    getDocs(false)
  },[])

  const getDocs = async (isUpdating: boolean) => {
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

  const incrementCount = async () => {
    try {
      const incrementTx = await counterContract.populateTransaction.incrementCount()
      const tx1 = {
        to: counterAddress,
        data: incrementTx.data,
      }
      const txResponse = await smartAccount.sendTransaction({ transaction: tx1})
      const txHash = await txResponse.wait();
      console.log(txHash)
      getDocs(true)

    } catch (error) {
      console.log({error})
    }
  }

  // function to add a document
  const addDocument = async () => {
    // upload file to web3 storage
    var newFile = new File([file], docName , {
      type: file.type,
    });
    const cid = await storage.put([newFile])
    console.log(cid)


    try {
      const addDocTx = await counterContract.populateTransaction.uploadDocument(smartAccount.address, docName, cid)
      const tx1 = {
        to: counterAddress,
        data: addDocTx.data,
      }
      const txResponse = await smartAccount.sendTransaction({ transaction: tx1})
      const txHash = await txResponse.wait();
      console.log(txHash)
      getDocs(true)
    } catch (error) { 
      console.log({error})
    }
  }


  return(
    <>
      <div>
        <h1>Document Count: {count}</h1>
        <hr />
        <label htmlFor="doc_name"> Doc name: </label>
        <input type="text" name="doc_name"  id="doc_name"    onChange= { (e) => setDocName(e.target.value) } />
        <input type="file" name="doc" id="doc" onChange={(e) => setFile(e.target.files[0])} />  
        <button onClick={addDocument}>Add doc</button>
        <hr />
        <h1>All docs: </h1>
        {
          documents && documents.map((doc: any) => {
            return (
              <div >
                <h3>Document Name: {doc.name}</h3>
                <h3>Document Hash: {doc.ipfsHash}</h3>
              </div>
            )
          })
        }
      </div>
    </>
  )
};

export default Docs;