const router = require('express').Router();
const fs = require('fs');
const { parse } = require('csv-parse');
const Stock = require('./models/StockModel');

router.post('/api/upload', async (req, res) => {
    const { userId } = req.body
    const file = req.files.file

    try {

        await file.mv(`${__dirname}/storage/${userId}.csv`, err => {
            if (err) console.log(err)
        })

        const parser = parse({ columns: true }, async (err, records) => {
            if (err) console.log(err)

            records.forEach(async record => {
                const { id: transactionId, quantity, price, trade_typr: tradeType } = record
                const stock = new Stock({
                    userId,
                    transactionId: parseInt(transactionId),
                    quantity: parseInt(quantity),
                    price: parseInt(price),
                    tradeType
                })

                await stock.save()
            })
        });


        const result = await fs.createReadStream(`${__dirname}/storage/${userId}.csv`).pipe(parser);


        res.json({ success: true })
    } catch (err) {
        console.log(err)
    }
})

router.get('/api/average/:userId', async (req, res) => {

    const { userId } = req.params
    const averages = []
    try {
        const records = await Stock.find({ userId })

        const transactions = records.sort((a, b) => a.transactionId - b.transactionId);

        for (let i = 0; i < transactions.length; i++) {
            let sumQuantity = 0;
            let totalQuantity = 0;
            let sellQuantity = 0;

            if (transactions[i].tradeType === "BUY") {
                for (let j = 0; j <= i; j++) {
                    if (transactions[j].tradeType === "BUY") {
                        totalQuantity += transactions[j].quantity;
                        sumQuantity += transactions[j].quantity * transactions[j].price;
                    }
                }
            } else {
                sellQuantity = transactions[i].quantity;
                sellQuantity = transactions[i].quantity;
                let isSold = false;
                for (let j = 0; j < i; j++) {
                    if (transactions[j].tradeType === "BUY" && !isSold) {
                        if (transactions[j].quantity - sellQuantity >= 0) {
                            transactions[j].quantity = transactions[j].quantity - sellQuantity;

                            isSold = true;
                        } else {
                            sellQuantity -= transactions[j].quantity;
                            transactions[j].quantity = 0;
                        }
                    }
                    if (isSold) {
                        if (transactions[j].tradeType === "BUY") {
                            totalQuantity += transactions[j].quantity;
                            sumQuantity += transactions[j].quantity * transactions[j].price;
                        }
                    }
                }
            }

            totalAvg = sumQuantity / totalQuantity;
            await Stock.updateOne({ transactionId: transactions[i].transactionId }, { $set: { average: totalAvg } })
            averages.push(totalAvg);
        }

        res.json({ average: averages[averages.length - 1] })
    }
    catch (err) {
        console.log(err)
    }

})

router.get('/api/delete-data/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
        if (userId) {
            fs.unlinkSync(`${__dirname}/storage/${userId}.csv`);

            const result = await Stock.deleteMany({ userId }, (err) => {
                if (err) console.log(err)
            })

        }
    } catch (err) {
        console.log(err)
    }

    res.json({ success: true })
})

module.exports = router;
