import React, { useState, useEffect } from 'react';
import './Botao.css';
import GraficoDespesa from './GraficoDespesa';

export default function ManipularDespesa() {
    const [despesas, setDespesas] = useState(() => {
        const armazenaDespesa = localStorage.getItem('MinhasDespesas');
        return armazenaDespesa ? JSON.parse(armazenaDespesa) : [];
    });

    const [inputValor, setInputValor] = useState('');
    const [inputValorMonetario, setInputValorMonetario] = useState('');
    const [editDespesaId, setEditDespesaId] = useState(null);
    const [categoriaSelecionada, setCategoriaSelecionada] = useState('');
    const [subCategoriaSelecionada, setSubCategoriaSelecionada] = useState('');
    const [filtroCategoria, setFiltroCategoria] = useState('all');
    const [moedaDestino, setMoedaDestino] = useState('USD');
    const [valorConvertido, setValorConvertido] = useState(null);
    const [taxaCambio, setTaxaCambio] = useState(null);
    const [isLoadingConversion, setIsLoadingConversion] = useState(false);
    const [erroConversao, setErroConversao] = useState(null);

    const category = [
        { main: 'Despesa Fixa', sub: ['Aluguel', 'Internet', 'Luz', 'Água', 'Salário'] },
        { main: 'Despesa Variável', sub: ['Alimentação', 'Transporte', 'Lazer', 'Compras', 'Saúde', 'Educação'] }
    ];

    useEffect(() => {
        localStorage.setItem('MinhasDespesas', JSON.stringify(despesas));
    }, [despesas]);

    const adicionarDespesa = () => {
        if (inputValor.trim() !== '' && categoriaSelecionada !== '' && subCategoriaSelecionada !== '' && inputValorMonetario !== '') {
            const novaDespesa = {
                id: Date.now(),
                text: inputValor.trim(),
                category: categoriaSelecionada,
                subCategory: subCategoriaSelecionada,
                value: parseFloat(inputValorMonetario),
                date: new Date().toISOString().split('T')[0],
            };

            setDespesas([...despesas, novaDespesa]);
            setInputValor('');
            setCategoriaSelecionada('');
            setSubCategoriaSelecionada('');
            setInputValorMonetario('');
        } else {
            alert('Por favor, digite uma despesa e selecione uma categoria.')
        }
    };

    const converterMoeda = async () => {
        setIsLoadingConversion(true);
        setErroConversao(null);
        setValorConvertido(null);

        // Certifique-se de que há despesas e um valor total para converter
        const totalDespesas = despesas.reduce((sum, despesa) => sum + despesa.value, 0);

        if (totalDespesas === 0) {
            setErroConversao("Não há despesas para converter.");
            setIsLoadingConversion(false);
            return;
        }

        try {
            const response = await fetch(`https://v6.exchangerate-api.com/v6/323e64ae7b7c77e093bf7e0a/latest/BRL`)
            const data = await response.json();

            if (data.result === 'success') {
                const rate = data.conversion_rates[moedaDestino];
                if (rate) {
                    setTaxaCambio(rate);
                    setValorConvertido(totalDespesas * rate);
                } else {
                    setErroConversao("Moeda de destino não encontrada.");
                }
            } else {
                setErroConversao(data['error-type'] || "Erro ao obter taxas de câmbio.");
            }
        } catch (error) {
            console.error("Erro ao converter moeda:", error);
            setErroConversao("Erro ao conectar com a API de câmbio.");
        } finally {
            setIsLoadingConversion(false);
        }
    };

    const editarDespesa = (id, currentText, categoriaAtual, subCategoriaAtual, currentValue) => {
        setEditDespesaId(id);
        setInputValor(currentText);
        setCategoriaSelecionada(categoriaAtual);
        setSubCategoriaSelecionada(subCategoriaAtual);
        setInputValorMonetario(currentValue)
    };

    const salvarEdicaoDespesa = () => {
        if (inputValor.trim() !== '' && categoriaSelecionada !== '' && subCategoriaSelecionada !== '' && inputValorMonetario !== '' && editDespesaId !== null) {
            setDespesas(
                despesas.map((despesa) =>
                    despesa.id === editDespesaId ? { ...despesa, text: inputValor.trim(), category: categoriaSelecionada, subCategory: subCategoriaSelecionada, value: parseFloat(inputValorMonetario) } : despesa
                )
            );
            setEditDespesaId(null);
            setInputValor('');
            setCategoriaSelecionada('');
            setSubCategoriaSelecionada('');
            setInputValorMonetario('');
        } else {
            alert('Por favor, digite uma despesa e selecione uma categoria.')
        }
    };

    const removerDespesa = (id) => {
        setDespesas(despesas.filter((despesa) => despesa.id !== id));
    };

    const filtrarDespesa = despesas.filter((despesa) => filtroCategoria === 'all' ? true : despesa.category === filtroCategoria);

    return (
        <div>
            <h1>Gerenciador de Despesas</h1>

            <input
                type="text"
                value={inputValor}
                onChange={(e) => setInputValor(e.target.value)}
                placeholder="Adicionar nova despesa ou editar"
            />

            <input
                type="number"
                value={inputValorMonetario}
                onChange={(e) => setInputValorMonetario(e.target.value)}
                placeholder="Valor em R$"
                min="0"
                step="0.01"
            />

            <select value={categoriaSelecionada} onChange={(e) => { setCategoriaSelecionada(e.target.value); setSubCategoriaSelecionada('') }}>
                <option value="">Selecione uma categoria principal</option>
                {category.map((cat) => (
                    <option key={cat.main} value={cat.main}>
                        {cat.main}
                    </option>
                ))}
            </select>

            {categoriaSelecionada && (
                <select value={subCategoriaSelecionada} onChange={(e) => setSubCategoriaSelecionada(e.target.value)}>
                    <option value="">Selecione uma subcategoria</option>
                    {category.find(cat => cat.main === categoriaSelecionada)?.sub.map((subCat) => (
                        <option key={subCat} value={subCat}>
                            {subCat}
                        </option>
                    ))}
                </select>
            )}

            {editDespesaId !== null ? (
                <button onClick={salvarEdicaoDespesa}>Salvar Edição</button>
            ) : (
                <button onClick={adicionarDespesa}>Adicionar Despesa</button>
            )}

            <h2>Conversão de Moeda</h2>
            <select value={moedaDestino} onChange={(e) => setMoedaDestino(e.target.value)}>
                <option value="USD">Dólar Americano (USD)</option>
                <option value="EUR">Euro (EUR)</option>
                <option value="JPY">Iene Japonês (JPY)</option>
            </select>
            <button onClick={converterMoeda} disabled={isLoadingConversion}>
                {isLoadingConversion ? 'Convertendo...' : 'Converter Total para Outra Moeda'}
            </button>

            {valorConvertido !== null && (
                <p>
                    Total das despesas (BRL): R$ {despesas.reduce((sum, despesa) => sum + despesa.value, 0).toFixed(2).replace('.', ',')}
                    <br />
                    Total convertido ({moedaDestino}): {moedaDestino} {valorConvertido.toFixed(2).replace('.', ',')}
                    <br />
                    Taxa de Câmbio (1 BRL para {moedaDestino}): {taxaCambio.toFixed(4)}
                </p>
            )}

            {erroConversao && (
                <p style={{ color: 'red' }}>Erro: {erroConversao}</p>
            )}

            <h2>Filtrar por categoria</h2>
            <select value={filtroCategoria} onChange={(e) => setFiltroCategoria(e.target.value)}>
                <option value="all">Todas as Categorias</option>
                {category.map((cat) => (
                    <option key={cat.main} value={cat.main}>
                        {cat.main}
                    </option>
                ))}
            </select>

            <ul>
                {filtrarDespesa.map((despesa) => (
                    <li key={despesa.id}>
                        {despesa.category} {despesa.subCategory} {despesa.text} {Number(despesa.value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        <button className='buttonedit' onClick={() => editarDespesa(despesa.id, despesa.text, despesa.category, despesa.subCategory, despesa.value)}>Editar</button>
                        <button className='buttonremove' onClick={() => removerDespesa(despesa.id)}>Remover</button>
                    </li>
                ))}
            </ul>

            <GraficoDespesa despesas={despesas} />
        </div>
    );
}