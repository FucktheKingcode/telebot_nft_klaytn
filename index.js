const { Telegraf, Markup } = require("telegraf");
const ethers = require("ethers");
const { abi } = require("./config/abi.js");
const { abi_sbnft } = require("./config/abi_sbnft.js");
const { privateKey, chatId, contractAddress, contractAddressSBNFT, shitUrl, urlRPC, botToken} = require("./config/constant.js")

const bot = new Telegraf(botToken);

const provider = new ethers.JsonRpcProvider(urlRPC);

// Hàm kết nối ví
const connectWallet = async (privateKey, chatId) => {
    try {
        const wallet = new ethers.Wallet(privateKey, provider);
        const address = await wallet.getAddress();

        let message = `*\Wallet ${address} connected successfuly\*`
        // console.log("Address", address)
        sendMessage(message, chatId);
    } catch (error) {
        console.log("Error while connecting wallet:", error);
        sendMessage("An error occurred while connecting the wallet.", chatId);
    }
};

const walletBalance = async (publicKey, chatId) => {
    try {
        const klayBalance =  await provider.getBalance(publicKey);
        const formatBalance = ethers.formatEther(klayBalance)
        let message =`You have ${formatBalance} KLAY`;
        sendMessage(message, chatId);
    } catch (error) {
        console.log(error),
        sendMessage("An error occurred while connecting the wallet.", chatId);
    }
};

async function mintNFT(privateKey, contactAddress, tokenURI){

    const wallet =  new ethers.Wallet(privateKey, provider);
    const contract = new ethers.Contract(contactAddress, abi, wallet);
    const tx = await contract.mintNFT(tokenURI);
    const receipt =  await tx.wait();


    let message = `NFT minted successfully`
    message += `\n Hash: \`${receipt.hash}\``
    // message += `\n Gas Used: \`${ethers.utils.formatEther(receipt.gasUsed)} KLAY\``
    message += `\n To: \` ${receipt.to}\``
    message += `\n From: \` ${receipt.from}\``
    message += `\n View NFT at :https://baobab.klaytnscope.com/tx/${receipt.hash}`


    sendMessage(message, chatId);

    console.log("Our Hash", receipt)

    return 1;

}

async function dropshitNFT(privateKey, contractAddressSBNFT, shitUrl, toAddress){

    const wallet =  new ethers.Wallet(privateKey, provider);
    const contract = new ethers.Contract(contractAddressSBNFT, abi_sbnft, wallet);
    const tx = await contract.safeMint(toAddress, shitUrl);
    const receipt =  await tx.wait();


    let message = `ShitNFT droped successfully`
    message += `\n Hash: \`${receipt.hash}\``
    // message += `\n Gas Used: \`${ethers.utils.formatEther(receipt.gasUsed)} KLAY\``
    message += `\n To: \` ${receipt.to}\``
    message += `\n From: \` ${receipt.from}\``
    message += `\n View NFT at :https://baobab.klaytnscope.com/tx/${receipt.hash}`


    sendMessage(message, chatId);

    console.log("Our Hash", receipt)

    return 1;

}

async function transferNFT(fromAddress, toAddress, tokenid) {
    const wallet = new ethers.Wallet(privateKey, provider);
    const contract = new ethers.Contract(contractAddress, abi, wallet);

    console.log("Transfer");
    const tx = await contract.transferFrom(fromAddress, toAddress, tokenid);
    const receipt = await tx.wait();

    let message = `NFT Transafered Successfully`
    message += `\n Hash: \`${receipt.hash}\``
    // message += `\n Gas Used: \`${ethers.utils.formatEther(receipt.gasUsed)}\``
    message += `\n To: \` ${receipt.to}\``
    message += `\n From: \` ${receipt.from}\``
    message += `\n View NFT at :https://baobab.klaytnscope.com/tx/${receipt.hash}`

    sendMessage(message, chatId);


    return 1;

}

// Hàm gửi tin nhắn
function sendMessage(message, chatId) {
    bot.telegram.sendMessage(chatId, message);
}

bot.start((ctx) => {
    ctx.reply(`
    \nUsage: /connect.
    \nUsage: /balance <publicKey>.
    \nUsage: /mint <tokenURI>.
    \nUsage: /transfer <tokenid> <recipientAddress>.
    \nUsage: /dropshit <recipientAddress>.
    `);
})

bot.command('connect', (ctx) => {
    connectWallet(privateKey, chatId);
});

bot.command("balance", (ctx) => {
    const args = ctx.message.text.split(" ");
    if (args.length !== 2) {
        return ctx.reply("Usage: /walletbalance <publicKey>");
    }

    const publicKey = args[1];

    walletBalance(publicKey, chatId);
});

bot.command("mint", async (ctx) => {
    const args = ctx.message.text.split(" ");
    if (args.length !== 2) {
        return ctx.reply("Usage: /mintnft <tokenURI>");
    }

    const tokenURI = args[1];

    try {
        await mintNFT(privateKey, contractAddress, tokenURI);
    } catch (error) {
        console.log(error);
        ctx.reply("An error occurred while minting the NFT.");
    }
});

bot.command("transfer", async (ctx) => {
    const args = ctx.message.text.split(" ");
    if (args.length !== 3) {
        return ctx.reply("Usage: /transfer <tokenid> <recipientAddress>");
    }

    const tokenid = args[1];
    const recipientAddress = args[2];

    try {
        const wallet = new ethers.Wallet(privateKey, provider);
        const address = await wallet.getAddress();
        await transferNFT(address, recipientAddress, tokenid);
    } catch (error) {
        console.log(error);
        ctx.reply("An error occurred while transferring the NFT.");
    }
});

bot.command("dropshit", async (ctx) => {
    const args = ctx.message.text.split(" ");
    if (args.length !== 2) {
        return ctx.reply("Usage: /dropshitnft <recipientAddress>");
    }

    const toAddress = args[1];

    try {
        await dropshitNFT(privateKey, contractAddressSBNFT, shitUrl, toAddress);
    } catch (error) {
        console.log(error);
        ctx.reply("An error occurred while dropping the ShitNFT.");
    }
});

bot.launch();
console.log("Bot started.");
