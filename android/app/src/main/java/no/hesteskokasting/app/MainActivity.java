package no.hesteskokasting.app;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;
import ee.forgr.capacitor.social.login.ModifiedMainActivityForSocialLoginPlugin;

// The social-login plugin refuses to pass custom scopes (which the Google sign-in
// call does) unless the host activity implements this marker interface.
public class MainActivity extends BridgeActivity implements ModifiedMainActivityForSocialLoginPlugin {
    @Override
    public void IHaveModifiedTheMainActivityForTheUseWithSocialLoginPlugin() {}

    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(ManagedConfigPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
