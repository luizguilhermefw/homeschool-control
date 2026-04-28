# 🚀 Homeschool Control

SaaS completo para gestão de ensino domiciliar (homeschooling), permitindo planejamento, execução e acompanhamento do aprendizado de forma simples e organizada.

---

## ✨ Visão do Projeto

O **Homeschool Control** foi criado para ajudar famílias a organizarem a rotina educacional dos seus filhos, com foco em:

- 📚 Planejamento estruturado de estudos  
- ✅ Execução diária (to-do de atividades)  
- 📊 Acompanhamento de progresso  
- 👨‍👩‍👧‍👦 Multi-tenant (cada família isolada)  

---

## 🧠 Principais Funcionalidades

### 🔐 Autenticação & Multi-tenant
- Login com JWT
- Isolamento completo por família (tenant)
- Segurança garantida via Prisma + AsyncLocalStorage

### 👨‍🎓 Estudantes
- Cadastro de alunos
- Associação com planos e atividades

### 📅 Anos Letivos
- Organização por ciclos educacionais

### 📘 Disciplinas
- Cadastro com identificação visual (cores)

### 🧩 Planejamento de Estudos
- Criação de planos de estudo
- Organização em trilha (timeline)
- Sequência de aulas (StudyPlanItems)

### ✅ Diário de Execução
- Registro de atividades diárias
- Marcar como concluído
- Anotações e tempo gasto
- Suporte a atividades livres ou vinculadas ao plano

### 📊 Dashboard Inteligente
- Progresso do dia
- Ações rápidas
- Experiência orientada à execução

---

## 🏗️ Arquitetura

### Backend
- 🟢 NestJS
- 🟢 Prisma ORM
- 🟢 PostgreSQL (Neon)
- 🟢 JWT Authentication
- 🟢 Multi-tenant com AsyncLocalStorage

### Frontend
- 🟢 Vue 3
- 🟢 Vite
- 🟢 Pinia (state management)
- 🟢 Vue Router
- 🟢 Axios (com interceptor)

---

## 🔐 Segurança

- Isolamento de dados por tenant (nível banco)
- Prisma Extension garantindo `tenantId` automático
- Validações anti-vazamento entre tenants
- Soft delete aplicado em toda a base

---

## ⚙️ Como rodar o projeto

### 1. Clonar repositório

```bash
git clone https://github.com/seu-usuario/homeschool-control.git
cd homeschool-control
