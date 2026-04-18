# Contador Impressora – App iOS (Xcode)

App nativo iOS (SwiftUI) que empacota o sistema web **Controle de Impressões – Colégio Eleve** em um `WKWebView`. Basta abrir no Xcode, ajustar a URL e o Bundle ID, e publicar.

## Estrutura

```
ios/
└── ContadorImpressora/
    ├── ContadorImpressoraApp.swift   # Entry point SwiftUI (@main)
    ├── ContentView.swift             # Tela principal + loader + erro de rede
    ├── WebView.swift                 # Wrapper UIViewRepresentable do WKWebView
    ├── Info.plist                    # Metadados, orientações, ATS, permissões
    ├── Assets.xcassets/              # Ícone, cor de destaque, cor de launch
    └── Preview Content/              # Assets de preview do SwiftUI
```

## Como finalizar no Xcode

1. **Criar o projeto Xcode** (macOS):
   - Abra o Xcode → *File → New → Project…*
   - Escolha **iOS → App**
   - *Product Name*: `ContadorImpressora`
   - *Interface*: **SwiftUI** · *Language*: **Swift**
   - *Organization Identifier*: ex. `br.com.colegioeleve`
   - Salve dentro de `ios/` (sobrescrevendo os arquivos padrão do template se preferir).

2. **Substituir/Adicionar os arquivos gerados** pelos desta pasta:
   - Arraste `ContadorImpressoraApp.swift`, `ContentView.swift`, `WebView.swift` para o target do app.
   - Substitua o `Info.plist` pelo desta pasta (ou mescle as chaves).
   - Use o `Assets.xcassets` desta pasta.

3. **Ajustar a URL** em `ContentView.swift`:
   ```swift
   private let appURL = URL(string: "https://SEU-DOMINIO/contador-impressora/")!
   ```
   Use a URL pública onde o `index.html` + `app.js` estão hospedados (GitHub Pages, Vercel, Netlify, etc.).

4. **Signing**:
   - Em *Signing & Capabilities* selecione sua *Team* Apple Developer.
   - Defina o *Bundle Identifier* (ex. `br.com.colegioeleve.contador`).

5. **Build & Run**:
   - Escolha um simulador (iPhone 15/16) ou dispositivo físico.
   - `⌘R` para rodar.

6. **Publicar na App Store**:
   - *Product → Archive*
   - *Distribute App → App Store Connect*.

## Notas importantes

- **Login Google (OAuth)**: o WebView está configurado para abrir popups na mesma view (ver `WebView.swift`). Se o provedor Google bloquear o user-agent do WKWebView, considere usar `ASWebAuthenticationSession` — mas o fluxo atual do app web deve funcionar em produção.
- **Supabase**: roda normalmente via JS dentro do WebView; nenhum SDK nativo é necessário.
- **Offline**: o app depende da URL web estar acessível. Para modo offline real, seria preciso portar para código nativo.
- **Ícone**: adicione uma imagem 1024×1024 em `Assets.xcassets/AppIcon.appiconset` antes de publicar.
- **iOS mínimo**: o código usa APIs do iOS 17 (ex. `.tint`, `.foregroundStyle`). Defina *iOS Deployment Target* ≥ 17.0 no target (ou ajuste as APIs para versões mais antigas).

## Alternativa: rodar o site localmente dentro do app

Se quiser embutir o `index.html` + `app.js` no bundle (sem depender de servidor):

1. Arraste `index.html`, `app.js`, `style.css`, `conteudos.json`, `alunos_por_turma.json` e a pasta `LOGOS_DOCS/` para o target (marcando *Copy items if needed*).
2. Em `ContentView.swift` troque `appURL` por:
   ```swift
   private let appURL = Bundle.main.url(forResource: "index", withExtension: "html")!
   ```
3. Em `WebView.makeUIView` troque `webView.load(URLRequest(url: url))` por:
   ```swift
   webView.loadFileURL(url, allowingReadAccessTo: url.deletingLastPathComponent())
   ```

Pronto — o app carrega o site embutido e continua usando Supabase online para dados.
