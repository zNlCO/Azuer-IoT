import { DataValue, Message } from "./message.entity"; // Ensure the path is correct
import { Client } from "azure-iothub"; // Correct import for the IoT Hub Client
import { Client as ClientDevice, Message as MessageIoT } from "azure-iot-device";
import { Mqtt } from "azure-iot-device-mqtt";
import { container } from "../../index"; // Import the container
import { getMinMax } from "./message.controller";

// Create a client to interact with the IoT Hub
const connectionString = "HostName=bobhub4.azure-devices.net;DeviceId=devicePAOLINI;SharedAccessKey=b5V5bVdO7sTV8msVaTyrREre5uXjjJ/mJB6aPsKmUB4="; 

const client = ClientDevice.fromConnectionString(connectionString, Mqtt);

export const messageService = {

    async send(message: Message): Promise<void> {
        try {
            // Create a message object with only the measured value
            const iotMessage = new MessageIoT(JSON.stringify(message));

            // Send the message to the device
            client.sendEvent(iotMessage, (err) => {
                if (err) {
                    console.error("Error sending telemetry:", err);
                } else {
                    console.log("Telemetry sent:", iotMessage);
                }
            });
        } catch (error) {
            console.error("Error sending message: ", error);
            throw new Error("Failed to send message to device");
        }
    },

    async save(message: Message): Promise<void> {
        await container.items.create(message);
    },

    async fetch(): Promise<Message[]> {
        const { resources: messages }  = await container.items.query({
            query: "SELECT * FROM c"
        }).fetchAll();
        return messages;
    },

    async getMinMax(valMin: number, valMax: number): Promise<Message[]> {
        const messages = await container.items
        .query({
            query: "SELECT * FROM c WHERE c.ValoreMisurato >= @valMin AND c.ValoreMisurato <= @valMax",
            parameters: [
                { name: "@valMin", value: valMin },
                { name: "@valMax", value: valMax }
            ]
        })
        .fetchAll();
        return messages;
    },

    async getByDate(startDate: Date, endDate: Date): Promise<Message[]> {
        // Formattiamo le date in formato ISO per la query
        const start = startDate.toISOString();
        const end = endDate.toISOString();
    
        const query = `SELECT * FROM c 
                       WHERE c.DataOraInvio >= @startDate AND c.DataOraInvio <= @endDate`;
    
        const { resources: messages } = await container.items.query({
            query: query,
            parameters: [
                { name: "@startDate", value: start },
                { name: "@endDate", value: end }
            ]
        }).fetchAll();
    
        return messages;
    },

    async getMessageCount(): Promise<number> {
        const { resources: messages } = await container.items
        .query({
            query: "SELECT VALUE COUNT(c) FROM c"
        })
        .fetchAll();
        return messages[0];
    },

    async getDataFromValues(): Promise<DataValue> {
        const { resources: messages } = await container.items.query({
            query: "SELECT c.ValoreMisurato FROM c"
        })
        .fetchAll();


        const values = messages.map(message => parseFloat(message.ValoreMisurato));

        const min = Math.min(...values);
        const max = Math.max(...values);
        const average = values.reduce((acc, val) => acc + val, 0) / values.length;

        const data: DataValue = {
            average: average,
            min,
            max
        };

        return data;
    },
    
    async getMessageNotRecieved(): Promise<Message[]> {
        const messages = await container.items
        .query({
            query: "SELECT * FROM c WHERE c.RicevutoDalDispositivo = false"
        })
        .fetchAll();
        return messages;
    },

    async setRecieved(MessaggioID: string): Promise<void> {
        // 1. Leggi il documento dal database
        const { resources: messages } = await container.items
            .query({
                query: "SELECT * FROM c WHERE c.MessaggioID = @MessaggioID",
                parameters: [
                    { name: "@MessaggioID", value: MessaggioID }
                ]
            })
            .fetchAll();
    
        // Verifica se il messaggio esiste
        if (messages.length === 0) {
            throw new Error(`Messaggio con ID ${MessaggioID} non trovato`);
        }
    
        const message = messages[0]; // Prendi il primo messaggio trovato
    
        // 2. Aggiorna il campo RicevutoDalDispositivo
        message.RicevutoDalDispositivo = true;
    
        // 3. Salva nuovamente il documento
        await container.items.upsert(message);
    }
};
