const http = require('http')
const fs = require("fs");
const MongoClient = require("mongodb").MongoClient;
const host = '127.0.0.1'
const port = 7000

function notFound(res) {
    res.statusCode = 404
    res.setHeader('Content-Type', 'text/plain')
    res.end('Not found\n')
}

const client = new MongoClient("mongodb://localhost:27017/");

// async function getCollection() {
//     let info
//     try {
//         await client.connect();
//         const db = client.db("db");
//         const collection = db.collection("data");
//         info = await collection.find().toArray();
//         await client.close();
//     } catch (err) {
//         console.log(err);
//     } finally {
//         await client.close();
//     }
//     return info
// }
//
// let inf;
// getCollection().then(d => {
//     inf = d
// })

let inf = JSON.parse(fs.readFileSync("db.json", "utf8"));

const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, GET",
    "Access-Control-Max-Age": 2592000
}

http.createServer((req, res) => {
    switch (req.method) {
        case 'GET': {
            switch (req.url) {
                case '/info': {
                    let ans = {
                        msg:'ok',
                        inf:inf
                    }
                    res.writeHead(200, headers);
                    res.end(JSON.stringify(ans))
                    break
                }
                default: {
                    notFound(res)
                    break
                }
            }
            break
        }
        default: {
            notFound(res)
            break
        }
    }
}).listen(port, host, () => {
    console.log(`Server listens http://${host}:${port}`)
})