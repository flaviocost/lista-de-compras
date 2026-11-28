
import { useEffect, useState } from "react";

import type { ItemCompra, ListaCompras } from "./item";

import {
  carregarListas,
  salvarListas,
} from "./armazenamento";

import "./App.css";

export default function App() {
  // Estados das listas
  const [listas, setListas] = useState<ListaCompras[]>(
    () => carregarListas()
  );

  const [listaSelecionada, setListaSelecionada] =
    useState<string | null>(null);

  // Estados do formulário
  const [nome, setNome] = useState("");
  const [preco, setPreco] = useState("");
  const [quantidade, setQuantidade] = useState("");

  const [produtoEditado, setProdutoEditado] =
    useState<string | null>(null);

  const [modoEdicao, setModoEdicao] = useState(false);

  // Salva as listas sempre que houver alterações
  useEffect(() => {
    salvarListas(listas);
  }, [listas]);

  // Lista selecionada
  const listaAtual = listas.find(
    (lista) => lista.id === listaSelecionada
  );

  const produtos = listaAtual?.produtos ?? [];

  // Formata dinheiro
  function formatarDinheiro(valor: number) {
    return (valor / 100).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  // Limpa formulário
  function limparFormulario() {
    setNome("");
    setPreco("");
    setQuantidade("");
    setProdutoEditado(null);
  }

  // Cria uma nova lista
  function adicionarLista() {
    const nomeMercado = window.prompt(
      "Qual é o nome do mercado?"
    );

    if (!nomeMercado || nomeMercado.trim() === "") {
      return;
    }

    const novaLista: ListaCompras = {
      id: crypto.randomUUID(),
      nome: nomeMercado.trim(),
      produtos: [],
    };

    setListas((atuais) => [...atuais, novaLista]);

    setListaSelecionada(novaLista.id);
    limparFormulario();
  }

  // Abre uma lista
  function selecionarLista(id: string) {
    setListaSelecionada(id);
    limparFormulario();
  }

  // Volta para a tela inicial
  function voltarInicio() {
    setListaSelecionada(null);
    limparFormulario();
  }

  // Exclui uma lista
  function removerLista(id: string) {
    const confirmar = window.confirm(
      "Deseja realmente excluir esta lista?"
    );

    if (!confirmar) return;

    setListas((atuais) =>
      atuais.filter((lista) => lista.id !== id)
    );

    if (listaSelecionada === id) {
      voltarInicio();
    }
  }

  // Adiciona ou atualiza um produto
  function adicionarProduto(
    evento: React.FormEvent<HTMLFormElement>
  ) {
    evento.preventDefault();

    if (listaSelecionada === null) return;

    const nomeLimpo = nome.trim();
    const valor = Number(preco);
    const qtd = Number(quantidade);

    if (
      nomeLimpo === "" ||
      preco.trim() === "" ||
      quantidade.trim() === "" ||
      !Number.isFinite(valor) ||
      !Number.isInteger(qtd) ||
      valor <= 0 ||
      qtd <= 0
    ) {
      alert("Preencha todos os campos corretamente.");
      return;
    }

    const precoCentavos = Math.round(valor * 100);

    setListas((atuais) =>
      atuais.map((lista) => {
        if (lista.id !== listaSelecionada) {
          return lista;
        }

        // Edita produto existente
        if (produtoEditado !== null) {
          return {
            ...lista,
            produtos: lista.produtos.map((produto) =>
              produto.id === produtoEditado
                ? {
                    ...produto,
                    nome: nomeLimpo,
                    quantidade: qtd,
                    precoUnitarioCentavos: precoCentavos,
                  }
                : produto
            ),
          };
        }

        // Cria novo produto
        const novoProduto: ItemCompra = {
          id: crypto.randomUUID(),
          nome: nomeLimpo,
          quantidade: qtd,
          precoUnitarioCentavos: precoCentavos,
        };

        return {
          ...lista,
          produtos: [...lista.produtos, novoProduto],
        };
      })
    );

    limparFormulario();
  }

  // Edita um produto
  function editarProduto(produto: ItemCompra) {
    setNome(produto.nome);

    setPreco(
      (produto.precoUnitarioCentavos / 100).toFixed(2)
    );

    setQuantidade(String(produto.quantidade));

    setProdutoEditado(produto.id);
  }

  // Remove produto
  function removerProduto(id: string) {
    if (listaSelecionada === null) return;

    const confirmar = window.confirm(
      "Deseja remover este produto?"
    );

    if (!confirmar) return;

    setListas((atuais) =>
      atuais.map((lista) =>
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

  // Calcula o total da compra
  const totalCentavos = produtos.reduce(
    (total, produto) =>
      total +
      produto.precoUnitarioCentavos * produto.quantidade,
    0
  );

  return (
    <main className="app">

      {/* CABEÇALHO */}
      <header className="topbar">
        {listaAtual ? (
          <>
            <button
              className="back-button"
              onClick={voltarInicio}
              type="button"
            >
              ‹
            </button>

            <h1>{listaAtual.nome}</h1>

            <span className="header-count">
              {produtos.length} itens
            </span>
          </>
        ) : (
          <>
            <h1>Minhas listas</h1>

            <button
              className="edit-button"
              onClick={() => setModoEdicao(!modoEdicao)}
              type="button"
            >
              {modoEdicao ? "CONCLUÍDO" : "EDITAR"}
            </button>
          </>
        )}
      </header>

      {/* TELA INICIAL */}
      {!listaAtual && (
        <section className="home-screen">

          <div className="lists-container">

            {listas.length === 0 && (
              <div className="empty-state">
                <span className="empty-icon">🛒</span>
                <h2>Suas compras começam aqui</h2>
                <p>
                  Crie sua primeira lista para organizar
                  suas compras.
                </p>
              </div>
            )}

            {listas.map((lista, index) => (
              <article
                className={`list-card card-${index % 3}`}
                key={lista.id}
              >
                <div className="card-decoration">
                  {index % 3 === 0
                    ? "🥕"
                    : index % 3 === 1
                      ? "☕"
                      : "🥬"}
                </div>

                <div className="card-content">
                  <h2>{lista.nome}</h2>

                  {lista.produtos.length > 0 && (
                    <span className="item-badge">
                      {lista.produtos.length}{" "}
                      {lista.produtos.length === 1
                        ? "item"
                        : "itens"}
                    </span>
                  )}

                  <div className="card-footer">
                    <span className="profile-icon">👤</span>

                    <span className="shared-icon">
                      +
                    </span>
                  </div>
                </div>

                <button
                  className="open-list-button"
                  onClick={() => selecionarLista(lista.id)}
                  type="button"
                  aria-label={`Abrir lista ${lista.nome}`}
                >
                  ›
                </button>

                {modoEdicao && (
                  <button
                    className="delete-list-button"
                    onClick={() => removerLista(lista.id)}
                    type="button"
                  >
                    Excluir
                  </button>
                )}
              </article>
            ))}

          </div>

          {/* BOTÃO CRIAR LISTA */}
          <button
            className="create-list-button"
            onClick={adicionarLista}
            type="button"
          >
            <span className="plus-icon">+</span>
            Criar lista
          </button>

          {/* RECOMENDAÇÕES */}
          <section className="recommendations">
            <h2>Recomendações de listas</h2>

            <div className="recommendation-container">

              <button
                className="recommendation-card party"
                onClick={() => {
                  const nome = window.prompt(
                    "Nome da lista:",
                    "Festa"
                  );

                  if (!nome?.trim()) return;

                  const novaLista: ListaCompras = {
                    id: crypto.randomUUID(),
                    nome: nome.trim(),
                    produtos: [],
                  };

                  setListas((atuais) => [
                    ...atuais,
                    novaLista,
                  ]);

                  setListaSelecionada(novaLista.id);
                }}
                type="button"
              >
                <span>Sua próxima festa</span>
                <span className="recommendation-emoji">🎉</span>
              </button>

              <button
                className="recommendation-card holiday"
                onClick={() => {
                  const nome = window.prompt(
                    "Nome da lista:",
                    "Casa de férias"
                  );

                  if (!nome?.trim()) return;

                  const novaLista: ListaCompras = {
                    id: crypto.randomUUID(),
                    nome: nome.trim(),
                    produtos: [],
                  };

                  setListas((atuais) => [
                    ...atuais,
                    novaLista,
                  ]);

                  setListaSelecionada(novaLista.id);
                }}
                type="button"
              >
                <span>Sua casa de férias</span>
                <span className="recommendation-emoji">🏖️</span>
              </button>

              <button
                className="recommendation-card drugstore"
                onClick={() => {
                  const nome = window.prompt(
                    "Nome da lista:",
                    "Farmácia"
                  );

                  if (!nome?.trim()) return;

                  const novaLista: ListaCompras = {
                    id: crypto.randomUUID(),
                    nome: nome.trim(),
                    produtos: [],
                  };

                  setListas((atuais) => [
                    ...atuais,
                    novaLista,
                  ]);

                  setListaSelecionada(novaLista.id);
                }}
                type="button"
              >
                <span>Para a farmácia</span>
                <span className="recommendation-emoji">💊</span>
              </button>

            </div>
          </section>
        </section>
      )}

      {/* TELA DA LISTA SELECIONADA */}
      {listaAtual && (
        <section className="shopping-screen">

          <div className="shopping-summary">
            <span>Valor total da compra</span>
            <strong>
              {formatarDinheiro(totalCentavos)}
            </strong>
          </div>

          {/* FORMULÁRIO */}
          <form
            className="product-form"
            onSubmit={adicionarProduto}
          >
            <h2>
              {produtoEditado
                ? "Editar produto"
                : "Adicionar produto"}
            </h2>

            <label htmlFor="nome">
              Nome do produto
            </label>

            <input
              id="nome"
              type="text"
              placeholder="Ex.: Arroz"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
            />

            <div className="form-row">
              <div>
                <label htmlFor="preco">
                  Preço unitário
                </label>

                <input
                  id="preco"
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder="0,00"
                  value={preco}
                  onChange={(e) => setPreco(e.target.value)}
                  required
                />
              </div>

              <div>
                <label htmlFor="quantidade">
                  Quantidade
                </label>

                <input
                  id="quantidade"
                  type="number"
                  min="1"
                  step="1"
                  placeholder="1"
                  value={quantidade}
                  onChange={(e) =>
                    setQuantidade(e.target.value)
                  }
                  required
                />
              </div>
            </div>

            <button className="add-product-button" type="submit">
              {produtoEditado
                ? "Salvar alterações"
                : "+ Adicionar produto"}
            </button>

            {produtoEditado && (
              <button
                className="cancel-button"
                type="button"
                onClick={limparFormulario}
              >
                Cancelar edição
              </button>
            )}
          </form>

          {/* PRODUTOS */}
          <div className="products-section">
            <h2>Produtos da lista</h2>

            {produtos.length === 0 ? (
              <div className="empty-products">
                <span>🛍️</span>
                <p>Nenhum produto adicionado ainda.</p>
              </div>
            ) : (
              <div className="product-list">
                {produtos.map((produto) => (
                  <article
                    className="product-card"
                    key={produto.id}
                  >
                    <div className="product-info">
                      <strong>{produto.nome}</strong>

                      <span>
                        {produto.quantidade} x{" "}
                        {formatarDinheiro(
                          produto.precoUnitarioCentavos
                        )}
                      </span>

                      <b>
                        {formatarDinheiro(
                          produto.precoUnitarioCentavos *
                            produto.quantidade
                        )}
                      </b>
                    </div>

                    <div className="product-actions">
                      <button
                        onClick={() => editarProduto(produto)}
                        type="button"
                        aria-label="Editar produto"
                      >
                        ✎
                      </button>

                      <button
                        onClick={() => removerProduto(produto.id)}
                        type="button"
                        aria-label="Remover produto"
                      >
                        ×
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>

          <div className="bottom-total">
            <span>Total da compra</span>
            <strong>
              {formatarDinheiro(totalCentavos)}
            </strong>
          </div>

        </section>
      )}

    </main>
  );
}
