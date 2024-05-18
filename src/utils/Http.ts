import axios, { AxiosResponse } from "axios";
import { GENERATION_API_URL } from "../config/Env";
import { globalLogger } from "./Logger";

/**
 * @description Fetches data from the API.
 * @param method The HTTP method to use. : "GET" | "POST" | "PUT" | "DELETE"
 * @param data The data to send.  : GenerationParamsI
 * @returns The response from the API.
 * @example
 * ```typescript
 * const response = await Fetcher("POST" , { text: "Hello, World!"});
 * console.log(response);
 * ```
 **/

export const Fetcher = async (
  method: "GET" | "POST" | "PUT" | "DELETE",
  data: any,
  path: string
): Promise<AxiosResponse | Error> => {
  try {
    const response = await axios({
    method :  method,
    url: `${GENERATION_API_URL}${path}`,
    data,
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
    },
    });

    return response.data;
  } catch (error) {      
    globalLogger.error(`Error fetching data from the API : ${error}`);
    return error as Error;
  }
};
