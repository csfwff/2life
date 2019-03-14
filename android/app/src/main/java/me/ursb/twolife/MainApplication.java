package me.ursb.twolife;

import android.app.Application;


import com.facebook.react.ReactApplication;
import com.learnium.RNDeviceInfo.RNDeviceInfo;
import com.RNFetchBlob.RNFetchBlobPackage;
import com.theweflex.react.WeChatPackage;
import fr.greweb.reactnativeviewshot.RNViewShotPackage;
import com.oblador.vectoricons.VectorIconsPackage;
import com.tradle.react.UdpSocketsModule;
import com.rnfingerprint.FingerprintAuthPackage;
import com.peel.react.TcpSocketsModule;
import com.horcrux.svg.SvgPackage;
import org.devio.rn.splashscreen.SplashScreenReactPackage;
import com.bitgo.randombytes.RandomBytesPackage;
import com.peel.react.rnos.RNOSModule;
import com.BV.LinearGradient.LinearGradientPackage;
import com.imagepicker.ImagePickerPackage;
import com.dooboolab.RNIap.RNIapPackage;
import com.rnfs.RNFSPackage;
import cn.jpush.reactnativejpush.JPushPackage;
import com.horcrux.svg.SvgPackage;
import com.rnfs.RNFSPackage;
import fr.greweb.reactnativeviewshot.RNViewShotPackage;
import com.rnfingerprint.FingerprintAuthPackage;
import com.BV.LinearGradient.LinearGradientPackage;
import com.oblador.vectoricons.VectorIconsPackage;
import com.horcrux.svg.SvgPackage;
import com.bitgo.randombytes.RandomBytesPackage;
import com.RNFetchBlob.RNFetchBlobPackage;

import org.devio.rn.splashscreen.SplashScreenReactPackage;

import com.imagepicker.ImagePickerPackage;
import com.dooboolab.RNIap.RNIapPackage;

//import ca.jaysoo.extradimensions.ExtraDimensionsPackage;
import cn.jpush.reactnativejpush.JPushPackage;

import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;
import com.theweflex.react.WeChatPackage;

import java.util.Arrays;
import java.util.List;

public class MainApplication extends Application implements ReactApplication {

    private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {
        @Override
        public boolean getUseDeveloperSupport() {
            return BuildConfig.DEBUG;
        }

        @Override
        protected List<ReactPackage> getPackages() {
            return Arrays.<ReactPackage>asList(new MainReactPackage(),
            new RNDeviceInfo(),
            new RNFetchBlobPackage(),
            new WeChatPackage(),
            new RNViewShotPackage(),
            new VectorIconsPackage(),
            new UdpSocketsModule(),
            new FingerprintAuthPackage(),
            new TcpSocketsModule(),
            new SvgPackage(),
            new SplashScreenReactPackage(),
            new RandomBytesPackage(),
            new RNOSModule(),
            new LinearGradientPackage(),
            new ImagePickerPackage(),
            new RNIapPackage(),
            new RNFSPackage(),
            new JPushPackage(!BuildConfig.DEBUG, !BuildConfig.DEBUG)
            //new ExtraDimensionsPackage(),
                 );
        }
    };

    @Override
    public ReactNativeHost getReactNativeHost() {
        return mReactNativeHost;
    }

    @Override
    public void onCreate() {
        super.onCreate();
        SoLoader.init(this, /* native exopackage */ false);
    }
}
