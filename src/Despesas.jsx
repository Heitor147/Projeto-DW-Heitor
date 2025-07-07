import React, { useState, useEffect } from 'react';
import './Botao.css';
import GraficoDespesa from './GraficoDespesa';

export default function ManipularDespesa() {
    const [despesas, setDespesas] = useState(() => {
        const armazenaDespesa = localStorage.getItem('MinhasDespesas');
        return armazenaDespesa ? JSON.parse(armazenaDespesa) : [];
    });

    const [inputValor, setInputValor] = useState('');
    const [editDespesaId, setEditDespesaId] = useState(null);
    const [categoriaSelecionada, setCategoriaSelecionada] = useState('');
    const [filtroCategoria, setFiltroCategoria] = useState('all');

    const category = ['Despesa Fixa', 'Despesa Variável'];

    useEffect(() => {
        localStorage.setItem('MinhasDespesas', JSON.stringify(despesas));
    }, [despesas]);

    const adicionarDespesa = () => {
        if (inputValor.trim() !== '' && categoriaSelecionada !== '') {
            const novaDespesa = {
                id: Date.now(),
                text: inputValor.trim(),
                category: categoriaSelecionada,
                date: new Date().toISOString().split('T')[0],
            };

            setDespesas([...despesas, novaDespesa]);
            setInputValor('');
            setCategoriaSelecionada('');
        } else {
            alert('Por favor, digite uma despesa e selecione uma categoria.')
        }
    };

    const editarDespesa = (id, currentText, categoriaAtual) => {
        setEditDespesaId(id);
        setInputValor(currentText);
        setCategoriaSelecionada(categoriaAtual)
    };

    const salvarEdicaoDespesa = () => {
        if (inputValor.trim() !== '' && categoriaSelecionada !== '' && editDespesaId !== null) {
            setDespesas(
                despesas.map((despesa) =>
                    despesa.id === editDespesaId ? { ...despesa, text: inputValor.trim(), category: categoriaSelecionada } : despesa
                )
            );
            setEditDespesaId(null);
            setInputValor('');
            setCategoriaSelecionada('');
        } else {
            alert('Por favor, digite uma despesa e selecione uma categoria.')
        }
    };

    const removerDespesa = (id) => {
        setDespesas(despesas.filter((despesa) => despesa.id !== id));
    };

    const filtrarDespesa = despesas.filter((despesa) => filtroCategoria === 'all' ? true : despesa.category === filtroCategoria );

    return (
        <div>
            <h1>Gerenciador de Despesas</h1>

            <input
                type="text"
                value={inputValor}
                onChange={(e) => setInputValor(e.target.value)}
                placeholder="Adicionar nova despesa ou editar"
            />

            <select value={categoriaSelecionada} onChange={(e) => setCategoriaSelecionada(e.target.value)}>
                <option value="">Selecione uma categoria</option>
                {category.map((category) => (
                    <option key={category} value={category}>
                        {category}
                    </option>
                ))}                
            </select>

            {editDespesaId !== null ? (
                <button onClick={salvarEdicaoDespesa}>Salvar Edição</button>
            ) : (
                <button onClick={adicionarDespesa}>Adicionar Despesa</button>
            )}

            <h2>Filtrar por categoria</h2>
            <select value={filtroCategoria} onChange={(e) => setFiltroCategoria(e.target.value)}>
                <option value="all">Todas as Categorias</option>
                {category.map((category) => (
                    <option key={category} value={category}>
                        {category}
                    </option>
                ))}
            </select>

            <ul>
                {filtrarDespesa.map((despesa) => (
                    <li key={despesa.id}>
                        {despesa.category} {despesa.text}
                        <button className='buttonedit' onClick={() => editarDespesa(despesa.id, despesa.text, despesa.category)}>Editar</button>
                        <button className='buttonremove' onClick={() => removerDespesa(despesa.id)}>Remover</button>
                    </li>
                ))}
            </ul>

        <GraficoDespesa despesas={despesas} />
        </div>
    );
}