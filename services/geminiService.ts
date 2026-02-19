
import { GoogleGenAI } from "@google/genai";
import { Expense, Income } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function getFinancialAdvice(expenses: Expense[], incomes: Income[]) {
  const totalIncome = incomes.reduce((acc, curr) => acc + curr.valor, 0);
  const totalExpense = expenses.reduce((acc, curr) => acc + curr.valor, 0);
  const balance = totalIncome - totalExpense;

  const prompt = `
    Como um consultor financeiro especialista, analise os seguintes dados mensais:
    Receita Total: R$ ${totalIncome.toFixed(2)}
    Despesa Total: R$ ${totalExpense.toFixed(2)}
    Saldo Atual: R$ ${balance.toFixed(2)}
    
    Lista de Despesas Principais:
    ${expenses.slice(0, 10).map(e => `- ${e.descricao}: R$ ${e.valor} (${e.categoria})`).join('\n')}

    Forneça 3 dicas curtas e práticas em português para melhorar a saúde financeira desta residência. 
    Seja motivador e direto. Retorne em formato JSON com um campo "dicas" (lista de strings).
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const data = JSON.parse(response.text || '{"dicas": []}');
    return data.dicas;
  } catch (error) {
    console.error("Erro ao obter conselhos:", error);
    return ["Mantenha suas contas em dia.", "Tente economizar pelo menos 10% da sua renda.", "Evite compras por impulso."];
  }
}
