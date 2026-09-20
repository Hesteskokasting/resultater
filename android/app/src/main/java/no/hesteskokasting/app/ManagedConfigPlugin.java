package no.hesteskokasting.app;

import android.content.Context;
import android.content.RestrictionsManager;
import android.os.Bundle;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

// Managed configuration pushed by an MDM (Intune). The keys an admin can set are
// declared in res/xml/app_restrictions.xml; everything present is passed through
// as-is, so adding a key there needs no change here.
@CapacitorPlugin(name = "ManagedConfig")
public class ManagedConfigPlugin extends Plugin {
    @PluginMethod
    public void get(PluginCall call) {
        JSObject result = new JSObject();
        RestrictionsManager manager =
            (RestrictionsManager) getContext().getSystemService(Context.RESTRICTIONS_SERVICE);
        // Read fresh on every call: the restrictions bundle is replaced whenever the
        // MDM pushes new values, so there is nothing to cache or subscribe to.
        Bundle restrictions = manager == null ? null : manager.getApplicationRestrictions();
        if (restrictions != null) {
            for (String key : restrictions.keySet()) {
                Object value = restrictions.get(key);
                if (value != null) result.put(key, value);
            }
        }
        call.resolve(result);
    }
}
