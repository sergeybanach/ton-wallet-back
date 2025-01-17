const envs = require("../config/env");
const ton = require("@ton/ton");
const tonCrypto = require("@ton/crypto");
const User = require("../models/user.model");

exports.createWallet = async (req, res) => {
  try {
    let user = await User.findOne({
      _id: req.user._id,
    });

    if (!user) {
      return res.status(404).json({
        status: "FAILED",
        message: "USER_NOT_FOUND",
      });
    }

    const client = new ton.TonClient({
      endpoint: "https://testnet.toncenter.com/api/v2/jsonRPC",
      apiKey: envs.TON_CENTER_API_KEY_TESTNET,
    });

    let mnemonics = await tonCrypto.mnemonicNew();
    let keyPair = await tonCrypto.mnemonicToPrivateKey(mnemonics);
    let wallet = ton.WalletContractV4.create({
      workchain: 0,
      publicKey: keyPair.publicKey,
    });
    let contract = client.open(wallet);
    let friendlyNotBounceable = contract.address.toString({
      urlSafe: true,
      bounceable: false,
      testOnly: false,
    });

    const walletName = friendlyNotBounceable;

    const walletStored = {
      walletName,
      mnemonics,
      publicKey: keyPair.publicKey.toString("base64"),
      secretKey: keyPair.secretKey.toString("base64"),
      balance: "0",
    };

    user.wallets.push(walletStored);

    user = await user.save();

    return res.status(200).json({
      status: "SUCCESS",
      message: "WALLET_CREATED",
      data: walletStored,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: "FAILED",
      message: "WALLET_CREATION_FAILED",
      data: {
        error,
      },
    });
  }
};

exports.getWalletById = async (req, res) => {
  try {
    const data = req.body;
    let user = await User.findOne({ _id: req.user._id });

    if (!user) {
      return res.status(404).json({
        status: "FAILED",
        message: "USER_NOT_FOUND",
      });
    }

    const storedWallet = user.wallets.id(data.walletId);

    if (!storedWallet) {
      return res.status(404).json({
        status: "FAILED",
        message: "WALLET_NOT_FOUND",
      });
    }

    const client = new ton.TonClient({
      endpoint: "https://testnet.toncenter.com/api/v2/jsonRPC",
      apiKey: envs.TON_CENTER_API_KEY_TESTNET,
    });

    let wallet = ton.WalletContractV4.create({
      workchain: 0,
      publicKey: Buffer.from(storedWallet.publicKey, "base64"),
    });

    const address = {
      rawString: wallet.address.toRawString(),
      friendlyBounceable: wallet.address.toString({
        urlSafe: true,
        bounceable: true,
        testOnly: false,
      }),
      friendlyNotBounceable: wallet.address.toString({
        urlSafe: true,
        bounceable: false,
        testOnly: false,
      }),
      friendlyBounceableTestOnly: wallet.address.toString({
        urlSafe: true,
        bounceable: true,
        testOnly: true,
      }),
      friendlyNotBounceableTestOnly: wallet.address.toString({
        urlSafe: true,
        bounceable: false,
        testOnly: true,
      }),
    };

    let openedContract = client.open(wallet);
    const balance = await openedContract.getBalance();

    storedWallet.balance = ton.fromNano(balance);

    await storedWallet.save();
    await user.save()

    return res.status(200).json({
      status: "SUCCESS",
      message: "",
      data: {
        balance: ton.fromNano(balance),
        stringWalletAddress: storedWallet.stringWalletAddress,
        address,
      },
    });
  } catch (error) {
    return res.status(500).json({
      status: "FAILED",
      message: "WALLET_INFO_FAILED",
      data: {
        error: error.message || error,
      },
    });
  }
};

exports.transferTonFromWalletId = async (req, res) => {
  try {
    const data = req.body;
    let user = await User.findOne({ _id: req.user._id });

    if (!user) {
      return res.status(404).json({
        status: "FAILED",
        message: "USER_NOT_FOUND",
      });
    }

    const storedWallet = user.wallets.id(data.walletId);

    if (!storedWallet) {
      return res.status(404).json({
        status: "FAILED",
        message: "WALLET_NOT_FOUND",
      });
    }

    const client = new ton.TonClient({
      endpoint: "https://testnet.toncenter.com/api/v2/jsonRPC",
      apiKey: envs.TON_CENTER_API_KEY_TESTNET,
    });

    let wallet = ton.WalletContractV4.create({
      workchain: 0,
      publicKey: Buffer.from(storedWallet.publicKey, "base64"),
    });

    let contract = client.open(wallet);

    const balance = await contract.getBalance();

    let seqno = await contract.getSeqno();
    console.log("seqno: ", seqno);

    let transfer = contract.createTransfer({
      seqno,
      secretKey: Buffer.from(storedWallet.secretKey, "base64"),
      messages: [
        ton.internal({
          value: data.value,
          to: data.toAddr,
        }),
      ],
    });

    await contract.send(transfer);
    console.log("--- Transfer is done! ---");

    return res.status(200).json({
      status: "SUCCESS",
      message: "Transfer is done!",
    });
  } catch (error) {
    return res.status(500).json({
      status: "FAILED",
      message: "TRANSFER_FAILED",
      data: {
        error: error.message || error,
      },
    });
    console.log("--- Error! ---");
    console.log("status: ", error.response?.status);
    console.log("statusText: ", error.response?.statusText);
    console.log("data: ", error.response?.data);
  }
};
