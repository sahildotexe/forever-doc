import React, { useState, useEffect } from "react";
import SmartAccount from "@biconomy/smart-account";
import abi from "../utils/counterAbi.json";
import { ethers } from "ethers";

interface Props {
  smartAccount: SmartAccount
  provider: any
}


const Docs: React.FC<Props> = ({ smartAccount, provider }) => {
  const [count, setCount] = useState<number>(0)
  const [counterContract, setCounterContract] = useState<any>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [documents, setDocuments] = useState<any>(null);

const counterAddress = "0xCa2d07Aa216f54008d5819711b854527373B0891"

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

  // function to get all the documents
    const getDocuments = async () => {
        try {
            const getDocumentsTx = await counterContract.getAllDocuments(smartAccount.address)
            const tx1 = {
                to: counterAddress,
                data: getDocumentsTx.data,
            }
            const txResponse = await smartAccount.sendTransaction({ transaction: tx1 })
            const txHash = await txResponse.wait();
            setDocuments(txHash)
            console.log(txHash)
        } catch (error) {
            console.log({ error })
        }
    }


  return(
    <>
      <div>
        <h1>Document Count: {count}</h1>
        <h1>All docs: </h1>
        {
          documents && documents.map((doc: any) => {
            return (
              <div>
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