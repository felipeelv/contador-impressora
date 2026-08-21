# Contador Impressora

App iOS nativo em SwiftUI para empacotar o sistema web de Controle de Impressões do Colégio Eleve em um `WKWebView`.

## Requisitos

- Xcode 15 ou superior
- iOS Deployment Target 17.0
- Conta Apple Developer para assinatura e envio à App Store
- URL pública configurada no app: `https://felipeelv.github.io/contador-impressora/`

## Arquivos principais

- `ContadorImpressoraApp.swift`: entry point do app.
- `ContentView.swift`: tela SwiftUI com fundo claro, loader e card de erro.
- `WebView.swift`: wrapper de `WKWebView` com JavaScript, cookies persistentes, navegação por gestos e suporte a popups OAuth.
- `Info.plist`: nome exibido, orientações, launch screen, permissões e App Transport Security.
- `Assets.xcassets`: `AppIcon`, `AccentColor` e `LaunchBackground`.

## Criar o projeto no Xcode

1. Abra o Xcode.
2. Crie um projeto novo em `File > New > Project...`.
3. Escolha `iOS > App`.
4. Configure:
   - Product Name: `Contador Impressora`
   - Interface: `SwiftUI`
   - Language: `Swift`
   - Bundle Identifier: `br.com.colegioeleve.contador`
5. Defina o deployment target como iOS 17.0.

## Arrastar os arquivos

1. No Project Navigator, abra a pasta do target principal.
2. Substitua os arquivos Swift gerados por:
   - `ContadorImpressoraApp.swift`
   - `ContentView.swift`
   - `WebView.swift`
3. Adicione `Info.plist` ao projeto, se ainda não existir.
4. Substitua o conteúdo de `Assets.xcassets` pelos assets deste projeto.
5. Garanta que os arquivos Swift estejam marcados no target `Contador Impressora` em `Target Membership`.

## Team, Signing e Bundle ID

1. Selecione o projeto no Project Navigator.
2. Selecione o target do app.
3. Abra `Signing & Capabilities`.
4. Marque `Automatically manage signing`.
5. Escolha o Team correto da conta Apple Developer.
6. Confirme o Bundle Identifier: `br.com.colegioeleve.contador`.

## Rodar no simulador

1. Escolha um simulador de iPhone ou iPad.
2. Pressione `Cmd + R`.
3. O app deve abrir com o loader `Carregando…` e carregar o Controle de Impressões.
4. Teste login, navegação e retorno ao app após OAuth.

## Archive e App Store Connect

1. Selecione `Any iOS Device` como destino.
2. Abra `Product > Archive`.
3. Quando o Organizer abrir, selecione o archive gerado.
4. Clique em `Distribute App`.
5. Escolha `App Store Connect`.
6. Siga o fluxo de upload e valide assinatura, ícone e metadados.
7. No App Store Connect, complete descrição, screenshots, privacidade e envie para revisão.

## Alternativa offline com index.html no bundle

Caso queira embutir o sistema no app e não depender da URL pública, adicione os arquivos web ao bundle do app e altere o carregamento do `WKWebView` para `loadFileURL`.

Exemplo dentro de `makeUIView` em `WebView.swift`:

```swift
if let fileURL = Bundle.main.url(forResource: "index", withExtension: "html") {
    webView.loadFileURL(fileURL, allowingReadAccessTo: fileURL.deletingLastPathComponent())
} else {
    webView.load(URLRequest(url: url))
}
```

Para essa alternativa funcionar bem, todos os assets referenciados pelo HTML precisam estar no bundle e os caminhos precisam ser relativos ao `index.html`.
