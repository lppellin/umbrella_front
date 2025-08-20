export function formatCpf(cpf: string) {
    let cpfOnlyDigits = cpf.replace(/\D/g, ''); 

    cpfOnlyDigits = cpfOnlyDigits.slice(0, 11)
   
    const formattedCpf = cpfOnlyDigits
      .replace(/(\d{3})(\d)/, '$1.$2') 
      .replace(/(\d{3})(\d)/, '$1.$2') 
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2'); 
    
    return formattedCpf
}