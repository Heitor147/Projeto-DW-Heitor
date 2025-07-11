import React, { useState, useEffect } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell,
    LineChart, Line
} from 'recharts';

export default function GraficoDespesa({ despesas }) {
    // Novos estados para filtragem de gráficos
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth()); // Mês atual por padrão
    const [selectedGraphCategory, setSelectedGraphCategory] = useState('all');
    const [selectedGraphSubCategory, setSelectedGraphSubCategory] = useState('all');

    // Mapeamento de meses para exibição
    const months = Array.from({ length: 12 }, (_, i) => ({
        value: i,
        name: new Date(2000, i, 1).toLocaleString('pt-BR', { month: 'long' })
    }));

    if (!despesas || despesas.length === 0) {
        return <p>Não há despesas para exibir nos gráficos.</p>;
    }

    // --- Dados para o Gráfico de Barras (Número de Itens por Categoria - Geral) ---
    const categoryCountData = despesas.reduce((acc, despesa) => {
        acc[despesa.category] = (acc[despesa.category] || 0) + 1;
        return acc;
    }, {});

    const barChartData = Object.keys(categoryCountData).map(category => ({
        name: category,
        'Número de Despesas': categoryCountData[category]
    }));

    // --- Dados para o Gráfico de Pizza (Distribuição de Gastos no Mês Atual) ---
    const currentYear = new Date().getFullYear();

    const monthlyExpenses = despesas.filter(item => {
        const expenseDate = new Date(item.date);
        return expenseDate.getMonth() === selectedMonth && expenseDate.getFullYear() === currentYear;
    });

    const categoryMonthlyValueData = monthlyExpenses.reduce((acc, despesa) => {
        acc[despesa.category] = (acc[despesa.category] || 0) + despesa.value; // Soma o valor em vez de contar
        return acc;
    }, {});

    const pieChartData = Object.keys(categoryMonthlyValueData).map(category => ({
        name: category,
        value: categoryMonthlyValueData[category]
    }));

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF0000', '#88B04B', '#F7CAC9'];

    // --- Dados para o Gráfico de Linha (Gastos ao Longo do Mês/Ano com Filtros) ---

    // Coleta todas as categorias e subcategorias únicas para os filtros
    const allCategories = [...new Set(despesas.map(d => d.category))];
    const allSubCategories = [...new Set(despesas.filter(d => d.category === selectedGraphCategory).map(d => d.subCategory))];

    // Filtra as despesas com base nos seletores de categoria/subcategoria para o gráfico de linha
    const filteredLineChartExpenses = despesas.filter(item => {
        const itemDate = new Date(item.date);
        const matchesMonth = itemDate.getMonth() === selectedMonth;
        const matchesYear = itemDate.getFullYear() === currentYear;
        const matchesCategory = selectedGraphCategory === 'all' || item.category === selectedGraphCategory;
        const matchesSubCategory = selectedGraphSubCategory === 'all' || item.subCategory === selectedGraphSubCategory;

        return matchesMonth && matchesYear && matchesCategory && matchesSubCategory;
    });

    // Agrega os gastos diários para o gráfico de linha
    const dailySpendingData = filteredLineChartExpenses.reduce((acc, item) => {
        const day = new Date(item.date).getDate(); // Dia do mês
        const formattedDate = `${day.toString().padStart(2, '0')}/${(selectedMonth + 1).toString().padStart(2, '0')}`; // Formato DD/MM

        if (!acc[formattedDate]) {
            acc[formattedDate] = 0;
        }
        acc[formattedDate] += item.value;
        return acc;
    }, {});

    // Cria os dados para o gráfico de linha, garantindo que todos os dias do mês estejam presentes
    const daysInMonth = new Date(currentYear, selectedMonth + 1, 0).getDate();
    const lineChartData = Array.from({ length: daysInMonth }, (_, i) => {
        const day = i + 1;
        const formattedDate = `${day.toString().padStart(2, '0')}/${(selectedMonth + 1).toString().padStart(2, '0')}`;
        return {
            name: formattedDate,
            'Gasto Total': dailySpendingData[formattedDate] || 0
        };
    });

    // --- Média de Gasto Mensal ---
    const totalMonthlySpending = monthlyExpenses.reduce((sum, despesa) => sum + despesa.value, 0);
    const averageMonthlySpending = monthlyExpenses.length > 0 ? totalMonthlySpending / monthlyExpenses.length : 0;

    return (
        <div>
            ---
            <h2>Gráficos de Despesas</h2>

            <h3>Número de Itens por Categoria (Todas as Despesas)</h3>
            {barChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                        data={barChartData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip formatter={(value) => `Número: ${value}`} />
                        <Legend />
                        <Bar dataKey="Número de Despesas" fill="#8884d8" />
                    </BarChart>
                </ResponsiveContainer>
            ) : (
                <p>Adicione despesas para ver o gráfico de categorias.</p>
            )}

            ---

            <h3>Distribuição de Gastos por Categoria no Mês Selecionado</h3>
            <p>Selecione o mês para visualizar a distribuição de gastos:</p>
            <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            >
                {months.map((month) => (
                    <option key={month.value} value={month.value}>
                        {month.name}
                    </option>
                ))}
            </select>

            {pieChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie
                            data={pieChartData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                            {pieChartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip formatter={(value) => `R$ ${value.toFixed(2).replace('.', ',')}`} />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            ) : (
                <p>Adicione despesas no mês selecionado para ver o gráfico de distribuição.</p>
            )}

            ---

            <h3>Gasto Diário no Mês Selecionado</h3>

            <p>Selecione o mês para analisar os gastos diários:</p>
            <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            >
                {months.map((month) => (
                    <option key={month.value} value={month.value}>
                        {month.name}
                    </option>
                ))}
            </select>

            <p>Filtre por categoria e subcategoria (opcional):</p>
            <select
                value={selectedGraphCategory}
                onChange={(e) => {
                    setSelectedGraphCategory(e.target.value);
                    setSelectedGraphSubCategory('all'); // Resetar subcategoria ao mudar a categoria principal
                }}
            >
                <option value="all">Todas as Categorias</option>
                {allCategories.map((category) => (
                    <option key={category} value={category}>
                        {category}
                    </option>
                ))}
            </select>

            {selectedGraphCategory !== 'all' && (
                <select
                    value={selectedGraphSubCategory}
                    onChange={(e) => setSelectedGraphSubCategory(e.target.value)}
                >
                    <option value="all">Todas as Subcategorias</option>
                    {allSubCategories.map((subCategory) => (
                        <option key={subCategory} value={subCategory}>
                            {subCategory}
                        </option>
                    ))}
                </select>
            )}

            {lineChartData.some(data => data['Gasto Total'] > 0) ? (
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart
                        data={lineChartData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis tickFormatter={(value) => `R$ ${value.toFixed(2).replace('.', ',')}`} />
                        <Tooltip formatter={(value) => [`R$ ${value.toFixed(2).replace('.', ',')}`, 'Gasto']} />
                        <Legend />
                        <Line type="monotone" dataKey="Gasto Total" stroke="#82ca9d" activeDot={{ r: 8 }} />
                    </LineChart>
                </ResponsiveContainer>
            ) : (
                <p>Adicione despesas no mês selecionado {selectedGraphCategory !== 'all' ? `na categoria '${selectedGraphCategory}'${selectedGraphSubCategory !== 'all' ? ` e subcategoria '${selectedGraphSubCategory}'` : ''}` : ''} para ver o gráfico de gastos diários.</p>
            )}

            ---

            <h3>Média de Gasto Mensal</h3>
            <p>A média de gasto para o mês de {months[selectedMonth].name} é: R$ {averageMonthlySpending.toFixed(2).replace('.', ',')}</p>
            <p>(Considerando {monthlyExpenses.length} despesa(s) no mês selecionado).</p>
        </div>
    );
}