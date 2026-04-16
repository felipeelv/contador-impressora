# Configuração Supabase + Autenticação Google

Este documento contém **todas as credenciais** e o **passo a passo** para reutilizar o mesmo banco de dados Supabase usado no projeto `contador-impressora` em outros sistemas, com autenticação via Google OAuth.

> ⚠️ **Atenção:** A chave `anon` abaixo é pública (pode ir ao frontend), mas **nunca** exponha a `service_role` em código client-side. A segurança real é feita por Row Level Security (RLS) no Supabase.

---

## 🤖 Instruções para o Claude Code

> **Leia esta seção primeiro antes de qualquer coisa.**

Quando o usuário pedir para **"integrar o Supabase"**, **"adicionar login com Google"** ou **"conectar ao banco"** em um novo projeto, siga esta ordem:

### Passo 0 — Detecte o stack do projeto atual

Antes de gerar qualquer código, verifique:

1. Existe `package.json`? Se sim, veja `dependencies` para identificar o framework:
   - Tem `next` → use seção **7 (React/Next)** + `.env.local` com prefixo `NEXT_PUBLIC_`
   - Tem `vite` + `react` → use seção **7 (React/Vite)** + `.env` com prefixo `VITE_`
   - Só HTML/JS puro (sem `package.json` ou só dependências simples) → use seção **6 (HTML)**
2. Se não ficar claro, **pergunte ao usuário** qual stack usar antes de prosseguir.

### Passo 1 — O que VOCÊ (Claude Code) pode fazer sozinho

- [x] Criar o arquivo `.env` (ou `.env.local`) com as credenciais da **seção 1**
- [x] Adicionar `.env*` ao `.gitignore`
- [x] Instalar `@supabase/supabase-js@2` via `npm install` (se for projeto NPM)
- [x] Criar `lib/supabase.js` (ou equivalente) seguindo a **seção 4**
- [x] Implementar `signInWithGoogle`, `signOut` e `onAuthStateChange` conforme **seção 5.3 / 5.4**
- [x] Aplicar a restrição de domínio `colegioeleve.com.br` (se o usuário confirmar que é o mesmo colégio)
- [x] Gerar SQL de criação de tabelas quando o usuário descrever o modelo de dados, seguindo o padrão da **seção 2** (com prefixo `novoapp_` + RLS habilitado)
- [x] Criar o componente/página de login baseado na **seção 6** (HTML) ou **seção 7** (React)

### Passo 2 — O que SÓ o usuário pode fazer (peça explicitamente no final)

Ao terminar a implementação, **sempre** informe ao usuário que ele precisa fazer manualmente:

1. **Supabase Dashboard** → `Auth → URL Configuration → Redirect URLs`: adicionar a URL do novo projeto (ex: `http://localhost:3000/**` e URL de produção)
2. **Google Cloud Console** → `OAuth Client → Authorized JavaScript origins`: adicionar a mesma URL
3. **Supabase → SQL Editor**: rodar o SQL das tabelas novas (gerado por você)
4. Reiniciar o servidor de dev depois de criar o `.env`

### Passo 3 — Regras importantes

- **NÃO** invente nomes de tabela — use sempre `novoapp_*` ou pergunte ao usuário qual prefixo/schema usar
- **NÃO** use a chave `service_role` — só existe a `anon` neste documento e é o que deve ir ao frontend
- **SEMPRE** habilite RLS (`enable row level security`) em tabelas novas + crie pelo menos uma policy
- **NÃO** tente acessar o Dashboard Supabase nem o Google Cloud Console — são ações do usuário
- Se o usuário quiser restringir a um domínio diferente de `colegioeleve.com.br`, pergunte qual antes de codar

### Passo 4 — Teste final

Depois de tudo pronto, rode (quando possível):
- `npm run dev` (ou equivalente) e verifique se o servidor sobe sem erros
- Abra a página de login no navegador e confirme que o botão "Entrar com Google" aparece
- Reporte ao usuário a URL local + lembre-o dos **Passos 2** do dashboard

---

## 1. Credenciais do Projeto Supabase

```env
# URL pública da API do projeto
SUPABASE_URL=https://kmnosfjpxpsmtjqgwoih.supabase.co

# Project Ref (usado no Dashboard / CLI)
SUPABASE_PROJECT_REF=kmnosfjpxpsmtjqgwoih

# Chave anon/public (pode ser usada no frontend)
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imttbm9zZmpweHBzbXRqcWd3b2loIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxNzEzNDYsImV4cCI6MjA4ODc0NzM0Nn0.qiB-divCLL4sTWO_XJacQXLBFHVOrt39AU_5s7a7b7w

# Domínio permitido para login (regra de negócio do Colégio Eleve)
ALLOWED_DOMAIN=colegioeleve.com.br
```

### Como usar em um novo projeto

**`.env`** (Next.js / Vite / Node):
```env
NEXT_PUBLIC_SUPABASE_URL=https://kmnosfjpxpsmtjqgwoih.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imttbm9zZmpweHBzbXRqcWd3b2loIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxNzEzNDYsImV4cCI6MjA4ODc0NzM0Nn0.qiB-divCLL4sTWO_XJacQXLBFHVOrt39AU_5s7a7b7w
NEXT_PUBLIC_ALLOWED_DOMAIN=colegioeleve.com.br
```

> ⚠️ Lembre-se de adicionar `.env` ao `.gitignore`.

---

## 2. Criando as tabelas do novo projeto

Como você vai usar o mesmo projeto Supabase para um **sistema diferente**, basta criar as tabelas do novo projeto direto no [Table Editor](https://supabase.com/dashboard/project/kmnosfjpxpsmtjqgwoih/editor) ou via SQL no [SQL Editor](https://supabase.com/dashboard/project/kmnosfjpxpsmtjqgwoih/sql).

> 💡 **Dica:** use um **prefixo** nos nomes das tabelas do novo projeto (ex: `novoapp_usuarios`, `novoapp_pedidos`) para não conflitar com as tabelas do projeto atual (`impressoes`). Alternativamente, crie um **schema** separado no Postgres (`create schema novoapp;`) — nesse caso lembre de expô-lo em **Settings → API → Exposed schemas**.

Exemplo de criação de tabela via SQL Editor:

```sql
create table public.novoapp_exemplo (
  id         bigint generated always as identity primary key,
  created_at timestamptz default now(),
  user_id    uuid references auth.users(id),
  titulo     text not null
);

-- Habilita Row Level Security
alter table public.novoapp_exemplo enable row level security;

-- Policy: usuário só vê/edita os próprios registros
create policy "owner_can_all" on public.novoapp_exemplo
  for all using (auth.uid() = user_id);
```

> ⚠️ **Importante:** sempre habilite **RLS** em tabelas novas, porque a `anon key` é pública. Sem RLS, qualquer um com a chave consegue ler/escrever tudo.

---

## 3. Instalação do cliente Supabase

### Via CDN (HTML puro, como no projeto atual)
```html
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
```

### Via NPM (React / Next / Vite / Node)
```bash
npm install @supabase/supabase-js
```

---

## 4. Inicializando o cliente

### JavaScript (browser puro)
```js
const SUPABASE_URL  = 'https://kmnosfjpxpsmtjqgwoih.supabase.co';
const SUPABASE_KEY  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'; // anon key
const { createClient } = supabase;
const db = createClient(SUPABASE_URL, SUPABASE_KEY);
```

### ES Modules / React / Next
```js
// lib/supabase.js
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);
```

---

## 5. Autenticação com Google

### 5.1 Configuração no Google Cloud Console

O provedor Google **já está configurado** no projeto Supabase existente, então se você usar o mesmo projeto Supabase o login funcionará automaticamente. Caso precise adicionar uma nova URL de redirect (por exemplo, novo domínio do novo projeto):

1. Acesse [Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials)
2. Selecione o projeto vinculado ao `kmnosfjpxpsmtjqgwoih`
3. Edite o OAuth 2.0 Client ID existente
4. Em **Authorized redirect URIs**, adicione:
   ```
   https://kmnosfjpxpsmtjqgwoih.supabase.co/auth/v1/callback
   ```
   (esse já existe — **não remova**).
5. Em **Authorized JavaScript origins**, adicione a URL do seu novo projeto (ex: `https://novo-projeto.vercel.app`, `http://localhost:3000`).

### 5.2 Configuração no Supabase Dashboard

No [Dashboard Supabase](https://supabase.com/dashboard/project/kmnosfjpxpsmtjqgwoih/auth/url-configuration):

1. **Authentication → URL Configuration**
   - Adicione a URL do novo projeto em **Redirect URLs** (ex: `https://novo-projeto.vercel.app/**`, `http://localhost:3000/**`).
2. **Authentication → Providers → Google**
   - Deve estar **Enabled** (já está).
   - O `Client ID` e `Client Secret` do Google devem estar preenchidos (já estão).

### 5.3 Função de login (JavaScript)

```js
async function signInWithGoogle() {
  await db.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.href,
      queryParams: { hd: 'colegioeleve.com.br' }, // força seleção de conta do domínio
    },
  });
}

async function signOut() {
  await db.auth.signOut();
}
```

### 5.4 Ouvindo mudanças de sessão + restrição de domínio

```js
const ALLOWED_DOMAIN = 'colegioeleve.com.br';

db.auth.onAuthStateChange(async (event, session) => {
  if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
    if (!session) {
      // Sem sessão -> mostrar tela de login
      return;
    }

    const email = session.user.email || '';
    if (!email.endsWith('@' + ALLOWED_DOMAIN)) {
      // Usuário fora do domínio permitido -> desloga
      await db.auth.signOut();
      return;
    }

    // Usuário autenticado e válido
    const user = session.user;
    console.log('Logado como:', user.email);
    console.log('Nome:', user.user_metadata?.full_name);
    console.log('Avatar:', user.user_metadata?.avatar_url);

  } else if (event === 'SIGNED_OUT') {
    // Limpar estado local
  }
});
```

### 5.5 Obter sessão atual sob demanda

```js
const { data: { session } } = await db.auth.getSession();
const currentUser = session?.user;
const email = currentUser?.email;
const name  = currentUser?.user_metadata?.full_name;
```

---

## 6. Exemplo completo (HTML mínimo)

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Novo Projeto - Login Google</title>
  <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
</head>
<body>
  <div id="login">
    <button onclick="signInWithGoogle()">Entrar com Google</button>
  </div>
  <div id="app" style="display:none">
    <p>Olá, <span id="nome"></span></p>
    <button onclick="signOut()">Sair</button>
  </div>

  <script>
    const SUPABASE_URL   = 'https://kmnosfjpxpsmtjqgwoih.supabase.co';
    const SUPABASE_KEY   = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imttbm9zZmpweHBzbXRqcWd3b2loIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxNzEzNDYsImV4cCI6MjA4ODc0NzM0Nn0.qiB-divCLL4sTWO_XJacQXLBFHVOrt39AU_5s7a7b7w';
    const ALLOWED_DOMAIN = 'colegioeleve.com.br';

    const { createClient } = supabase;
    const db = createClient(SUPABASE_URL, SUPABASE_KEY);

    async function signInWithGoogle() {
      await db.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.href,
          queryParams: { hd: ALLOWED_DOMAIN },
        },
      });
    }

    async function signOut() {
      await db.auth.signOut();
      document.getElementById('login').style.display = '';
      document.getElementById('app').style.display = 'none';
    }

    db.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
        if (!session) return;
        if (!session.user.email.endsWith('@' + ALLOWED_DOMAIN)) {
          await db.auth.signOut();
          return;
        }
        document.getElementById('login').style.display = 'none';
        document.getElementById('app').style.display = '';
        document.getElementById('nome').textContent =
          session.user.user_metadata?.full_name || session.user.email;
      }
      if (event === 'SIGNED_OUT') {
        document.getElementById('login').style.display = '';
        document.getElementById('app').style.display = 'none';
      }
    });
  </script>
</body>
</html>
```

---

## 7. Exemplo (React + @supabase/supabase-js)

```jsx
// lib/supabase.js
import { createClient } from '@supabase/supabase-js';
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
);

// App.jsx
import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';

const ALLOWED_DOMAIN = 'colegioeleve.com.br';

export default function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session && !session.user.email.endsWith('@' + ALLOWED_DOMAIN)) {
        await supabase.auth.signOut();
        return;
      }
      setUser(session?.user ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const login = () =>
    supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.href,
        queryParams: { hd: ALLOWED_DOMAIN },
      },
    });

  const logout = () => supabase.auth.signOut();

  if (!user) return <button onClick={login}>Entrar com Google</button>;
  return (
    <div>
      <p>Olá, {user.user_metadata?.full_name || user.email}</p>
      <button onClick={logout}>Sair</button>
    </div>
  );
}
```

---

## 8. Consultando dados (exemplos genéricos)

Substitua `sua_tabela` pelo nome da tabela que você criar no novo projeto.

```js
// Buscar registros
const { data, error } = await db
  .from('sua_tabela')
  .select('*')
  .order('created_at', { ascending: false });

// Inserir novo registro
const { data: { session } } = await db.auth.getSession();
const { data, error } = await db
  .from('sua_tabela')
  .insert({
    titulo: 'Exemplo',
    user_id: session.user.id, // vínculo com auth.users
  })
  .select()
  .single();

// Atualizar
const { error } = await db
  .from('sua_tabela')
  .update({ titulo: 'Novo título' })
  .eq('id', 123);

// Deletar
const { error } = await db.from('sua_tabela').delete().eq('id', 123);
```

---

## 9. Checklist para um novo projeto

- [ ] Instalar/importar `@supabase/supabase-js@2`
- [ ] Configurar `.env` com `SUPABASE_URL` e `SUPABASE_ANON_KEY`
- [ ] Criar as tabelas do novo projeto no Supabase (com prefixo ou schema próprio)
- [ ] Habilitar **RLS** e criar policies em todas as tabelas novas
- [ ] Adicionar a URL do novo projeto em **Supabase → Auth → URL Configuration → Redirect URLs**
- [ ] Adicionar a URL do novo projeto em **Google Cloud → OAuth Client → Authorized JavaScript origins**
- [ ] Implementar `signInWithGoogle`, `signOut` e `onAuthStateChange`
- [ ] Aplicar a regra de domínio (`@colegioeleve.com.br`) no `onAuthStateChange` (se for o caso)
- [ ] Testar em `localhost` e em produção

---

## 10. Links úteis

- Dashboard do projeto: https://supabase.com/dashboard/project/kmnosfjpxpsmtjqgwoih
- Auth → URL Configuration: https://supabase.com/dashboard/project/kmnosfjpxpsmtjqgwoih/auth/url-configuration
- Auth → Providers: https://supabase.com/dashboard/project/kmnosfjpxpsmtjqgwoih/auth/providers
- Table Editor: https://supabase.com/dashboard/project/kmnosfjpxpsmtjqgwoih/editor
- Docs oficiais Supabase Auth + Google: https://supabase.com/docs/guides/auth/social-login/auth-google
