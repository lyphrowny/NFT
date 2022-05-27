let appId = "6NZWsm2KdM5FA6rQJlRGQ59fKGvmFG3ed6OOaR41";
let serverUrl ="https://ijj5uwoisbku.usemoralis.com:2053/server";

const CONTRACT_ADDRESS = "0x52ec22f4c15e924e1b2c4ff1b77ca480c692d884"

Moralis.start({ serverUrl, appId });

let currentUser;

function fetchNFTmetadata(NFTs) {
    let promises = [];

    for (let i = 0; i < NFTs.length; ++i) {
        let nft = NFTs[i];
        let id = nft.token_id;
        promises.push(fetch(serverUrl+"/functions/getNFT?_ApplicationId="+appId+"&nftId="+id)
        .then(res => res.json())
        .then(res => JSON.parse(res.result))
        .then(res => {nft.metadata = res})
        .then(res => {
            const options = { address: CONTRACT_ADDRESS, token_id: id, chain: "rinkeby" };
            return Moralis.Web3API.token.getTokenIdOwners(options);
        })
        .then((res) => {
            nft.owners  = [];
            res.result.forEach(element => {
                nft.owners.push(element.ownerOf);
            })
            return nft;
        }))
    }

    return Promise.all(promises);
}

function renderInventory(NFTs, ownerData) {
    const parent = document.getElementById("app");

    for (let i = 0; i < NFTs.length; i++) {
        const nft = NFTs[i];
         let htmlString = `
            <div class="card">
                <img src="${nft.metadata.image}" class="card-img-top" alt="...">
                <div class="card-body">
                    <h5 class="card-title">${nft.metadata.name}</h5>
                    <p class="card-text">${nft.metadata.description}</p>
                    <p class="card-text">Amount: ${nft.amount}</p>
                    <p class="card-text">Number of Owners: ${nft.owners.length}</p>
                    <p class="card-text">Your balance: ${ownerData[nft.token_id]}</p>
                    <a href="mint.html?nftId=${nft.token_id}" class="btn btn-primary">Mint</a>
                    <a href="transfer.html?nftId=${nft.token_id}" class="btn btn-primary">Transfer</a>
                </div>
            </div>
         `

         let col = document.createElement("div");
         col.className = "col col-md-4"
         col.innerHTML = htmlString;
         parent.appendChild(col);
    }
}

async function getOwnerData() {
    let accounts = currentUser.get("accounts");
    const options = {chain: "rinkeby", address: accounts[0], token_address: CONTRACT_ADDRESS};
    return Moralis.Web3API.account.getNFTsForContract(options).then((data) => {
        let result = data.result.reduce((object, currentElement) => {
            object[currentElement.token_id] = currentElement.amount;
            return object;
        }, {})
        return result
    });
}

async function initializeApp() {
    currentUser = Moralis.User.current();
    if (!currentUser) {
        current = await Moralis.Web3.authenticate();
    }
    
    const options = { address: CONTRACT_ADDRESS, chain: "rinkeby" };
    let NFTs = await Moralis.Web3API.token.getAllTokenIds(options);
    let NFTWithMetadata = await fetchNFTmetadata(NFTs.result);
    let ownerData = await getOwnerData();

    renderInventory(NFTWithMetadata, ownerData);
}

initializeApp();