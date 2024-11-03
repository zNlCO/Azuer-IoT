import 'reflect-metadata';
import app from './app';
import { CosmosClient } from '@azure/cosmos';
import 'dotenv/config'

// Configurazione della connessione a CosmosDB
const client = new CosmosClient({
    endpoint: process.env.COSMOS_ENDPOINT!,
    key: process.env.COSMOS_KEY!
});


export let container;
async function connectToCosmosDB() {
    try {
        // Creazione o accesso al database e al container
        const { database } = await client.databases.createIfNotExists({ id: "miodatabase" });
        const containerResponse = await database.containers.createIfNotExists({
            id: process.env.COSMOS_CONTAINER!,
            partitionKey: { paths: [process.env.COSMOS_PARTITION_KEY!] }
        });

        container = containerResponse.container;

        console.log(`Connected to database: ${database.id}`);
        console.log(`Connected to container: ${container.id}`);

        // Avvio del server
        app.listen(3000, () => {
            console.log('Server listening on port 3000');
        });
    } catch (err) {
        console.error('Failed to connect to CosmosDB:', err);
    }
}

// Avvia la connessione al database e il server
connectToCosmosDB();
