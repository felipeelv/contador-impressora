# Configuração Supabase + Autenticação Google

Este documento contém **todas as credenciais** e o **passo a passo** para reutilizar o mesmo banco de dados Supabase usado no projeto `contador-impressora` em outros sistemas, com autenticação via Google OAuth.

> ⚠️ **Atenção:** A chave `anon` abaixo é pública (pode ir ao frontend), mas **nunca** exponha a `service_role` em código client-side. A segurança real é feita por Row Level Security (RLS) no Supabase.

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

## 2. Tabelas existentes no banco

A única tabela atualmente usada é **`impressoes`**:

| Coluna          | Tipo        | Descrição                                |
|-----------------|-------------|------------------------------------------|
| `id`            | bigint (PK) | Gerado automaticamente                   |
| `data`          | timestamptz | Data do lançamento                       |
| `disciplina`    | text        | Nome da disciplina                       |
| `serie`         | text        | Série derivada da turma                  |
| `turma`         | text        | Código da turma                          |
| `bimestre`      | text        | Bimestre (1,2,3,4)                       |
| `unidade`       | text        | Unidade/conteúdo                         |
| `tipo`          | text        | Tipo de impressão                        |
| `impressora`    | text        | Impressora usada                         |
| `paginas`       | int         | Páginas por aluno                        |
| `total_paginas` | int         | Total de páginas                         |
| `folhas`        | int         | Total de folhas                          |
| `user_email`    | text        | Email do usuário que lançou              |
| `user_name`     | text        | Nome do usuário que lançou               |

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

## 8. Consultando dados (exemplos)

```js
// Buscar todas as impressões
const { data, error } = await db
  .from('impressoes')
  .select('*')
  .order('data', { ascending: false });

// Inserir novo registro
const { data, error } = await db
  .from('impressoes')
  .insert({
    data: new Date().toISOString(),
    disciplina: 'Matemática',
    turma: '9A',
    bimestre: '1',
    folhas: 30,
    user_email: session.user.email,
    user_name:  session.user.user_metadata?.full_name,
  })
  .select()
  .single();

// Deletar
const { error } = await db.from('impressoes').delete().eq('id', 123);
```

---

## 9. Checklist para um novo projeto

- [ ] Instalar/importar `@supabase/supabase-js@2`
- [ ] Configurar `.env` com `SUPABASE_URL` e `SUPABASE_ANON_KEY`
- [ ] Adicionar a URL do novo projeto em **Supabase → Auth → URL Configuration → Redirect URLs**
- [ ] Adicionar a URL do novo projeto em **Google Cloud → OAuth Client → Authorized JavaScript origins**
- [ ] Implementar `signInWithGoogle`, `signOut` e `onAuthStateChange`
- [ ] Aplicar a regra de domínio (`@colegioeleve.com.br`) no `onAuthStateChange`
- [ ] Testar em `localhost` e em produção

---

## 10. Links úteis

- Dashboard do projeto: https://supabase.com/dashboard/project/kmnosfjpxpsmtjqgwoih
- Auth → URL Configuration: https://supabase.com/dashboard/project/kmnosfjpxpsmtjqgwoih/auth/url-configuration
- Auth → Providers: https://supabase.com/dashboard/project/kmnosfjpxpsmtjqgwoih/auth/providers
- Table Editor: https://supabase.com/dashboard/project/kmnosfjpxpsmtjqgwoih/editor
- Docs oficiais Supabase Auth + Google: https://supabase.com/docs/guides/auth/social-login/auth-google
