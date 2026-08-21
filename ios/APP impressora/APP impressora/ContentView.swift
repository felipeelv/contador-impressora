import SwiftUI

struct ContentView: View {
    private enum Constants {
        static let siteURL = URL(string: "https://felipeelv.github.io/contador-impressora/")!
        static let backgroundColor = Color(red: 0.973, green: 0.976, blue: 0.980)
        static let primaryOrange = Color(red: 1.0, green: 0.435, blue: 0.239)
        static let darkText = Color(red: 0.176, green: 0.176, blue: 0.176)
    }

    @State private var isLoading = true
    @State private var loadError: WebView.LoadError?
    @State private var reloadToken = 0

    var body: some View {
        ZStack {
            Constants.backgroundColor
                .ignoresSafeArea()

            WebView(
                url: Constants.siteURL,
                isLoading: $isLoading,
                loadError: $loadError,
                reloadToken: reloadToken
            )
            .ignoresSafeArea()

            if isLoading {
                loadingOverlay
            }

            if let loadError {
                errorCard(message: loadError.message)
                    .padding(24)
            }
        }
    }

    private var loadingOverlay: some View {
        VStack(spacing: 12) {
            ProgressView()
                .tint(Constants.primaryOrange)
                .controlSize(.large)

            Text("Carregando…")
                .font(.system(.callout, design: .default, weight: .medium))
                .foregroundStyle(Constants.darkText)
        }
        .padding(.horizontal, 24)
        .padding(.vertical, 20)
        .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 8, style: .continuous))
        .accessibilityElement(children: .combine)
    }

    private func errorCard(message: String) -> some View {
        VStack(spacing: 16) {
            Image(systemName: "wifi.exclamationmark")
                .font(.system(size: 34, weight: .semibold))
                .foregroundStyle(Constants.primaryOrange)
                .accessibilityHidden(true)

            VStack(spacing: 6) {
                Text("Erro de conexão")
                    .font(.system(.headline, design: .default, weight: .semibold))
                    .foregroundStyle(Constants.darkText)

                Text(message)
                    .font(.system(.subheadline, design: .default))
                    .foregroundStyle(Constants.darkText.opacity(0.78))
                    .multilineTextAlignment(.center)
                    .fixedSize(horizontal: false, vertical: true)
            }

            Button {
                reloadToken += 1
            } label: {
                Label("Tentar novamente", systemImage: "arrow.clockwise")
                    .font(.system(.callout, design: .default, weight: .semibold))
                    .frame(maxWidth: .infinity)
            }
            .buttonStyle(.borderedProminent)
            .tint(Constants.primaryOrange)
        }
        .padding(22)
        .frame(maxWidth: 360)
        .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 8, style: .continuous))
        .shadow(color: .black.opacity(0.08), radius: 18, x: 0, y: 8)
    }
}

#Preview {
    ContentView()
}
