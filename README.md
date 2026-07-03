# Projeto Horizonte — Planejamento Financeiro, Carreira & Metas 🌿💚

Este projeto foi desenvolvido com todo o carinho para **Júlia Aragão**, contendo uma aplicação interativa em formato de **Livro Digital** para visualização e simulação financeira no navegador, juntamente com um script Python para geração de planilhas Excel altamente estilizadas.

---

## 📂 Estrutura do Projeto

O projeto é composto pelos seguintes arquivos principais:

1. **`index.html`** — Estrutura e layout da aplicação web interativa em formato de Livro Digital (12 Capítulos).
2. **`style.css`** — Estilos visuais personalizados baseados na paleta **Luxury** (Verde Esmeralda, Branco e Ouro).
3. **`app.js`** — Motor de simulação financeira mês a mês (Jan/2026 a Dez/2030), gerenciamento de dados local (LocalStorage) e renderização de gráficos.
4. **`gerar_planilha.py`** — Script Python automatizado para construir a planilha formatada `Projeto_Horizonte.xlsx`.
5. **`Projeto_Horizonte.xlsx`** — Planilha de acompanhamento financeiro gerada.

---

## 💻 1. Como Abrir o Aplicativo / Livro Digital

Para abrir o seu aplicativo financeiro interativo:
1. Navegue até esta pasta.
2. Dê um clique duplo no arquivo **`index.html`** para abri-lo no seu navegador favorito (Chrome, Edge, Firefox, Safari).
3. Toda a sua navegação ocorre localmente no seu computador e os seus dados são salvos de forma segura e privada diretamente no armazenamento local do seu navegador (**LocalStorage**). Você também pode exportar e importar backups usando o botão de **Backup** no rodapé do menu lateral.

### Capítulos Incluídos:
* **Capítulo 1: Projeto Horizonte** — Visão geral e status rápido.
* **Capítulo 2: Minha História** — Seu perfil profissional e metas gerais.
* **Capítulo 3: Meu Momento Atual** — Simulação completa do fluxo de caixa mês a mês.
* **Capítulo 4: Organizando Minhas Finanças** — Configuração de receitas e despesas.
* **Capítulo 5: Eliminando Minhas Dívidas** — Detalhes e datas de quitação das pessoas próximas e Titia Solange.
* **Capítulo 6: Construindo Minha Reserva** — Planejamento para o fundo emergencial de R$ 6.000,00.
* **Capítulo 7: Meus Investimentos** — Gráfico de pizza e orientações de alocação de ativos (60% Fixa, 20% ETFs, 10% FIIs, 10% Caixa).
* **Capítulo 8: Projeto Intercâmbio** — Comparação e datas de viagem estimadas para Malta, Irlanda, Cabo Verde, África do Sul, Itália e França.
* **Capítulo 9: Nova Carreira** — Quadro comparativo de caminhos profissionais.
* **Capítulo 10: Natura** — Mini CRM para gerenciar pedidos, calcular lucros e comissões automáticas de 30%.
* **Capítulo 11: Espaço Victor** — Suas metas em conjunto e mural de recados.
* **Capítulo 12: Diário do Futuro** — Seu Moodboard interativo de imagens, lembranças de gratidão e anotações.

---

## 📊 2. Como Gerar ou Atualizar a Planilha Excel

Se você quiser atualizar ou gerar o arquivo Excel (`Projeto_Horizonte.xlsx`) usando o script Python:

1. Certifique-se de que possui o Python instalado em seu computador.
2. Abra o terminal (PowerShell / Command Prompt) nesta pasta e execute:
   ```bash
   python gerar_planilha.py
   ```
   *(ou `py gerar_planilha.py` caso esteja usando o gerenciador de versões do Windows).*

O script verificará a biblioteca `openpyxl` necessária e gerará automaticamente a planilha formatada com as abas de Fluxo de Caixa, Quitação de Dívidas, Investimentos e Natura.
