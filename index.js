const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const fs = require('fs');

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

const HELIUS_URL_TEMPLATE = "https://api.helius.xyz/v0/addresses/{address}/transactions/?api-key=";

const API_KEYS = [
  process.env.RPC_URL || "",
  process.env.RPC_URL2 || "",
  process.env.RPC_URL3 || ""
].filter(key => key.length > 0);

// تتبع الروابط (API Keys) التي تعمل والروابط المعطلة كما في index.js
const HELIUS_APIS = API_KEYS.map(key => HELIUS_URL_TEMPLATE + key);
const ACTIVE_API_TEMPLATES = [...HELIUS_APIS];
const FAILED_API_KEYS = new Set();

const PLATFORMS = {
  "🥩Jito": [
    "Jito4APyf642JPZPx3hGc6WWJ8zPKtRbRs4P815Awbb",
    "6iQKfEyhr3bZMotVkW6beNZz5CPAkiwvgV2CTje9pVSS",
    "SPoo1Ku8WFXoNDMHPsrGSTSG1Y47rzgn41SLUNakuHy",
    "9eZbWiHsPRsxLSiHxzg2pkXsAuQMwAjQrda7C7e21Fw6",
    "Jito435UBFCyo6S9R7Wp4Y9PzN1p2p2p2p2p2p2p2p2",
    "JitoS9n6iRDP7KLAh5QkU7fEJi9qCjM5Y9pY9pY9pY9",
    "jitoSjNRNXYeWv8C6LpS387F7hL8h9f9eE9eE9eE9e"
  ],
  "💸Save (Solend)": [
    "So1endDq2YkqhipRh3WViPa8hdiSpxWy6z3Z6tMCpAo",
    "FfqKAY2NEH7pofsVU1zELif6awbvtiXs2DJPbpWumW5w",
    "4GxZ7xoxKWGYqgRXmZjkbFjmvPB1JXhbT78vh3pJnqRw",
    "5pHk2TmnqQzRF9L6egy5FfiyBgS7G9cMZ5RFaJAvghzw",
    "7o582Dsd3HAvWwpaMy3fVpYLyratWTeyAYHCTopatFfS",
    "4UpD2fh7xH3VP9QQaXtsS1YY3bxzWhtfpks7FatyKvdY",
    "GDmSxpPzLkfxxr6dHLNRnCoYVGzvgc41tozkrr4pHTjB",
    "2kjaCAy2pnftwoXkQLuCgEfYsYcotA54m25fC7imupXr",
    "EnrWkCKWLmHQQAuL7G63AqNzkF9zwiwPpqiHHC1bTPn",
    "Hp4vZ5AoJouxHhHipFx8wfG7Y3Y2iB4YMVqmLxYixSvu"
  ],
  "🪼Marinade Finance": [
    "7GgPYjS5Dza89wV6FpZ23kUJRG5vbQ1GM25ezspYFSoE",
    "HP8WaxY64g4k1G4eUbMfyKo84DXyjt2pUcFhi6YLgUEY",
    "EyaSjUtSgo9aRD1f8LWXwdvkpDTmXAW54yoSHZRF14WL",
    "MarBmsSgKXdrN1egZf5sqe1TMai9K1rChYNDJgjq7aD",
    "628ZJwmiQjR4nFnijHfzbiT5xkbwdTezVniz4zbdR7dJ",
    "Du3Ysj1wKbxPKkuPPnvzQLQh8oMSVifs3jGZjJWXFmHN",
    "AufL1ZuuAZoX7jBw8kECvjUYjfhWqZm13hbXeqnLMhFu",
    "3yqgPsc4kwP3uM8rva4rzGqVeqAaBAkPqCsMwn5gopmd",
    "Bcr3rbZq1g7FsPz8tawDzT6fCzN1pvADthcv3CtTpd3b",
    "UefNb6z6yvArqe4cJHTXCqStRsKmWhGxnZzuHbikP5Q",
    "mSOL841cb7UQp337shSHe8Cq2mBfVnkyuVTho5i7tF3"
  ],
  "🔥🔥printr": [
    "T8HsGYv7sMk3kTnyaRqZrbRPuntYzdh12evXBkprint"
  ],
  "⚔️Saber": [
    "4DYwgJtxwuJdAjkj5RJSNH4e7U329V5cNp7d3a1nLrZv",
    "CfWX7o2TswwbxusJ4hCaPobu2jLCb1hfXuXJQjVq3jQF",
    "EnTrdMMpdhugeH6Ban6gYZWXughWxKtVGfCwFn78ZmY3",
    "EXNW64GEf1ACC6xY9BtKRiunrs6GoJSXBdxWN2eTPmrF",
    "SSwpkEEcbUqx4vtoEByFjSkhKdCT862DNVb52nZg1UZ",
    "5C1k9yV7y4CjMnKv8eGYDgWND8P89Pdfj79Trk2qmfGo",
    "35yX27bmurdebhfAb8EPmjLETDiUaEUCn9zHaDPbakH2",
    "Fekck54VF2MdesR74trJteZbiKj1TD5AVQisXr8E7fjG",
    "7W9KMACQT6UmjRPEUQKXyVf4NjZ9Ux4PHs1e1P5PxDtA",
    "Crt7UoUR6QgrFrN7j8rmSQpUTNWNSitSwWvsWGf1qZ5t"
  ],
  "📈GMX (gmsol)": [
    "GMSOLvJpD2mB8U77xstR4n6E9jkyL21bM8U77xstR4n6E",
    "GMSOLstoreP6YVBrao9DSLVGk7QsXxQVPbs4XyHVtHw9o",
    "GMSOLtreasury58P9v3uE9G4W9S2p1W299W9S2p1W299"
  ],
  "☘️luck.io": [
    "yYWjk6ycNwCPYAjqykJYYDK12geW9JBRi3RqZHu4Rmt",
    "E1f2ZX387tP8MJweeVRqhrShs8Ge8hpZnJeNGEFKQ7kN",
    "AQZdYsg36tEn8ZJ7RKSSLbUSLoGPBi71TCLruCDepYom",
    "4xMajQJ7GSyUpRK2iyaQDN8vHnZpow8NZWuPjeWoYYBc"
  ],
  "🔰rugs.fun": [
    "8VVe4Lk5veqnsmGzc8UZaue7S9vywBYf4Cgw8LXW7Tg",
    "E3J16ZBEDnxRvQWmwisofGs975twiwCAxJRxV4fD3z6R",
    "RugsXfV9S2p1W299W9S2p1W299W9S2p1W299W9S2p",
    "RUGSvW9S2p1W299W9S2p1W299W9S2p1W299W9S2p1",
    "RUG6iRDP7KLAh5QkU7fEJi9qCjM5Y9pY9pY9pY9pY9",
    "BhMvpukDVLqHwmPaT8inRrfbd7hBru6vqtQMVW257cgw"
  ],
  "😸Doubl": [
    "HMq2uadrCJru2bhP1DJrVmjLM7pySS9rP5FGQjg5GULP"
  ],
  "🚀solpump": [
    "3MBwwCXXnGFLXgP73kAUCPw7XdEzX8YL4Kjy16Gggrtk",
    "6YVBrao9DSLVGk7QsXxQVPbs4XyHVtHw9oSTTXw1otEW",
    "3VW31dwix6k2EdzhDgZ2zB15J7FbHYQwAUqXgktRcJEX"
  ],
  "🟪solpot": ["FdDd6eCKiRTUDnQ9o466pDnpcks6kwPCVc1uqcMdScAf"],
  "🏳️‍🌈flip.gg": [
    "6pAzZNKeMFkWRDHRUENxs5uCArHwwNGcPonqSVVi4vS8",
    "GZL4NyJh4Cg6n3W4sDqqc8GFHrZ6gBKBmGEBmTAiHkAN",
    "8xJQoyW2gvT2nt2JaLYK5znBhNS2cG1G2rNYQFyLD5Gy"
  ],
  "🎁solcasino": [
    "CQ36xjMHgmgwEM1yvJYUWg3YxMvzwM4Mntn6vZrMk86z",
    "ArCyjcg4H61XPbsvKGLJJjtn34HVQaWYZKLgJS15v9G2"
  ],
  "🔺solana Casino": [
    "FZbc2drr4iN7Pn2tvSYS7Z5cYw6UZTNur7PzGDVB49jo",
    "Dxv6xykf5r2nugv1YXSJCRiAkiohNVZDkW6EwYr9Krvf"
  ],
  "🪙soltana coin flip": ["3dcewqBfwVAqjWGiX7ynCH4Sw4RwaQxQHzushnokY1qm"],
  "Ⓜ️Mwin": [
    "MWinVXj3HscKfwcdrJetvSgNFmEYPqC1NDxDd7vZqPd"
  ],
  "🔮Oracle": [
    "5iDZ59ARQiDuqgLmHv6qgfwW2RQ6gtVUQjbSPLYvN9iK"
  ],
  "🖼️NFT (okx)": ["okxMcn3a1DBWUV2ZJ4hHyh3hFJ9jjS2krmNKti6jEHr"],
  "🎨NFT (solana art)": [
    "E6dkaYhqbZN3a1pDrdbajJ9D8xA66LBBcjWi6dDNAuJH",
    "5ZfZAwP2m93waazg8DkrrVmsupeiPEvaEHowiUP7UAbJ",
    "BBP26c26sni7g6BegbUcXiNCdn6781sZaFHdgMVX7i6d",
    "CJsLwbP1iu5DuUikHEJnLfANgKy6stB2uFgvBBHoyxwz"
  ],
  "🖌️NFT (solsea)": [
    "BME3EDVYJFMe7RK25ne7G4D1wrEQWbkN8ca5UEnXJaoC",
    "6T4f5bdrd9ffTtehqAj9BGyxahysRGcaUZeDzA1XN52N",
    "617jbWo616ggkDxvW1Le8pV38XLbVSyWY8ae6QUmGBAU",
    "AARTcKUzLYaWmK7D1otgyAoFn5vQqBiTrxjwrvjvsVJa",
    "AartPja3v6PGKfzFPMH5N26Qg9Ew5DpAQux3y5K6AH3A",
    "AARtaGrVezbP5sxuWcGpthAmtZVQ912gRWxuYFzFP775",
    "2669GNmpdcRF2FmpjZmPtnpKD7L9tkFd92XSPEN85i45"
  ],
  "🔳Tensor": [
    "TCMPhJdwDryooaGtiocG1u3xcYbRpiJzb283XfCZsDp",
    "TAMM6ub33ij1mbetoMyVBLeKY5iP41i4UPUJQGkhfsg",
    "TSWAPaqyCSx2KABk68Shruf4rp7CxcNi8hAsbdwmHbN",
    "TL1ST2iRBzuGTqLn1KXnGdSnEow62BzPnGiqyRXhWtW",
    "TFEEgwDP6nn1s8mMX2tTNPPz8j2VomkphLUmyxKm17A",
    "VFeesufQJnGunv2kBXDYnThT1CoAYB45U31qGDe5QjU"
  ],
  "✨Magic Eden": [
    "M2mx93ekt1fmXSVkTrUL9xVFHkmME8HTUi5Cyc5aF7K",
    "MEisE1HzehtrDpAAT8PnLHjpSSkRYakotTuJRPjTpo8"
  ],
  "🧬Solayer": [
    "So1ayer111111111111111111111111111111111111",
    "sost9pW9S2p1W299W9S2p1W299W9S2p1W299W9S2p1"
  ],
  "🫧BlazeStake": [
    "stakY9pW9S2p1W299W9S2p1W299W9S2p1W299W9S2p",
    "bSOL6DZZC75p6TpsDxvBk2nJCqVFTbaYpXY896"
  ],
  "💠Sanctum": [
    "SP12tWFxD9oJs9iS9J5J9J5J9J5J9J5J9J5J9J5J9J5",
    "58P9v3uE9G4W9S2p1W299W9S2p1W299W9S2p1W299"
  ],
  "🏘️Kamino": [
    "KLend2g3cP87fffoy8q1mQqGKjrxjC8boSyAYavgmjD",
    "KMNo3nJsBXfcpJTVhZcXLW7RmTwTt4GVFE7suUBo9sS"
  ],
  "💸Solend": [
    "So1endDq2YkqhipRh3WViPa8hdiSpxWy6z3Z6tMCpAo"
  ],
  "📊MarginFi": [
    "MFv2hWf31Z9kbCa1snEPYctwafyhdvnV7FZnsebVacA"
  ],
  "📈Zeta Markets": [
    "ZETAxsqBRek56DhiGXrn75yj2NHU3aYUnxvHXpkf3aD"
  ],
  "🏡Parcl": [
    "PARCLhnGdRfPVbg2iwdYQk3xVKMYxu6vRPMEKnMrSq4"
  ],
  "🐬Orca": [
    "DjVE3J6u7jszV8wssw2B4z52ow7v59dTMVhGAr1kq8xd",
    "8FFVLJuzKN3GhXiVUmvwvJgLGpHqe51ZvbXjqJkP5Htu"
  ],
  "🔥Phoenix": [
    "PhoeNiXZ8ByJGLkxNfZDn2m3GEk7rG7XcHgfxnJdAJ8"
  ],
  "🧑‍🎤Lifinity": [
    "EhYXq3bLZjT4u23d2Z17QVrCNqaKn6WN5eXYVTy7zEoe"
  ],
  "🦆GooseFX": [
    "9EYr8bnSUo2z8P2D5uACN7EVrANqoRXotXtiC1iconvenience"
  ],
  "⚙️Aldrin": [
    "AldrinCJf5rqUvzBVtUL3R8wDkq5NBojVWNJWUqxKq4K"
  ],
  "🎯Step Finance": [
    "StepAscendantProgramV3StagVqQn6E6gH4FPepchFxrSKWY816"
  ],
  "🌙Saros": [
    "SarosCT2oNuKVfkJ38DCVvsfFYPWNJsyE3tqMCkh7Jk"
  ],
  "💎Crema Finance": [
    "CremaXRP1SujKHzGCkQEFDgqQ1Bc3mGqxiLfbMahNFgP"
  ],
  "🧑Mango Markets": [
    "98pjRr6KJWf4K98PsKFt1nZwdzExWaGkHRe6TQMnZJLK",
    "4skJ85cdxQAFVKbcg33NwBBcqwKmwFm4nqBTp3MJUUte"
  ],
  "⏺️Invariant": [
    "Invariant12345678901234567890123456789012"
  ],
  "🔬Dexlab": [
    "DexlabAb1234567890123456789012345678901234"
  ],
  "🤖marginfi)": [
    "MFv2hWf31Z9kbCa1snEPYctwafyhdvnV7FZnsebVacA",
    "LipsxuAkFkwa4RKNzn51wAsW7Dedzt1RNHMkTkDEZUW"
  ],
  "🌼bloom bot": ["b1oomGGqPKGD6errbyfbVMBuzSC8WtAAYo8MwNafWW1"],
  "🌪️drift v2": [
    "dRiftyHA39MWEi3m9aunc5MzRF1JYuBsbn6VPcn33UH",
    "JCNCMFXo5M5qwUPg2Utu1u6YWp3MbygxqBsBeXXJfrw"
  ],
  "☄️Meteora": [
    "24Uqj9JCLxUv9qbsP9Mhi1M4uH2gnp29JZ2vM59rT9M3",
    "LBUZKhSxHSNpC9vTme39P4fHLfc9gdC6yS98fU1iH2J"
  ],
  "🪐Jupiter": [
    "DCA265Vj8a9CEuX1eb1LWRnDT7uK6q1xMipnNyatn23M",
    "JUP6i4ov9QnJSvS4pT967kFGYfXN93j63d4HqY1b7E6",
    "Gv9Vp4p6E6gH4FPepchFxrSKWY8165FvM59rT9M3",
    "jupNjYaxXBR4G2baF8Q2zH9fL9f8dY7d9eE9eE9eE9e"
  ],
  "VOTE": [
    "voTpe3tHQ7AjQHMapgSue2HJFAh2cGsdokqN3XqmVSj"
  ],
  "🥩Stake": [
    "Config1111111111111111111111111111111111111",
    "Stake11111111111111111111111111111111111111",
    "J1pt9n29W9S2p1W299W9S2p1W299W9S2p1W299W9S2p"
  ],
  "🗳️Governance/Voting": [
    "Gvrn7777777777777777777777777777777777777",
    "Voter777777777777777777777777777777777777",
    "Vote111111111111111111111111111111111111111",
    "Figment11111111111111111111111111111111111",
    "Cofig7777777777777777777777777777777777777"
  ],
  "🏢Figment": [
    "CcaHc2L43ZWjwCHART3oZoJvHLAe9hzT2DJNUpBzoTN1"
  ],
  "🌌Galxe": [
    "HLP3NBBLUAoiDMM7A6YQjJzsZq5QfL2pbVndYBP9eChs",
    "7iaVeUa44wns7aVsRe9e1EuNqWQroQBckba2MyrcXHVX",
    "75qihQ3K2Wdhga4Lf2oGH4dCkYiXKQ7B3XEPzHBVJcoA",
    "CWa5AW7Rjy6LJmBHgfWciiTvrVpL5rGMeZZAMJEAk9sW",
    "HBd1GQKQCMdDwLiHpuouM4fmqyR1onPa3Km4t9Qttw5x",
    "YBHY7BF2qLRPHABKa78SMkUKJ6UfFU92mvsFvm4T3Kr",
    "DGsNktadFuCyNXTSHYbtSyetAp3XjCKh55TzEdFUvc3p",
    "FELHk34cHSAAZaK82W9nACc7z2faYurWB24xC5aMT7CL",
    "3iTvptxjbPbZQKYd5RxEpNJ199VDuasuVgsgm9gZaeTC",
    "BTzYuFPUTyXFQB6nHogMdHgtMYhV51ETGCUjwYVR4k9H"
  ],
  "🚀Star Atlas": [
    "BgiTVxW9uLuHHoafTd2qjYB5xjCc5Y1EnUuYNfmTwhvp",
    "HAWy8kV3bD4gaN6yy6iK2619x2dyzLUBj1PfJiihTisE",
    "6bD8mr8DyuVqN5dXd1jnqmCL66b5KUV14jYY1HSmnxTE",
    "36s6AFRXzE9KVdUyoJQ5y6mwxXw21LawYqqwNiQUMD8s",
    "G1bE9ge8Yoq43hv7QLcumxTFhHqFMdcL4y2d6ZdzMG4b",
    "4G85c5aUsRTrRPqE5VjY7ebD9b2ktTF6NEVGiCddRBDX",
    "7dr7jVyXf1KUnYq5FTpV2vCZjKRR4MV94jzerb8Fi16Q",
    "8EXX5kG7qWTjgpNSGX7PnB6hJZ8xhXUcCafVJaBEJo32",
    "Hfjgcs9ix17EwgXVVbKjo6NfMm2CXfr34cwty3xWARUm",
    "ATSPo9f9TJ3Atx8SuoTYdzSMh4ctQBzYzDiNukQDmoF7"
  ]
};

const ADDRESS_TO_PLATFORM = {};
Object.entries(PLATFORMS).forEach(([platform, addresses]) => {
  addresses.forEach(address => {
    ADDRESS_TO_PLATFORM[address] = platform;
  });
});

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

function isValidSolanaAddress(address) {
  if (!address || address.length < 32 || address.length > 44) return false;
  const base58Regex = /^[1-9A-HJ-NP-Za-km-z]+$/;
  return base58Regex.test(address);
}

function extractSolanaAddresses(text) {
  const lines = text.split("\n");
  const found = lines.map(s => {
    const walletMatch = s.match(/📌 Wallet:\s*([1-9A-HJ-NP-Za-km-z]{32,44})/);
    if (walletMatch) return walletMatch[1].trim();
    const genericMatch = s.match(/[1-9A-HJ-NP-Za-km-z]{32,44}/);
    return genericMatch ? genericMatch[0].trim() : s.trim();
  }).filter(s => isValidSolanaAddress(s));
  return [...new Set(found)];
}

async function fetchHeliusRaw(address, pageBefore = null) {
  if (ACTIVE_API_TEMPLATES.length === 0) {
    throw new Error("جميع روابط API معطلة حالياً");
  }

  for (let i = 0; i < ACTIVE_API_TEMPLATES.length; i++) {
    const apiTemplate = ACTIVE_API_TEMPLATES[i];
    const base = apiTemplate.replace("{address}", address);
    let url = `${base}${base.includes('?') ? '&' : '?'}limit=100`;
    if (pageBefore) url += `&before=${pageBefore}`;

    try {
      const resp = await fetch(url);
      if (resp.status === 401 || resp.status === 403) {
        ACTIVE_API_TEMPLATES.splice(i, 1);
        FAILED_API_KEYS.add(apiTemplate);
        i--;
        continue;
      }
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      return await resp.json();
    } catch (err) {
      if (i === ACTIVE_API_TEMPLATES.length - 1) throw err;
      await sleep(100);
    }
  }
}

function searchPlatformsInTransaction(tx, userAddress) {
  const txString = JSON.stringify(tx).toLowerCase();
  const userLower = userAddress.toLowerCase();
  const foundPlatforms = new Map();
  
  let txTotalAmount = 0;
  if (tx.nativeTransfers) {
    for (const transfer of tx.nativeTransfers) {
      if (transfer.fromUserAccount === userAddress || transfer.toUserAccount === userAddress) {
        txTotalAmount += transfer.amount / 1_000_000_000;
      }
    }
  }

  for (const [contract, platform] of Object.entries(ADDRESS_TO_PLATFORM)) {
    if (txString.includes(contract.toLowerCase()) && txString.includes(userLower)) {
      if (!foundPlatforms.has(platform)) {
        foundPlatforms.set(platform, { count: 1, amount: txTotalAmount });
      }
    }
  }

  return foundPlatforms;
}

async function analyzeAddress(address) {
  const platformsData = new Map();
  let beforeCursor = null;
  let totalTransactions = 0;

  for (let page = 0; page < 30; page++) {
    let data;
    try {
      data = await fetchHeliusRaw(address, beforeCursor);
    } catch (err) {
      break;
    }

    const txs = Array.isArray(data) ? data : data?.transactions || data?.data || [];
    totalTransactions += txs.length;

    if (txs.length === 0) break;

    for (const tx of txs) {
      const found = searchPlatformsInTransaction(tx, address);
      found.forEach((data, platform) => {
        if (!platformsData.has(platform)) {
          platformsData.set(platform, { count: 0, totalAmount: 0 });
        }
        const current = platformsData.get(platform);
        current.count += data.count;
        current.totalAmount += data.amount;
      });
    }

    if (txs.length < 100) break;
    const lastTx = txs[txs.length - 1];
    const lastSig = lastTx.signature || lastTx.transaction?.signatures?.[0];
    if (!lastSig) break;
    beforeCursor = lastSig;
    await sleep(30);
  }

  return { address, platformsData, transactionsChecked: totalTransactions };
}

const app = express();
const PORT = 5000;

app.get('/', (req, res) => res.send('Bot is running!'));
app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));

if (!TELEGRAM_BOT_TOKEN) {
  console.log('TELEGRAM_BOT_TOKEN not set.');
} else if (HELIUS_APIS.length === 0) {
  console.log('No RPC URLs configured.');
} else {
  const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });
  console.log('Telegram Bot started!');

  bot.onText(/\/start/, (msg) => {
    bot.sendMessage(msg.chat.id, `مرحباً! أرسل عناوين Solana للفحص.`);
  });

  bot.on('message', async (msg) => {
    if (msg.text && msg.text.startsWith('/')) return;
    const chatId = msg.chat.id;
    const addresses = extractSolanaAddresses(msg.text || '');

    if (addresses.length === 0) {
      bot.sendMessage(chatId, '❌ لم أجد أي عنوان Solana صالح.');
      return;
    }

    const statusMsg = await bot.sendMessage(chatId, `🔍 جاري فحص ${addresses.length} عنوان...`);

    let responseText = "";
    for (let i = 0; i < addresses.length; i++) {
      const addr = addresses[i];
      try {
        const result = await analyzeAddress(addr);
        if (result.platformsData.size > 0) {
          responseText += `📍 ${addr}\n`;
          result.platformsData.forEach((data, platform) => {
            const avg = data.count > 0 ? (data.totalAmount / data.count).toFixed(4) : "0.0000";
            responseText += `${platform}\n`;
            responseText += `‎عدد التفاعلات: ${data.count}\n`;
            responseText += `‎المبلغ الكامل: ${data.totalAmount.toFixed(4)}\n`;
            responseText += `‎متوسط المبلغ بكل معاملة: ${avg}\n`;
          });
          responseText += "____________________\n";
        } else {
          responseText += `📍 ${addr}\n➖ لا يوجد تفاعل (${result.transactionsChecked} معاملة)\n____________________\n`;
        }
      } catch (e) {
        responseText += `📍 ${addr}\n❌ خطأ في الفحص\n____________________\n`;
      }

      if (responseText.length > 3500 || i === addresses.length - 1) {
        await bot.sendMessage(chatId, responseText || "لا توجد نتائج نشطة.");
        responseText = "";
      }
    }
    bot.deleteMessage(chatId, statusMsg.message_id).catch(() => {});
  });
}
