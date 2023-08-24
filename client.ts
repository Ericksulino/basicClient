/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import * as grpc from '@grpc/grpc-js';
import { connect, Contract, Identity, Signer, signers } from '@hyperledger/fabric-gateway';
import * as crypto from 'crypto';
import { promises as fs } from 'fs';
import * as path from 'path';
import { TextDecoder } from 'util';

const channelName = envOrDefault('CHANNEL_NAME', 'mychannel');
const chaincodeName = envOrDefault('CHAINCODE_NAME', 'basic');
//const chaincodeName = envOrDefault('CHAINCODE_NAME', 'fabcar');
const mspId = envOrDefault('MSP_ID', 'Org1MSP');

// Path to crypto materials.
const cryptoPath = envOrDefault('CRYPTO_PATH', path.resolve(__dirname, '..','..','organizations', 'peerOrganizations', 'org1.example.com'));
//const cryptoPath = envOrDefault('CRYPTO_PATH', path.resolve(__dirname, '..','..', 'peerOrganizations', 'org1.example.com'));
// Path to user private key directory.
const keyDirectoryPath = envOrDefault('KEY_DIRECTORY_PATH', path.resolve(cryptoPath, 'users', 'User1@org1.example.com', 'msp', 'keystore'));

// Path to user certificate.
const certPath = envOrDefault('CERT_PATH', path.resolve(cryptoPath, 'users', 'User1@org1.example.com', 'msp', 'signcerts', 'User1@org1.example.com-cert.pem'));

// Path to peer tls certificate.
const tlsCertPath = envOrDefault('TLS_CERT_PATH', path.resolve(cryptoPath, 'peers', 'peer0.org1.example.com', 'tls', 'ca.crt'));

// Gateway peer endpoint.
const peerEndpoint = envOrDefault('PEER_ENDPOINT', 'localhost:7051');

// Gateway peer SSL host name override.
const peerHostAlias = envOrDefault('PEER_HOST_ALIAS', 'peer0.org1.example.com');

const utf8Decoder = new TextDecoder();
const assetId = `asset${Date.now()}`;

async function main(): Promise<void> {

    await displayInputParameters();

    // The gRPC client connection should be shared by all Gateway connections to this endpoint.
    const client = await newGrpcConnection();

    const gateway = connect({
        client,
        identity: await newIdentity(),
        signer: await newSigner(),
        // Default timeouts for different gRPC calls
        evaluateOptions: () => {
            return { deadline: Date.now() + 5000 }; // 5 seconds
        },
        endorseOptions: () => {
            return { deadline: Date.now() + 15000 }; // 15 seconds
        },
        submitOptions: () => {
            return { deadline: Date.now() + 5000 }; // 5 seconds
        },
        commitStatusOptions: () => {
            return { deadline: Date.now() + 60000 }; // 1 minute
        },
    });

    try {
        // Get a network instance representing the channel where the smart contract is deployed.
        const network = gateway.getNetwork(channelName);

        // Get the smart contract from the network.
        const contract = network.getContract(chaincodeName);

        const argument = process.argv[2];

        switch (argument) {
            case "initLedger":
                 // Initialize a set of asset data on the ledger using the chaincode 'InitLedger' function.
                await initLedger(contract);
                break;
            case "transferAsset":
                const id = process.argv[3];
                const newOwner = process.argv[4];
                // Update an existing asset asynchronously.
                await transferAssetAsync(contract,id,newOwner);
                break;
            case "createAsset":
                // Create a new asset on the ledger.
                await createAsset(contract);
                break;
            case "createAssetEndorse":
                const n = parseInt(process.argv[3]);
               await createAssetEndorse(contract, n);
               break;
            case "getAll":
                // Return all the current assets on the ledger.
                await getAllAssets(contract);
                break;
            case "getByKey":
                const key = process.argv[3];
                // Get the asset details by assetID.
                await readAssetByID(contract, key);
                break;
            case "updateAsset":
                // Update an asset which does not exist.
                const keyUp = process.argv[3];
                await updateNonExistentAsset(contract,keyUp)
                break;
            default:
                console.log("Argumento Inválido!: "+argument);
        }
    } finally {
        gateway.close();
        client.close();
    }
}

main().catch(error => {
    console.error('******** FAILED to run the application:', error);
    process.exitCode = 1;
});

async function newGrpcConnection(): Promise<grpc.Client> {
    const tlsRootCert = await fs.readFile(tlsCertPath);
    const tlsCredentials = grpc.credentials.createSsl(tlsRootCert);
    return new grpc.Client(peerEndpoint, tlsCredentials, {
        'grpc.ssl_target_name_override': peerHostAlias,
    });
}

async function newIdentity(): Promise<Identity> {
    const credentials = await fs.readFile(certPath);
    return { mspId, credentials };
}

async function newSigner(): Promise<Signer> {
    const files = await fs.readdir(keyDirectoryPath);
    const keyPath = path.resolve(keyDirectoryPath, files[0]);
    const privateKeyPem = await fs.readFile(keyPath);
    const privateKey = crypto.createPrivateKey(privateKeyPem);
    return signers.newPrivateKeySigner(privateKey);
}

const generateRandomHash = () => {
    const timestamp = new Date().getTime().toString();
    const randomString = Math.random().toString();
    const hash = crypto.createHash('sha256').update(timestamp + randomString).digest('hex');
    const truncatedHash = hash.substring(0, 5); // Extrai os primeiros 5 caracteres do hash
    return "asset"+truncatedHash;
};

// const methods = ["InitLedger","createCar","queryAllCars","queryCar","transferCar",'updateCar'];

const methods = ["InitLedger","CreateAsset","GetAllAssets","ReadAsset","TransferAsset",'UpdateAsset'];

/**
 * This type of transaction would typically only be run once by an application the first time it was started after its
 * initial deployment. A new version of the chaincode deployed later would likely not need to run an "init" function.
 */
async function initLedger(contract: Contract): Promise<void> {
    console.log('\n--> Submit Transaction: InitLedger, function creates the initial set of assets on the ledger');

    await contract.submitTransaction(methods[0]);

    console.log('*** Transaction committed successfully');
}


/**
 * Evaluate a transaction to query ledger state.
 */
async function getAllAssets(contract: Contract): Promise<void> {
    console.log('\n--> Evaluate Transaction: GetAllAssets, function returns all the current assets on the ledger');

    const resultBytes = await contract.evaluateTransaction(methods[2]);

    const resultJson = utf8Decoder.decode(resultBytes);
    const result = JSON.parse(resultJson);
    console.log('*** Result:', result);
}

/**
 * Submit a transaction synchronously, blocking until it has been committed to the ledger.
 */
async function createAsset(contract: Contract): Promise<void> {
    console.log('\n--> Submit Transaction: CreateAsset, creates new asset with ID, Color, Size, Owner and AppraisedValue arguments');

    await contract.submitTransaction(
        methods[1],
        assetId,
        'yellow',
        '5',
        'Tom',
        '1300',
    );

    console.log('*** Transaction '+assetId+' committed successfully');
}

async function createAssetEndorse(contract: Contract, n = 1) {
    console.log(`\n--> Submit Transaction: CreateAsset, creating ${n} new asset(s)`);

    // Função para medir o tempo de uma etapa
    function measureTime(callback) {
        const startTime = performance.now();
        const result = callback();
        const endTime = performance.now();
        const elapsedTime = endTime - startTime;
        return { result, elapsedTime };
    }

    // Função para criar uma única transação
    async function createTransaction(hash) {
        const { result: proposal, elapsedTime: proposalTime } = measureTime(() =>
            contract.newProposal(methods[1], { arguments: [hash, 'yellow', '5', 'Tom', '1300'] })
        );

        const { result: transaction, elapsedTime: endorseTime } = await measureTime(async () =>
            proposal.endorse()
        );

        const { result: commit, elapsedTime: commitTime } = await measureTime(async () =>
            transaction.submit()
        );

        const result = transaction.getResult();
        const { result: status, elapsedTime: statusTime } = await measureTime(async () =>
            commit.getStatus()
        );

        if (!status.successful) {
            throw new Error(`Transaction ${status.transactionId} failed to commit with status code ${status.code}`);
        }

        return {
            endorseTime,
            commitTime,
            totalTime: proposalTime + endorseTime + commitTime + statusTime,
        };
    }

    for (let i = 0; i < n; i++) {
        const hash = generateRandomHash();
        const { endorseTime, commitTime, totalTime } = await createTransaction(hash);

        console.log(`Transaction ${i + 1} (${hash}):`);
        console.log(`- Time for endorse: ${endorseTime.toFixed(2)} ms`);
        console.log(`- Time for commit: ${commitTime.toFixed(2)} ms`);
        console.log(`- Total time: ${totalTime.toFixed(2)} ms`);
    }

    console.log(`Total of ${n} transactions "${methods[1]}" successfully sent.`);
}



/**
 * Submit transaction asynchronously, allowing the application to process the smart contract response (e.g. update a UI)
 * while waiting for the commit notification.
 */
async function transferAssetAsync(contract: Contract, id, newOwner): Promise<void> {
    console.log('\n--> Async Submit Transaction: TransferAsset, updates existing asset owner');

    const commit = await contract.submitAsync(methods[4], {
        arguments: [id, newOwner],
    });
    const oldOwner = utf8Decoder.decode(commit.getResult());

    console.log(`*** Successfully submitted transaction to transfer ownership from ${oldOwner} to ${newOwner}`);
    console.log('*** Waiting for transaction commit');

    const status = await commit.getStatus();
    if (!status.successful) {
        throw new Error(`Transaction ${status.transactionId} failed to commit with status code ${status.code}`);
    }

    console.log('*** Transaction committed successfully');
}

async function readAssetByID(contract: Contract, id): Promise<void> {
    console.log('\n--> Evaluate Transaction: ReadAsset, function returns asset attributes');

    const resultBytes = await contract.evaluateTransaction(methods[3], id);

    const resultJson = utf8Decoder.decode(resultBytes);
    const result = JSON.parse(resultJson);
    console.log('*** Result:', result);
}

/**
 * submitTransaction() will throw an error containing details of any error responses from the smart contract.
 */
async function updateNonExistentAsset(contract: Contract, id): Promise<void>{
    console.log('\n--> Submit Transaction: UpdateAsset '+id+', '+id+' does not exist and should return an error');

    try {
        await contract.submitTransaction(
            methods[5],
            id,
            'blue',
            '5',
            'Tomoko',
            '300',
        );
        console.log('******** FAILED to return an error');
    } catch (error) {
        console.log('*** Successfully caught the error: \n', error);
    }
}

/**
 * envOrDefault() will return the value of an environment variable, or a default value if the variable is undefined.
 */
function envOrDefault(key: string, defaultValue: string): string {
    return process.env[key] || defaultValue;
}

/**
 * displayInputParameters() will print the global scope parameters used by the main driver routine.
 */
async function displayInputParameters(): Promise<void> {
    console.log(`channelName:       ${channelName}`);
    console.log(`chaincodeName:     ${chaincodeName}`);
    console.log(`mspId:             ${mspId}`);
    console.log(`cryptoPath:        ${cryptoPath}`);
    console.log(`keyDirectoryPath:  ${keyDirectoryPath}`);
    console.log(`certPath:          ${certPath}`);
    console.log(`tlsCertPath:       ${tlsCertPath}`);
    console.log(`peerEndpoint:      ${peerEndpoint}`);
    console.log(`peerHostAlias:     ${peerHostAlias}`);
}