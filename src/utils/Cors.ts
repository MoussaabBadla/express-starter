import { CorsOptions } from "cors";
import { ORIGINS } from "../config/Env";

export const ProductionCors: CorsOptions = {
    origin: (origin, callback) => {
         // TODO: Add the accepted origins here after front-end is deployed
        // const origin_accepted = origin && origin.match((ORIGINS ?? origin) + "$");
        // if (origin_accepted) {
        //     callback(null, origin);
        // } else {
        //     callback(new Error("Request's origin not accepted."));
        // } 
        callback(null, origin);
    },
    credentials: true,
};
export const DevCors: CorsOptions = {
    origin: (origin, callback) => {
        callback(null, origin);
    },
    credentials: true,
};
