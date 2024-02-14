const {MongoClient} = require('mongodb')

const HOST = process.env.DB_HOST || "localhost"
const PORT = process.env.DB_PORT || "27017"
const DATABASE = process.env.DB_DATABASE || "files_manager"
const url = `mongodb://${HOST}:${PORT}`

/**
 * class to interact with our MongoDB
 */
class DBClient {
    constructor() {
        MongoClient.connect(url, (error, client)=>{
            if (!error) {
                this.db = client.db(DATABASE)
                this.files = this.db.collection('files')
                this.users = this.db.collection('users')
            } else {
                console.log(error);
                this.db = false;
            }
        })
    }

    isAlive() {
        return this.db
    }
    async nbUsers() {
        return this.users.countDocuments()
    }
    async nbFiles() {
        return this.files.countDocuments()
    }
}

const dbClient = new DBClient()
module.exports.dbClient = dbClient

const waitConnection = () => {
    return new Promise((resolve, reject) => {
        let i = 0;
        const repeatFct = async () => {
            await setTimeout(() => {
                i += 1;
                if (i >= 10) {
                    reject()
                }
                else if(!dbClient.isAlive()) {
                    repeatFct()
                }
                else {
                    resolve()
                }
            }, 1000);
        };
        repeatFct();
    })
};

(async () => {
    console.log(dbClient.isAlive());
    await waitConnection();
    console.log(dbClient.isAlive());
    console.log(await dbClient.nbUsers());
    console.log(await dbClient.nbFiles());
})();
