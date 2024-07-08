import { readFileSync } from "fs";
import 'dotenv/config';
import axios from 'axios';
import pg from 'pg';


const config = {
    connectionString:
        `postgres://candidate:${process.env.DB_PASSWORD}@rc1b-r21uoagjy1t7k77h.mdb.yandexcloud.net:6432/db1`,
    ssl: {
        rejectUnauthorized: true,
        ca: readFileSync(process.env.DB_CERTIFICATE_PATH)
        .toString(),
    },
};

async function loadCharacters(dbClient) {
    try {
        await dbClient.query(
            `CREATE TABLE IF NOT EXISTS ${process.env.DB_TABLE_NAME} (
                id SERIAL PRIMARY KEY,
                name TEXT,
                data JSONB
            )`
        );

        const response = await axios.get('https://rickandmortyapi.com/api/character');
        const characters = response.data.results;

        for (const character of characters) {
            await dbClient.query(
                `INSERT INTO ${process.env.DB_TABLE_NAME} (name, data) VALUES ($1, $2)`,
                [character.name, character]
            );
        }

        console.log('Characters loaded successfully');
    } catch (error) {
        console.log('Error while loading characters:', error);
    }
}


async function main() {
    const dbClient = new pg.Client(config);
    dbClient.connect((err) => {
        if (err) throw err;
    });
    
    dbClient.query("SELECT version()", (err, q) => {
        if (err) throw err;
        console.log(q.rows[0]);
        dbClient.end();
    });

    // try {
    //     await dbClient.connect();
        
    //     // await loadCharacters(dbClient);
    //     dbClient.query("SELECT version()", (err, q) => {
    //         if (err) throw err;
    //         console.log(q.rows[0]);
    //         dbClient.end();
    //     });
        
    // } catch (error) {
    //     console.log('Error while connecting to db:', error);
    // } finally {
    //     await dbClient.end();
    // }
}

main();