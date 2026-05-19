import { PublicClientApplication } from "@azure/msal-browser";
import { msalConfig, loginRequest } from "./authConfig";

class AuthService {
    constructor() {
        this.msalInstance = new PublicClientApplication(msalConfig);
        
        // Guarda a promise E dispara evento quando resolver
        this._ready = this.msalInstance.handleRedirectPromise()
            .then((result) => {
                if (result?.account) {
                    // Redireciona retornou com conta — avisa a app
                    window.dispatchEvent(new Event('msal:loginSuccess'));
                }
            })
            .catch(() => {});
    }

    // Novo método: aguarda o MSAL estar pronto e retorna se tem conta
    async isAuthenticated() {
        await this._ready;
        return !!this.getAccount() || !!this.getCredentialAccount();
    }

    async loginWithEmailPassword(email, password) {
        const url = `https://login.microsoftonline.com/${this._tenantId}/oauth2/v2.0/token`;

        const body = new URLSearchParams({
            grant_type: "password",
            client_id: this._clientId,
            scope: "openid profile email User.Read",
            username: email,
            password: password,
        });

        try {
            const response = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: body.toString(),
            });

            const data = await response.json();

            if (!response.ok) {
                console.error("ROPC error:", data);
                // data.error_description tem a mensagem de erro do Azure
                return { success: false, error: data.error_description || "Credenciais inválidas." };
            }

            // Salva o token para uso posterior (acquireToken vai usar isso)
            this._credentialSession = {
                accessToken: data.access_token,
                idToken: data.id_token,
                expiresAt: Date.now() + data.expires_in * 1000,
                username: email,
            };

            return { success: true, session: this._credentialSession };

        } catch (error) {
            console.error("Login request failed:", error);
            return { success: false, error: "Erro de conexão." };
        }
    }

    // Retorna o token salvo (email/senha ou MSAL)
    getAccessToken() {
        if (this._credentialSession?.accessToken) {
            return this._credentialSession.accessToken;
        }
        return null;
    }

    // Verifica se tem sessão ativa por credencial
    getCredentialAccount() {
        return this._credentialSession ?? null;
    }
    
    async login() {
        await this._ready;
        try {
            const loginResponse = await this.msalInstance.loginPopup(loginRequest);
            return loginResponse;
        } catch (error) {
            console.error("Login failed:", error);
            return null;
        }
    }

    async logout() {
        await this._ready;
        try {
            await this.msalInstance.logoutPopup();
        } catch (error) {
            console.error("Logout failed:", error);
        }
    }

    getAccount() {
        const accounts = this.msalInstance.getAllAccounts();
        return accounts.length > 0 ? accounts[0] : null;
    }

    async acquireSharePointToken() {
        await this._ready;
        const account = this.getAccount();
        if (!account) return null;

        const tokenRequest = {
            scopes: ["https://mmmalufconsultoria.sharepoint.com/.default"],
            account: account,
        };

        try {
            const tokenResponse = await this.msalInstance.acquireTokenSilent(tokenRequest);
            return tokenResponse.accessToken;
        } catch (error) {
            console.warn("Silent token acquisition failed, trying popup:", error);
            try {
                const tokenResponse = await this.msalInstance.acquireTokenPopup(tokenRequest);
                return tokenResponse.accessToken;
            } catch (popupError) {
                console.error("Token acquisition via popup failed:", popupError);
                return null;
            }
        }
    }

    async acquireToken() {
        await this._ready;
        const account = this.getAccount();
        if (!account) return null;

        const tokenRequest = {
            scopes: ["User.Read"],
            account: account,
        };

        try {
            const tokenResponse = await this.msalInstance.acquireTokenSilent(tokenRequest);
            return tokenResponse.accessToken;
        } catch (error) {
            console.warn("Silent token acquisition failed, trying popup:", error);
            try {
                const tokenResponse = await this.msalInstance.acquireTokenPopup(tokenRequest);
                return tokenResponse.accessToken;
            } catch (popupError) {
                console.error("Token acquisition via popup failed:", popupError);
                return null;
            }
        }
    }
}

export const authService = new AuthService();