import { AxiosError } from 'axios';

/**
 * Extrai a mensagem de erro de uma resposta de API
 */
export const extractApiErrorMessage = (error: any): string => {
  // Se for um erro do Axios
  if (error.isAxiosError) {
    const axiosError = error as AxiosError<any>;
    
    // Tenta obter a mensagem do corpo da resposta
    if (axiosError.response?.data) {
      if (typeof axiosError.response.data === 'string') {
        return axiosError.response.data;
      }
      
      // Verifica campos comuns de mensagem de erro
      if (axiosError.response.data.message) {
        return axiosError.response.data.message;
      }
      
      if (axiosError.response.data.error) {
        return axiosError.response.data.error;
      }
      
      if (axiosError.response.data.msg) {
        return axiosError.response.data.msg;
      }
    }
    
    // Verifica o status HTTP
    if (axiosError.response?.status) {
      switch (axiosError.response.status) {
        case 400:
          return 'Requisição inválida';
        case 401:
          return 'Não autorizado';
        case 403:
          return 'Acesso negado';
        case 404:
          return 'Recurso não encontrado';
        case 500:
          return 'Erro interno do servidor';
      }
    }
    
    // Mensagem genérica do Axios
    if (axiosError.message) {
      if (axiosError.message.includes('Network Error')) {
        return 'Erro de conexão. Verifique sua internet.';
      }
      return axiosError.message;
    }
  }
  
  // Se for um erro comum
  if (error instanceof Error) {
    return error.message;
  }
  
  // Fallback para qualquer outro tipo de erro
  return 'Ocorreu um erro inesperado';
};
