let appId = "6NZWsm2KdM5FA6rQJlRGQ59fKGvmFG3ed6OOaR41";
let serverUrl ="https://ijj5uwoisbku.usemoralis.com:2053/server";

const CONTRACT_ADDRESS = "0x52ec22f4c15e924e1b2c4ff1b77ca480c692d884"

Moralis.start({ serverUrl, appId });

let web3;

async function init() {
    let currentUser = Moralis.User.current();
    if (!currentUser) {
        window.location.pathname = "/index.html";
    }

    web3 = await Moralis.Web3.enable();

    const urlParams = new URLSearchParams(window.location.search);
    const nftId = urlParams.get("nftId");
    document.getElementById("token_id_input").value = nftId;
}

async function transfer() {
    let tokenId = parseInt(document.getElementById("token_id_input").value);
    let address = document.getElementById("address_input").value;
    let amount = parseInt(document.getElementById("amount_input").value);

    const options = {type: "erc1155",
                     receiver: address,
                     contract_address: CONTRACT_ADDRESS,
                     token_id: tokenId.toString(),
                     amount: amount}
    let result = await Moralis.transfer(options);
    console.log(result);
}

document.getElementById("submit_transfer").onclick = transfer;

init();