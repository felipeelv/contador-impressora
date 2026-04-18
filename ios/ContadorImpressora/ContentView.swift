import SwiftUI

struct ContentView: View {
    // Altere para a URL pública do seu app (GitHub Pages, Vercel, etc.)
    private let appURL = URL(string: "https://felipeelv.github.io/contador-impressora/")!

    @State private var isLoading = true
    @State private var loadError: String?

    var body: some View {
        ZStack {
            Color(red: 0.973, green: 0.976, blue: 0.984)
                .ignoresSafeArea()

            WebView(url: appURL, isLoading: $isLoading, loadError: $loadError)
                .ignoresSafeArea(edges: .bottom)

            if isLoading {
                VStack(spacing: 16) {
                    ProgressView()
                        .scaleEffect(1.4)
                        .tint(Color(red: 1.0, green: 0.435, blue: 0.239))
                    Text("Carregando…")
                        .font(.system(size: 14, weight: .medium, design: .default))
                        .foregroundStyle(.secondary)
                }
            }

            if let loadError {
                VStack(spacing: 12) {
                    Image(systemName: "wifi.exclamationmark")
                        .font(.system(size: 40))
                        .foregroundStyle(.orange)
                    Text("Não foi possível conectar")
                        .font(.headline)
                    Text(loadError)
                        .font(.footnote)
                        .foregroundStyle(.secondary)
                        .multilineTextAlignment(.center)
                        .padding(.horizontal, 24)
                }
                .padding(24)
                .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 16))
                .padding(24)
            }
        }
    }
}

#Preview {
    ContentView()
}
