import axios from "axios";
import { PublicClientApplication } from "@azure/msal-browser";
import { msalConfig } from "@/auth/authConfig";

const msalInstance = new PublicClientApplication(msalConfig);

const sharepointApi = axios.create({
  baseURL:
    "https://mmmalufconsultoria.sharepoint.com/sites/ServidorGeraoBancria/_api",

  headers: {
    Accept: "application/json;odata=verbose",
    "Content-Type": "application/json"
  }
});

/*
  Interceptor para adicionar token automaticamente
*/
sharepointApi.interceptors.request.use(
  async (config) => {
    const accounts = msalInstance.getAllAccounts();

    if (accounts.length > 0) {
      try {
        const response = await msalInstance.acquireTokenSilent({
          account: accounts[0],
          scopes: [
            "Sites.ReadWrite.All",
            "User.Read"
          ]
        });

        if (response?.accessToken) {
          config.headers.Authorization = `Bearer ${response.accessToken}`;
        }
      } catch (error) {
        console.error("Erro ao obter token:", error);
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default sharepointApi;