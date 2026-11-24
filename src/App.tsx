
import { useState } from "react";
import type { KeyboardEvent } from "react";
import type { ItemCompra } from "./item";

type ListaCompras = {
  id: string;
  nome: string;
  produtos: ItemCompra[];
};

export default function App() {
  // Campos do formulário
  const [nome, setNome] = useState("");
  const [preco, setPreco] = useState("");
  const [quantidade, setQuantidade] = useState("");

  // Listas de compras
  const [listas, setListas] = useState<ListaCompras[]>([]);
  const [listaSelecionada, setListaSelecionada] = useState<string | null>(null);

  // Produto em edição
  const [produtoEditado, setProdutoEditado] = useState<string | null>(null);

  // Localiza a lista selecionada
  const listaAtual = listas.find(
    (lista) => lista.id === listaSelecionada
  );

  // Produtos da lista selecionada
  const produtos = listaAtual?.produtos ?? [];

  // Formata valores em reais
  function formatarDinheiro(valor: number) {
    return (valor / 100).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  // Limpa os campos
  function limparFormulario() {
    setNome("");
    setPreco("");
    setQuantidade("");
    setProdutoEditado(null);
  }

  // cria uma nova lista perguntando o nome do mercado
  function adicionarLista() {
    const nomeMercado = window.prompt(
      "Qual é o mercado onde você vai fazer as compras?"
    );

    if (nomeMercado === null || nomeMercado.trim() === "") {
      return;
    }

    const novaLista: ListaCompras = {
      id: crypto.randomUUID(),
      nome: nomeMercado.trim(),
      produtos: [],
    };

    setListas((listasAtuais) => [
      ...listasAtuais,
      novaLista,
    ]);

    setListaSelecionada(novaLista.id);
    limparFormulario();
  }

  // Seleciona uma lista existente
  function selecionarLista(id: string) {
    setListaSelecionada(id);
    limparFormulario();
  }

  // Adiciona ou atualiza um produto
  function adicionarProduto() {
    if (listaSelecionada === null) {
      return;
    }

    const nomeLimpo = nome.trim();
    const valor = Number(preco);
    const qtd = Number(quantidade);

    // valida os campos
    if (
      nomeLimpo === "" ||
      preco.trim() === "" ||
      quantidade.trim() === "" ||
      !Number.isFinite(valor) ||
      !Number.isInteger(qtd) ||
      valor <= 0 ||
      qtd <= 0
    ) {
      return;
    }

    const precoCentavos = Math.round(valor * 100);

    setListas((listasAtuais) =>
      listasAtuais.map((lista) => {
        if (lista.id !== listaSelecionada) {
          return lista;
        }

        // Atualiza produto existente
        if (produtoEditado !== null) {
          return {
            ...lista,
            produtos: lista.produtos.map((produto) =>
              produto.id === produtoEditado
                ? {
                    ...produto,
                    nome: nomeLimpo,
                    precoUnitarioCentavos: precoCentavos,
                    quantidade: qtd,
                  }
                : produto
            ),
          };
        }

        // cadastra um produto novo
        const novoProduto: ItemCompra = {
          id: crypto.randomUUID(),
          nome: nomeLimpo,
          precoUnitarioCentavos: precoCentavos,
          quantidade: qtd,
        };

        return {
          ...lista,
          produtos: [...lista.produtos, novoProduto],
        };
      })
    );

    limparFormulario();
  }

  //  essa parte deixa cadastrar usando o botão enter Enter
  function confirmarComEnter(evento: KeyboardEvent<HTMLInputElement>) {
    if (evento.key === "Enter") {
      evento.preventDefault();
      adicionarProduto();
    }
  }

  // Carrega um produto para edição
  function editarProduto(produto: ItemCompra) {
    setNome(produto.nome);
    setPreco(
      (produto.precoUnitarioCentavos / 100).toFixed(2)
    );
    setQuantidade(String(produto.quantidade));
    setProdutoEditado(produto.id);
  }

  // Remove um produto
  function removerProduto(id: string) {
    const confirmar = window.confirm(
      "Deseja realmente remover este produto?"
    );

    if (!confirmar || listaSelecionada === null) {
      return;
    }

    setListas((listasAtuais) =>
      listasAtuais.map((lista) =>
        lista.id === listaSelecionada
          ? {
              ...lista,
              produtos: lista.produtos.filter(
                (produto) => produto.id !== id
              ),
            }
          : lista
      )
    );

    if (produtoEditado === id) {
      limparFormulario();
    }
  }

  // Calcula o total dos produtos cadastrados
  const totalCentavos = produtos.reduce((total, produto) => {
    // Considera os valores atuais durante a edição
    if (produto.id === produtoEditado) {
      const precoAtual = Number(preco);
      const qtdAtual = Number(quantidade);

      if (
        preco.trim() !== "" &&
        quantidade.trim() !== "" &&
        Number.isFinite(precoAtual) &&
        Number.isInteger(qtdAtual) &&
        precoAtual > 0 &&
        qtdAtual > 0
      ) {
        return total + Math.round(precoAtual * 100) * qtdAtual;
      }
    }

    return (
      total +
      produto.precoUnitarioCentavos * produto.quantidade
    );
  }, 0);

  // Prévia do produto novo enquanto os campos são preenchidos
  const produtoNovoValido =
    produtoEditado === null &&
    nome.trim() !== "" &&
    preco.trim() !== "" &&
    quantidade.trim() !== "" &&
    Number.isFinite(Number(preco)) &&
    Number.isInteger(Number(quantidade)) &&
    Number(preco) > 0 &&
    Number(quantidade) > 0;

  const totalFinal =
    totalCentavos +
    (
      produtoNovoValido
        ? Math.round(Number(preco) * 100) * Number(quantidade)
        : 0
    );

  return (
    <>
      <h1>Minhas listas de compras</h1>

      {/* Criar nova lista */}
      <button type="button" onClick={adicionarLista}>
        + Nova lista
      </button>

      {/* Mostrar listas e nomes dos mercados */}
      <h2>Minhas listas</h2>

      {listas.length === 0 ? (
        <p>Nenhuma lista criada ainda.</p>
      ) : (
        <ul>
          {listas.map((lista) => (
            <li key={lista.id}>
              <button
                type="button"
                onClick={() => selecionarLista(lista.id)}
              >
                {lista.nome}
                {listaSelecionada === lista.id
                  ? " (Selecionada)"
                  : ""}
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Conteúdo da lista selecionada */}
      {listaAtual && (
        <>
          {/* colocar o nome do mercado */}
          <h2>Mercado: {listaAtual.nome}</h2>

          {/* Formulário */}
          <form onSubmit={(evento) => evento.preventDefault()}>
            <h3>
              {produtoEditado !== null
                ? "Editar produto"
                : "Adicionar produto"}
            </h3>

            <div>
              <label htmlFor="nome">Nome do produto</label>
              <br />
              <input
                id="nome"
                type="text"
                placeholder="Ex.: Feijão"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
              />
            </div>

            <br />

            <div>
              <label htmlFor="preco">Preço unitário (R$)</label>
              <br />
              <input
                id="preco"
                type="number"
                min={0.01}
                step={0.01}
                placeholder="Ex.: 5.00"
                value={preco}
                onChange={(e) => setPreco(e.target.value)}
              />
            </div>

            <br />

            <div>
              <label htmlFor="quantidade">
                Quantidade do produto
              </label>
              <br />
              <input
                id="quantidade"
                type="number"
                min={1}
                step={1}
                placeholder="Ex.: 9"
                value={quantidade}
                onChange={(e) => setQuantidade(e.target.value)}
                onBlur={adicionarProduto}
                onKeyDown={confirmarComEnter}
              />
            </div>

            <p>
              {produtoEditado !== null
                ? "Saia do campo quantidade ou pressione Enter para salvar."
                : "O produto será cadastrado ao sair do campo quantidade ou pressionar Enter."}
            </p>

            {produtoEditado !== null && (
              <button
                type="button"
                onClick={limparFormulario}
              >
                Cancelar edição
              </button>
            )}
          </form>

          {/* Produtos cadastrados */}
          <h2>Produtos adicionados</h2>

          {produtos.length === 0 ? (
            <p>Nenhum produto adicionado ainda.</p>
          ) : (
            <ul>
              {produtos.map((produto) => (
                <li key={produto.id}>
                  <strong>{produto.nome}</strong>
                  {" — "}
                  {produto.quantidade} x{" "}
                  {formatarDinheiro(
                    produto.precoUnitarioCentavos
                  )}
                  {" = "}
                  {formatarDinheiro(
                    produto.precoUnitarioCentavos *
                    produto.quantidade
                  )}

                  {" "}

                  <button
                    type="button"
                    onClick={() => editarProduto(produto)}
                  >
                    Editar
                  </button>

                  <button
                    type="button"
                    onClick={() => removerProduto(produto.id)}
                  >
                    Remover
                  </button>
                </li>
              ))}
            </ul>
          )}

          {/* total sempre visível na lista selecionada */}
          <h2>
            Total da compra: {formatarDinheiro(totalFinal)}
          </h2>
        </>
      )}
    </>
  );
}
