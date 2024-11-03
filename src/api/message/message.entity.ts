
export interface Message {
    MessaggioID: string;
    DataOraInvio: Date;
    ValoreMisurato : number;
    DeviceIDDestinatario : string;
    RicevutoDalDispositivo  : Boolean;
}

export interface DataValue {
    average: number;
    min: number;
    max: number;
}