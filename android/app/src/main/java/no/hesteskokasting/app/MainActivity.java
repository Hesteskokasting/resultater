package no.hesteskokasting.app;

import android.net.Uri;
import android.os.Bundle;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.BridgeWebViewClient;
import ee.forgr.capacitor.social.login.ModifiedMainActivityForSocialLoginPlugin;

// The social-login plugin refuses to pass custom scopes (which the Google sign-in
// call does) unless the host activity implements this marker interface.
public class MainActivity extends BridgeActivity implements ModifiedMainActivityForSocialLoginPlugin {
    @Override
    public void IHaveModifiedTheMainActivityForTheUseWithSocialLoginPlugin() {}

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        // Always fetch the live site fresh — a cached shell would silently mask
        // an offline cold start instead of surfacing the error.html fallback below.
        this.bridge.getWebView().getSettings().setCacheMode(WebSettings.LOAD_NO_CACHE);
        this.bridge.getWebView().setWebViewClient(new BridgeWebViewClient(this.bridge) {
            @Override
            public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
                super.onReceivedError(view, request, error);
                if (request.isForMainFrame()) {
                    String failedUrl = Uri.encode(request.getUrl().toString());
                    view.loadUrl("file:///android_asset/error.html?url=" + failedUrl);
                }
            }
        });
    }
}
