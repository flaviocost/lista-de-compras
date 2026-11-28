export type ItemCompra = {
    id: string;
    nome: string;
    quantidade: number; 
    precoUnitarioCentavos: number;
};

export type ListaCompras = {
  id: string;
  nome: string;
  produtos: ItemCompra[];
};