import { getPendingItems, markAsDone } from './offlineQueue';
import { authService } from '../auth/authService.js';

export async function processQueue() {

  if (!navigator.onLine) {
    console.log('Offline, aguardando conexão para processar a fila...');
    return;
  }

  const pendingItems = await getPendingItems();

  for(const item of pendingItems) {
    try {
       const token = await authService.acquireSharePointToken();

       const baseUrl = "https://mmmalufconsultoria.sharepoint.com/sites/ServidorGeraoBancria/_api";

       switch (item.type) {

        case "reprove": {

          const nomeDoArquivo =
            item.fileUrl.split("/").pop();

          await fetch(
            `${baseUrl}/Web/GetFileByServerRelativePath(decodedurl='${item.fileUrl}')/MoveTo(newUrl='${item.destino}/${nomeDoArquivo}',flags=1)`,
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json;odata=verbose"
              }
            }
          );

          break;
        }

        case "approve": {

          const nomeDoArquivo =
            item.fileUrl.split("/").pop();

          await fetch(
            `${baseUrl}/Web/GetFileByServerRelativePath(decodedurl='${item.fileUrl}')/MoveTo(newUrl='${item.destino}/${nomeDoArquivo}',flags=1)`,
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json;odata=verbose"
              }
            }
          );

          break;
        }
      }

      await markAsDone(item.id);

    } catch (error) {

      console.error(
        `Erro ao processar item ${item.id}`,
        error
      );

    }
  }
}
