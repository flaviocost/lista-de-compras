
import { useState } from "react";
import type { FormEvent } from "react";
import type { ItemCompra } from "./item";

export default function App() {

  //formulário
  const [nome, setNome] = useState ("");
  const [preco, setPreco] = useState("");
  const [quantidade, setQuantidade] = useState("");

  //parte da lista de produtos
  const [lista, setLista] = useState<ItemCompra[]>([]);

  //essa parte guarda o produto que ta sendo editado
  const [produtoEditado, setProdutoEditado] = useState<string | null>(null);

  //formata o valor em reais (R$)
  function formatarDinheiro(valor : number){
    return (valor / 100).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

//essa parte limpa os campos do formulário
function limparFormulario(){
  setNome("");
  setPreco("");
  setQuantidade("");
  setProdutoEditado(null);
}

//essa parte vai adicionar ou atualizar um produto
function adicionarProduto (evento: FormEvent<HTMLFormElement>){
  evento.preventDefault();

  const nomeLimpo = nome.trim();
  const valor = Number(preco);
  const qtd = Number(quantidade);

  //verifica se os dados estão corretos
  if(
    nomeLimpo === "" ||
    preco.trim() === "" ||
    quantidade.trim() === "" ||
    !Number.isFinite(valor) ||
    !Number.isInteger(qtd) ||
    valor <= 0 ||
    qtd <= 0
  ){
    alert("Preencha os campos com valores válidos.");
    return;
  }

const precoCentavos = Math.round(valor * 100);

// Atualiza o produto selecionado
 if (produtoEditado !== null) {
  
      setLista((produtos) =>
        produtos.map((produto) =>
          produto.id === produtoEditado
            ? {
                ...produto,
                nome: nomeLimpo,
                precoUnitarioCentavos: precoCentavos,
                quantidade: qtd,
              }
            : produto
        )
      );
    } else {
      // Cria um novo produto
      const novoProduto: ItemCompra = {
        id: crypto.randomUUID(),
        nome: nomeLimpo,
        precoUnitarioCentavos: precoCentavos,
        quantidade: qtd,
      };

      setLista((produtos) => [...produtos, novoProduto]);
    }

    limparFormulario();
  }

  //parte que coloca os dados do produto no formulário
  function editarProduto(produto: ItemCompra){
    setNome(produto.nome);
    setPreco((produto.precoUnitarioCentavos / 100).toFixed(2));
    setQuantidade(String(produto.quantidade));
    setProdutoEditado(produto.id);
  }

//parte que remove um produto da lista
function removerProduto(id: string) {
  const confirmar = window.confirm("Certeza que deseja remover esse produto?");

if (!confirmar) return;

 setLista((produtos) =>
      produtos.filter((produto) => produto.id !== id)
    );

    if(produtoEditado === id){
      limparFormulario();
    }
  }    

//parte que calcula o valor total da compra
const totalCentavos = lista.reduce((total, produto) => {
  if (produto.id === produtoEditado) {
    const precoAtual = Number(preco);
    const quantidadeAtual = Number(quantidade);

        if (preco.trim() !== "" && quantidade.trim() !== "") {
      return total +
        Math.round(precoAtual * 100) * quantidadeAtual;
    }
  }

  return total +
  produto.precoUnitarioCentavos * produto.quantidade;
}, 0);

//parte que soma o formulario quando for um produto novo
const totalFinal =
  totalCentavos +
  (produtoEditado === null &&
  preco.trim() !== "" &&
  quantidade.trim() !== ""
    ? Math.round(Number(preco) * 100) * Number(quantidade)
    : 0);




  return (
    <>
    <h1>Lista de Compras</h1>

    <form onSubmit={adicionarProduto}>

      <h2>
        {produtoEditado !== null
        ? "Editar produto"
      : "Adicione o produto"}
      </h2>

      <div>
        <label htmlFor="nome">Nome do produto</label>
        <br />
        <input
        id="nome"
        type="text"
        placeholder="Ex.: Macarrão"
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        />
      </div>

      <br />

      <div>
        <label htmlFor="preco">Preço unitario (R$)</label>
        <br />
        <input
        id="preco"
        type="number"
        min={0.01}
        step={0.01}
        placeholder="Ex.: 3.00"
        value={preco}
        onChange={(e) => setPreco(e.target.value)}
        />
      </div>

      <br />

      <div>
        <label htmlFor="quantidade">Quantidade do produto selecionado</label>
        <br />
        <input
        id="quantidade"
        type="number"
        min={1}
        step={1}
        placeholder="Ex.: 4"
        value={quantidade}
        onChange={(e) => setQuantidade(e.target.value)}
        />
      </div>

      <button type="submit">
        {produtoEditado !== null ? "Salvar alterações" : "Adicionar"}
      </button>
       {produtoEditado !== null &&(

        <button type="button" onClick={limparFormulario}>
          Cancelar edição
        </button>
       )}
    </form>

    <h2>Produtos adicionados</h2>

    {lista.length === 0 ? (
      <p>Nenhum produto adicionado ainda.</p>
    ) : (
      <ul>
        {lista.map((produto) => (
          <li key={produto.id}>
            <strong>{produto.nome}</strong>
            {" — "}
            {produto.quantidade} x{" "}
            {formatarDinheiro(produto.precoUnitarioCentavos)}
            {" = "}
            {formatarDinheiro(
              produto.precoUnitarioCentavos * produto.quantidade
            )}

            {" "}

            <button type="button" onClick={() => editarProduto(produto)}>Editar</button>

            <button type="button" onClick={() => removerProduto(produto.id)}>Remover</button>




          </li>
        ))}
      </ul>
    )}

    <h2>Total da compra: {formatarDinheiro(totalFinal)}</h2>
    </>
    );
}
