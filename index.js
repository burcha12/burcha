const TelegramBot = require('node-telegram-bot-api');
const express = require('express');

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

const HELIUS_APIS = [
  process.env.RPC_URL || "",
  process.env.RPC_URL2 || "",
  process.env.RPC_URL3 || ""
].filter(url => url.length > 0);

const PLATFORMS = {
  "luck.io": [
    "yYWjk6ycNwCPYAjqykJYYDK12geW9JBRi3RqZHu4Rmt",
    "E1f2ZX387tP8MJweeVRqhrShs8Ge8hpZnJeNGEFKQ7kN",
    "AQZdYsg36tEn8ZJ7RKSSLbUSLoGPBi71TCLruCDepYom",
    "4xMajQJ7GSyUpRK2iyaQDN8vHnZpow8NZWuPjeWoYYBc"
  ],
  "rugs.fun": ["8VVe4Lk5veqnsmGzc8UZaue7S9vywBYf4Cgw8LXW7Tg"],
  "solpump": [
    "3MBwwCXXnGFLXgP73kAUCPw7XdEzX8YL4Kjy16Gggrtk",
    "6YVBrao9DSLVGk7QsXxQVPbs4XyHVtHw9oSTTXw1otEW",
    "3VW31dwix6k2EdzhDgZ2zB15J7FbHYQwAUqXgktRcJEX"
  ],
  "solpot": ["FdDd6eCKiRTUDnQ9o466pDnpcks6kwPCVc1uqcMdScAf"],
  "flip.gg": [
    "6pAzZNKeMFkWRDHRUENxs5uCArHwwNGcPonqSVVi4vS8",
    "GZL4NyJh4Cg6n3W4sDqqc8GFHrZ6gBKBmGEBmTAiHkAN",
    "8xJQoyW2gvT2nt2JaLYK5znBhNS2cG1G2rNYQFyLD5Gy"
  ],
  "solcasino": [
    "CQ36xjMHgmgwEM1yvJYUWg3YxMvzwM4Mntn6vZrMk86z",
    "ArCyjcg4H61XPbsvKGLJJjtn34HVQaWYZKLgJS15v9G2"
  ],
  "solana Casino": [
    "FZbc2drr4iN7Pn2tvSYS7Z5cYw6UZTNur7PzGDVB49jo",
    "Dxv6xykf5r2nugv1YXSJCRiAkiohNVZDkW6EwYr9Krvf"
  ],
  "soltana coin flip": ["3dcewqBfwVAqjWGiX7ynCH4Sw4RwaQxQHzushnokY1qm"],
  "oracle": ["5iDZ59ARQiDuqgLmHv6qgfwW2RQ6gtVUQjbSPLYvN9iK"],
  "NFT (okx)": ["okxMcn3a1DBWUV2ZJ4hHyh3hFJ9jjS2krmNKti6jEHr"],
  "NFT (solana art)": [
    "E6dkaYhqbZN3a1pDrdbajJ9D8xA66LBBcjWi6dDNAuJH",
    "5ZfZAwP2m93waazg8DkrrVmsupeiPEvaEHowiUP7UAbJ",
    "BBP26c26sni7g6BegbUcXiNCdn6781sZaFHdgMVX7i6d",
    "CJsLwbP1iu5DuUikHEJnLfANgKy6stB2uFgvBBHoyxwz"
  ],
  "NFT (solsea)": [
    "BME3EDVYJFMe7RK25ne7G4D1wrEQWbkN8ca5UEnXJaoC",
    "6T4f5bdrd9ffTtehqAj9BGyxahysRGcaUZeDzA1XN52N",
    "617jbWo616ggkDxvW1Le8pV38XLbVSyWY8ae6QUmGBAU",
    "AARTcKUzLYaWmK7D1otgyAoFn5vQqBiTrxjwrvjvsVJa",
    "AartPja3v6PGKfzFPMH5N26Qg9Ew5DpAQux3y5K6AH3A",
    "AARtaGrVezbP5sxuWcGpthAmtZVQ912gRWxuYFzFP775",
    "2669GNmpdcRF2FmpjZmPtnpKD7L9tkFd92XSPEN85i45"
  ],
  "Defi (marginfi)": [
    "MFv2hWf31Z9kbCa1snEPYctwafyhdvnV7FZnsebVacA",
    "LipsxuAkFkwa4RKNzn51wAsW7Dedzt1RNHMkTkDEZUW"
  ],
  "Defi (bloom bot)": ["b1oomGGqPKGD6errbyfbVMBuzSC8WtAAYo8MwNafWW1"],
  "Defi (drift v2)": [
    "dRiftyHA39MWEi3m9aunc5MzRF1JYuBsbn6VPcn33UH",
    "JCNCMFXo5M5qwUPg2Utu1u6YWp3MbygxqBsBeXXJfrw"
  ],
  "Galxe": [
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
  "Star Atlas": [
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
  ],
  "Jupiter": ["DCA265Vj8a9CEuX1eb1LWRnDT7uK6q1xMipnNyatn23M"]
};

const ADDRESS_TO_PLATFORM = {};
Object.entries(PLATFORMS).forEach(([platform, addresses]) => {
  addresses.forEach(address => {
    ADDRESS_TO_PLATFORM[address] = platform;
  });
});

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

function extractSolanaAddresses(text) {
  const regex = /[1-9A-HJ-NP-Za-km-z]{32,44}/g;
  const matches = text.match(regex) || [];
  return [...new Set(matches)];
}

async function fetchHeliusRaw(apiTemplate, address, pageBefore = null) {
  const base = apiTemplate.replace("{address}", address);
  let url = `${base}${base.includes('?') ? '&' : '?'}limit=100`;
  if (pageBefore) url += `&before=${pageBefore}`;

  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const resp = await fetch(url);
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      return await resp.json();
    } catch (err) {
      if (attempt === 2) throw err;
      await sleep(500 * attempt);
    }
  }
}

function searchPlatformsInTransaction(tx, userAddress) {
  const txString = JSON.stringify(tx).toLowerCase();
  const userLower = userAddress.toLowerCase();
  const foundPlatforms = new Set();

  for (const [contract, platform] of Object.entries(ADDRESS_TO_PLATFORM)) {
    const contractLower = contract.toLowerCase();
    if (txString.includes(contractLower) && txString.includes(userLower)) {
      foundPlatforms.add(platform);
    }
  }

  return Array.from(foundPlatforms);
}

async function analyzeAddress(address, apiTemplate) {
  const platformsFound = new Set();
  let beforeCursor = null;
  let totalTransactions = 0;

  for (let page = 0; page < 80; page++) {
    let data;
    try {
      data = await fetchHeliusRaw(apiTemplate, address, beforeCursor);
    } catch (err) {
      break;
    }

    const txs = Array.isArray(data) ? data : data?.transactions || data?.data || [];
    totalTransactions += txs.length;

    if (txs.length === 0) break;

    for (const tx of txs) {
      const platforms = searchPlatformsInTransaction(tx, address);
      platforms.forEach(platform => platformsFound.add(platform));
    }

    if (txs.length < 100) break;

    const lastTx = txs[txs.length - 1];
    const lastSig = lastTx.signature || lastTx.transaction?.signatures?.[0];
    if (!lastSig) break;

    beforeCursor = lastSig;
    await sleep(30);
  }

  return {
    address,
    platforms: Array.from(platformsFound),
    transactionsChecked: totalTransactions
  };
}

const app = express();
const PORT = 5000;

app.get('/', (req, res) => {
  res.send('Bot is running!');
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', bot: !!TELEGRAM_BOT_TOKEN });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});

if (!TELEGRAM_BOT_TOKEN) {
  console.log('TELEGRAM_BOT_TOKEN not set. Bot will not start.');
} else if (HELIUS_APIS.length === 0) {
  console.log('No RPC URLs configured. Please set RPC_URL, RPC_URL2, RPC_URL3');
} else {
  const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });
  console.log('Telegram Bot started!');
  console.log(`Configured ${HELIUS_APIS.length} RPC endpoints`);

  bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId,
      `مرحباً! أنا بوت فحص عناوين Solana

أرسل لي عنوان Solana واحد أو أكثر وسأقوم بفحصه للتحقق من تفاعله مع المنصات المختلفة.

يمكنك إرسال:
- عنوان واحد
- عدة عناوين (كل عنوان في سطر منفصل)
- نص يحتوي على عناوين مختلطة (سأقوم بتنظيفها تلقائياً)

المنصات المدعومة: ${Object.keys(PLATFORMS).join(', ')}`
    );
  });

  bot.on('message', async (msg) => {
    if (msg.text && msg.text.startsWith('/')) return;
    
    const chatId = msg.chat.id;
    const text = msg.text || '';

    const addresses = extractSolanaAddresses(text);

    if (addresses.length === 0) {
      bot.sendMessage(chatId, '❌ لم أجد أي عنوان Solana صالح في رسالتك.');
      return;
    }

    const statusMsg = await bot.sendMessage(chatId, 
      `🔍 جاري فحص ${addresses.length} عنوان...\nقد يستغرق هذا بعض الوقت.`
    );

    const results = [];
    let completed = 0;

    for (const address of addresses) {
      try {
        const apiIndex = completed % HELIUS_APIS.length;
        const result = await analyzeAddress(address, HELIUS_APIS[apiIndex]);
        results.push(result);
        completed++;

        if (completed % 5 === 0 || completed === addresses.length) {
          bot.editMessageText(
            `🔍 جاري الفحص... ${completed}/${addresses.length}`,
            { chat_id: chatId, message_id: statusMsg.message_id }
          ).catch(() => {});
        }

        await sleep(100);
      } catch (error) {
        results.push({
          address,
          platforms: [],
          transactionsChecked: 0,
          error: true
        });
        completed++;
      }
    }

    let response = `✅ تم فحص ${addresses.length} عنوان\n\n`;

    const activeResults = results.filter(r => r.platforms.length > 0);
    const inactiveResults = results.filter(r => r.platforms.length === 0 && !r.error);
    const errorResults = results.filter(r => r.error);

    if (activeResults.length > 0) {
      response += `🎯 عناوين نشطة (${activeResults.length}):\n`;
      for (const r of activeResults) {
        const shortAddr = r.address.slice(0, 8) + '...' + r.address.slice(-4);
        response += `\n📍 ${shortAddr}\n`;
        response += `   المنصات: ${r.platforms.join(', ')}\n`;
        response += `   المعاملات: ${r.transactionsChecked}\n`;
      }
    }

    if (inactiveResults.length > 0) {
      response += `\n➖ عناوين بدون تفاعل: ${inactiveResults.length}`;
    }

    if (errorResults.length > 0) {
      response += `\n❌ أخطاء: ${errorResults.length}`;
    }

    if (response.length > 4000) {
      const chunks = response.match(/.{1,4000}/gs) || [];
      for (const chunk of chunks) {
        await bot.sendMessage(chatId, chunk);
        await sleep(100);
      }
    } else {
      bot.sendMessage(chatId, response);
    }

    bot.deleteMessage(chatId, statusMsg.message_id).catch(() => {});
  });
}
