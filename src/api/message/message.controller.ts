import { NextFunction, Request, Response } from "express";
import { Message } from "./message.entity";
import { messageService } from "./message.service";
import { v4 as uuidv4 } from "uuid"; 

export const sendMessage = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { ValoreMisurato,DeviceIDDestinatario } = req.body;

      const DataOraInvio = new Date();
      const MessaggioID = uuidv4();
      const RicevutoDalDispositivo = false

      const newMessage: Message = {
        MessaggioID,
        DataOraInvio,
        ValoreMisurato,
        DeviceIDDestinatario,
        RicevutoDalDispositivo
      };
  
      messageService.send(newMessage)
      .then(() => {
        messageService.save(newMessage);
        console.log("Message saved")
      })
      .catch((err) => {
        console.error("Error sending message: ", err);
        throw new Error("Failed to send message to device");
      });



      res.json({response: "Message sended successfully"});
    } catch(err) {
      next(err);
    }
  }

  export const fetch = async (req: Request, res: Response, next: NextFunction) => {
    try {
  
      const result = await messageService.fetch();

      res.json(result);
    } catch(err) {
      next(err);
    }

    
  }


export const getMinMax = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { valMin, valMax } = req.body;

    const result = await messageService.getMinMax(valMin, valMax);

    res.json(result);
  } catch(err) {
    next(err);
  }
}


export const getByDate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { dateMin, dateMax } = req.body;

    const start = new Date(dateMin);
    const end = new Date(dateMax);

    const result = await messageService.getByDate(start, end);

    res.json(result);
  } catch(err) {
    next(err);
  }
}

export const getMessageCount = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await messageService.getMessageCount();

    res.json(result); 
  } catch(err) {
    next(err);
  }
}

export const getDataFromValues = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await messageService.getDataFromValues();

    res.json(result);
  } catch(err) {
    next(err);
  }
}

export const getMessageNotRecieved = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await messageService.getMessageNotRecieved();

    res.json(result);
  } catch(err) {
    next(err);
  }
}

export const setRecieved = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { MessaggioID } = req.body;

    await messageService.setRecieved(MessaggioID);

    res.json("Messaggio aggiornato");
  } catch(err) {  
    next(err);  
  }
}