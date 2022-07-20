package com.rpgmaker.game

import android.annotation.SuppressLint
import android.app.AlertDialog
import android.content.*
import android.content.res.AssetManager
import android.net.ConnectivityManager
import android.net.NetworkCapabilities
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.text.InputType
import android.util.DisplayMetrics
import android.view.View
import android.view.Window
import android.view.WindowInsets
import android.view.WindowManager
import android.webkit.*
import android.widget.EditText
import android.widget.FrameLayout
import android.widget.Toast
import androidx.annotation.RequiresApi
import androidx.appcompat.app.AppCompatActivity
import androidx.webkit.WebViewAssetLoader
import androidx.webkit.WebViewClientCompat
import com.anjlab.android.iab.v3.BillingProcessor
import com.anjlab.android.iab.v3.TransactionDetails
import com.google.android.gms.ads.*
import com.google.android.gms.ads.RequestConfiguration.TAG_FOR_CHILD_DIRECTED_TREATMENT_TRUE
import com.google.android.gms.ads.FullScreenContentCallback
import com.google.android.gms.ads.interstitial.InterstitialAd
import com.google.android.gms.ads.interstitial.InterstitialAdLoadCallback
import com.google.android.gms.ads.rewardedinterstitial.RewardedInterstitialAd
import com.google.android.gms.ads.rewardedinterstitial.RewardedInterstitialAdLoadCallback
import com.google.android.play.core.review.ReviewManagerFactory
import java.io.BufferedReader
import java.io.InputStreamReader
import java.util.*
import kotlin.collections.ArrayList

class MainActivity : AppCompatActivity(), BillingProcessor.IBillingHandler {
    private lateinit var rpgwebview: WebView
    private lateinit var adContainerView: FrameLayout
    lateinit var bp: BillingProcessor
    private var mainact = this@MainActivity
    private lateinit var mAdView: AdView
    private var initialLayoutComplete = false
    private val adSize: AdSize
        get() {
            val display = windowManager.defaultDisplay
            val outMetrics = DisplayMetrics()
            display.getMetrics(outMetrics)
            val density = outMetrics.density
            var adWidthPixels = adContainerView.width.toFloat()
            if (adWidthPixels == 0f) {
                adWidthPixels = outMetrics.widthPixels.toFloat()
            }
            val adWidth = (adWidthPixels / density).toInt()
            return AdSize.getCurrentOrientationAnchoredAdaptiveBannerAdSize(this, adWidth)
        }
    private var mInterstitialAd: InterstitialAd? = null
    private var mAdIsLoading: Boolean = false
    private var isLoadingAds = false
    private var rewardedInterstitialAd: RewardedInterstitialAd? = null
    override fun onBillingInitialized() {
    }

    override fun onPurchaseHistoryRestored() {
    }

    override fun onProductPurchased(productId: String, details: TransactionDetails?) {
        rpgwebview.evaluateJavascript("javascript:BillingSuccess('$productId')") {
        }
    }

    override fun onBillingError(errorCode: Int, error: Throwable?) {
        if (errorCode == 0) {
            rpgwebview.evaluateJavascript("javascript:BillingFail('OK')") {
            }
        }
        if (errorCode == 1) {
            rpgwebview.evaluateJavascript("javascript:BillingFail('USER_CANCELED')") {
            }
        }
        if (errorCode == 2) {
            rpgwebview.evaluateJavascript("javascript:BillingFail('SERVICE_UNAVAILABLE')") {
            }
        }
        if (errorCode == 3) {
            rpgwebview.evaluateJavascript("javascript:BillingFail('BILLING_UNAVAILABLE')") {
            }
        }
        if (errorCode == 4) {
            rpgwebview.evaluateJavascript("javascript:BillingFail('ITEM_UNAVAILABLE')") {
            }
        }
        if (errorCode == 5) {
            rpgwebview.evaluateJavascript("javascript:BillingFail('DEVELOPER_ERROR')") {
            }
        }
        if (errorCode == 6) {
            rpgwebview.evaluateJavascript("javascript:BillingFail('ERROR')") {
            }
        }
        if (errorCode == 7) {
            rpgwebview.evaluateJavascript("javascript:BillingFail('ITEM_ALREADY_OWNED')") {
            }
        }
        if (errorCode == 8) {
            rpgwebview.evaluateJavascript("javascript:BillingFail('ITEM_NOT_OWNED')") {
            }
        }
    }

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        requestWindowFeature(Window.FEATURE_NO_TITLE)
        setContentView(R.layout.activity_main)
        super.onCreate(savedInstanceState)
        @Suppress("DEPRECATION")
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            window.insetsController?.hide(WindowInsets.Type.statusBars())
        } else {
            window.setFlags(
                WindowManager.LayoutParams.FLAG_FULLSCREEN,
                WindowManager.LayoutParams.FLAG_FULLSCREEN
            )
        }

        bp = BillingProcessor(this, getString(R.string.license_key), this)
        bp.initialize()
        adContainerView = findViewById(R.id.ad_view_container)
        rpgwebview = findViewById(R.id.webview)
        setWebView()
    }

    @Suppress("DEPRECATION")
    private fun isNetworkAvailable(context: Context): Boolean {
        var result = false
        val cm = context.getSystemService(Context.CONNECTIVITY_SERVICE) as ConnectivityManager?
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            cm?.run {
                cm.getNetworkCapabilities(cm.activeNetwork)?.run {
                    result = when {
                        hasTransport(NetworkCapabilities.TRANSPORT_WIFI) -> true
                        hasTransport(NetworkCapabilities.TRANSPORT_CELLULAR) -> true
                        hasTransport(NetworkCapabilities.TRANSPORT_ETHERNET) -> true
                        else -> false
                    }
                }
            }
        } else {
            cm?.run {
                cm.activeNetworkInfo?.run {
                    if (type == ConnectivityManager.TYPE_WIFI) {
                        result = true
                    } else if (type == ConnectivityManager.TYPE_MOBILE) {
                        result = true
                    }
                }
            }
        }
        return result
    }

    private fun initializeBannerAd() {
        mAdView.pause()
        mAdView.visibility = View.GONE
        mAdView.adUnitId = getString(R.string.banner_ad_unit_id)
        mAdView.adSize = adSize
        val adRequest = AdRequest.Builder().build()
        mAdView.loadAd(adRequest)
    }

    private fun initializeInterstitialAd(appUnitId: String) {
        val adRequest = AdRequest.Builder().build()
        InterstitialAd.load(
            this, appUnitId, adRequest,
            object : InterstitialAdLoadCallback() {
                override fun onAdFailedToLoad(adError: LoadAdError) {
                    mInterstitialAd = null
                    mAdIsLoading = false
                }

                override fun onAdLoaded(interstitialAd: InterstitialAd) {
                    mInterstitialAd = interstitialAd
                    mAdIsLoading = false
                }
            }
        )
    }

    @SuppressLint("SetJavaScriptEnabled")
    var setWebView = {
        val webSettings = rpgwebview.settings
        webSettings.allowFileAccess = true
        webSettings.allowContentAccess = true
        webSettings.domStorageEnabled = true
        webSettings.mediaPlaybackRequiresUserGesture = false
        webSettings.useWideViewPort = true
        webSettings.databaseEnabled = true
        webSettings.loadWithOverviewMode = true
        webSettings.defaultTextEncodingName = "utf-8"
        webSettings.javaScriptCanOpenWindowsAutomatically = true
        webSettings.loadsImagesAutomatically = true
        webSettings.javaScriptEnabled = true
        webSettings.cacheMode = WebSettings.LOAD_DEFAULT
        webSettings.mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW

        if (getString(R.string.test_mode) != "true") {
            if (!verifyInstallerId(applicationContext)) {
                Toast.makeText(
                    applicationContext,
                    getString(R.string.is_gdd_msg),
                    Toast.LENGTH_SHORT
                ).show()
                finish()
            }
        }

        rpgwebview.setLayerType(View.LAYER_TYPE_HARDWARE, null)
        val assetLoader = WebViewAssetLoader.Builder()
            .setDomain("example.com") // replace this with your website's domain
            .addPathHandler("/assets/", WebViewAssetLoader.AssetsPathHandler(this))
            .build()
        rpgwebview.webViewClient = LocalContentWebViewClient(assetLoader)
        val inAppHtmlUrl = "https://example.com/assets/index.html"
        try {
            val assetManager: AssetManager = this.assets
            val stream = assetManager.open("index.html")
            val r = BufferedReader(InputStreamReader(stream))
            val total = StringBuilder()
            var line: String?
            while (r.readLine().also { line = it } != null) {
                total.append(line).append("\n")
            }
            rpgwebview.loadDataWithBaseURL(null, total.toString(), "text/html", "UTF-8", null)
            rpgwebview.loadUrl(inAppHtmlUrl)
        } catch (xxx: Exception) {
        }
        MobileAds.initialize(this) { initializationStatus -> loadRewardedInterstitialAd() }
        val testDevices: MutableList<String> = ArrayList()
        testDevices.add(AdRequest.DEVICE_ID_EMULATOR)
        testDevices.add(getString(R.string.admob_device_id))
        val conf = RequestConfiguration.Builder().setTestDeviceIds(testDevices)
            .setTagForChildDirectedTreatment(TAG_FOR_CHILD_DIRECTED_TREATMENT_TRUE).build()
        MobileAds.setRequestConfiguration(conf)
        initializeInterstitialAd(getString(R.string.interstitial_ad_unit_id))
        //    initializeRewardedAd(getString(R.string.rewarded_Ad_unit_id))
        if (rewardedInterstitialAd == null && !isLoadingAds) {
            loadRewardedInterstitialAd()
        }
        mAdView = AdView(this)
        adContainerView.addView(mAdView)
        adContainerView.viewTreeObserver.addOnGlobalLayoutListener {
            if (!initialLayoutComplete) {
                initialLayoutComplete = true
                initializeBannerAd()
            }
        }
    }

    inner class LocalContentWebViewClient(private val assetLoader: WebViewAssetLoader) :
        WebViewClientCompat() {
        @RequiresApi(21)
        override fun shouldInterceptRequest(
            view: WebView,
            request: WebResourceRequest
        ): WebResourceResponse? {
            return assetLoader.shouldInterceptRequest(request.url)
        }

        override fun shouldInterceptRequest(
            view: WebView,
            url: String
        ): WebResourceResponse? {
            return assetLoader.shouldInterceptRequest(Uri.parse(url))
        }

        override fun shouldOverrideUrlLoading(view: WebView?, url: String?): Boolean {
            val uri = Uri.parse(url)
            if (uri.scheme == "iap") {
                if (uri.authority == "rpgmaker") {
                    if (uri.getQueryParameter("action") == "Purchase") {
                        if (isNetworkAvailable(mainact)) {
                            bp.purchase(mainact, uri.getQueryParameter("productId"))
                        }
                    }
                    if (uri.getQueryParameter("action") == "consumePurchase") {
                        if (isNetworkAvailable(mainact)) {
                            bp.consumePurchase(uri.getQueryParameter("productId"))
                            bp.purchase(mainact, uri.getQueryParameter("productId"))
                        }
                    }
                    if (uri.getQueryParameter("action") == "Subscriptions") {
                        if (isNetworkAvailable(mainact)) {
                            bp.subscribe(mainact, uri.getQueryParameter("productId"))
                        }
                    }

                    if (uri.getQueryParameter("action") == "GetPurchase") {
                        if (isNetworkAvailable(mainact)) {
                            val sku =
                                bp.getPurchaseListingDetails(uri.getQueryParameter("productId"))
                            rpgwebview.evaluateJavascript(
                                "javascript:BillingGetPurchase('" + uri.getQueryParameter(
                                    "productId"
                                ) + "','" + sku.priceValue + "','" + sku.currency + "')"
                            ) {
                            }
                        }
                    }

                    if (uri.getQueryParameter("action") == "GetConPurchase") {
                        if (isNetworkAvailable(mainact)) {
                            val sku =
                                bp.getPurchaseListingDetails(uri.getQueryParameter("productId"))
                            rpgwebview.evaluateJavascript(
                                "javascript:BillingGetConPurchase('" + uri.getQueryParameter(
                                    "productId"
                                ) + "','" + sku.priceValue + "','" + sku.currency + "')"
                            ) {
                            }
                        }
                    }

                    if (uri.getQueryParameter("action") == "GetSubscriptions") {
                        if (isNetworkAvailable(mainact)) {
                            val sku =
                                bp.getSubscriptionListingDetails(uri.getQueryParameter("productId"))
                            rpgwebview.evaluateJavascript(
                                "javascript:BillingGetSubscriptions('" + uri.getQueryParameter(
                                    "productId"
                                ) + "','" + sku.priceValue + "','" + sku.currency + "')"
                            ) {
                            }
                        }
                    }

                    if (uri.getQueryParameter("action") == "Restore") {
                        if (isNetworkAvailable(mainact)) {
                            bp.loadOwnedPurchasesFromGoogle()
                            if (bp.isPurchased(uri.getQueryParameter("productId"))) {
                                rpgwebview.evaluateJavascript(
                                    "javascript:RestorePurchase('" + uri.getQueryParameter(
                                        "productId"
                                    ) + "')"
                                ) {
                                }
                            }
                        }
                    }

                    if (uri.getQueryParameter("action") == "Restore_Sub") {
                        if (isNetworkAvailable(mainact)) {
                            bp.loadOwnedPurchasesFromGoogle()
                            val subscriptionTransactionDetails =
                                bp.getSubscriptionTransactionDetails(uri.getQueryParameter("productId"))
                            if (subscriptionTransactionDetails != null) {
                                rpgwebview.evaluateJavascript(
                                    "javascript:BillingSubscription('" + uri.getQueryParameter(
                                        "productId"
                                    ) + "','" + true + "')"
                                ) {
                                }
                            } else {
                                rpgwebview.evaluateJavascript(
                                    "javascript:BillingSubscription('" + uri.getQueryParameter(
                                        "productId"
                                    ) + "','" + false + "')"
                                ) {
                                }
                            }
                        }
                    }
                }
                return true
            }
            if (uri.scheme == "inapp") {
                if (uri.authority == "rpgmaker") {
                    if (uri.getQueryParameter("action") == "edittext") {
                        showeditdialog(
                            uri.getQueryParameter("title"),
                            uri.getQueryParameter("msg"),
                            uri.getQueryParameter("varld")
                        )
                    }
                    if (uri.getQueryParameter("action") == "exit") {
                        finish()
                    }
                    if (uri.getQueryParameter("action") == "review") {
                        val reviewManager = ReviewManagerFactory.create(this@MainActivity)
                        val requestReviewFlow = reviewManager.requestReviewFlow()
                        requestReviewFlow.addOnCompleteListener { request ->
                            if (request.isSuccessful) {

                                val reviewInfo = request.result
                                val flow =
                                    reviewManager.launchReviewFlow(this@MainActivity, reviewInfo)
                                flow.addOnCompleteListener {
                                }
                            }
                        }
                    }
                    if (uri.getQueryParameter("action") == "link") {
                        val urls = uri.getQueryParameter("urlargs")
                        try {
                            val i = Intent("android.intent.action.MAIN")
                            i.component =
                                ComponentName.unflattenFromString("com.android.chrome/com.android.chrome.Main")
                            i.addCategory("android.intent.category.LAUNCHER")
                            i.data = Uri.parse(urls)
                            startActivity(i)
                        } catch (e: ActivityNotFoundException) {
                            // Chrome is not installed
                            val i = Intent(Intent.ACTION_VIEW, Uri.parse(urls))
                            startActivity(i)
                        }
                    }
                    //Blocking Capture
                    if (uri.getQueryParameter("action") == "capture") {
                        if (uri.getQueryParameter("state") == "true") {
                            window.clearFlags(WindowManager.LayoutParams.FLAG_SECURE)
                        }else{
                            window.addFlags(WindowManager.LayoutParams.FLAG_SECURE)
                        }
                    }
                }

                return true
            }
            if (uri.scheme == "admob") {
                if (uri.authority == "rpgmaker") {
                    if (uri.getQueryParameter("action") == "callBannerAd") {
                        if (isNetworkAvailable(mainact)) {
                            if (uri.getQueryParameter("state") == "true") {
                                mAdView.resume()
                                mAdView.visibility = View.VISIBLE
                            } else {
                                mAdView.pause()
                                mAdView.visibility = View.GONE
                            }
                        }
                    }

                    if (uri.getQueryParameter("action") == "callIntAd") {
                        if (isNetworkAvailable(mainact)) {
                            showInterstitial()
                        }
                    }
                    if (uri.getQueryParameter("action") == "callNativeAd") {
                        if (isNetworkAvailable(mainact)) {
                            return false
                        }
                    }
                    if (uri.getQueryParameter("action") == "callRewardInterAd") {
                        if (isNetworkAvailable(mainact)) {
                            loadRewardedInterstitialAd()
                            rewardedInterstitialAd?.show(
                                mainact
                            ) {
                                rpgwebview.evaluateJavascript(
                                    "javascript:RewardInterAd('" + uri.getQueryParameter(
                                        "rewardId"
                                    ) + "')"
                                ) {

                                }
                            }
                            rewardedInterstitialAd = null
                        }
                    }
                }
                return true
            }
            return super.shouldOverrideUrlLoading(view, url)
        }
    }

    private fun showInterstitial() {
        if (mInterstitialAd != null) {
            mInterstitialAd?.fullScreenContentCallback = object : FullScreenContentCallback() {
                override fun onAdDismissedFullScreenContent() {
                    mInterstitialAd = null
                    loadAd()
                }

                override fun onAdFailedToShowFullScreenContent(adError: AdError?) {
                    mInterstitialAd = null
                }

                override fun onAdShowedFullScreenContent() {

                }
            }
            mInterstitialAd?.show(this)
        }
    }

    private fun loadAd() {
        val adRequest = AdRequest.Builder().build()
        InterstitialAd.load(
            this, getString(R.string.interstitial_ad_unit_id), adRequest,
            object : InterstitialAdLoadCallback() {
                override fun onAdFailedToLoad(adError: LoadAdError) {
                    mInterstitialAd = null
                    mAdIsLoading = false
                }

                override fun onAdLoaded(interstitialAd: InterstitialAd) {
                    mInterstitialAd = interstitialAd
                    mAdIsLoading = false
                }
            }
        )
    }

    private fun showeditdialog(texttitle: String?, textmsg: String?, varld: String?) {
        val builder: AlertDialog.Builder = AlertDialog.Builder(this)
        builder.setTitle(texttitle)
        val input = EditText(this)
        input.hint = textmsg
        input.inputType = InputType.TYPE_CLASS_TEXT
        builder.setView(input)
        builder.setPositiveButton(getString(R.string.are_you_Ok)) { _, _ ->
            val m_Text = input.text.toString()
            rpgwebview.evaluateJavascript(
                "javascript:Showeditdialog('$m_Text','$varld')"
            ) {
            }
        }
        builder.setNegativeButton(getString(R.string.are_you_Cancel)) { dialog, _ ->
            rpgwebview.evaluateJavascript(
                "javascript:Showeditdialog(0,'$varld')"
            ) {
            }
            dialog.cancel()
        }
        builder.show()
    }

    private fun verifyInstallerId(context: Context): Boolean {
        val validInstallers: List<String> =
            ArrayList(listOf("com.android.vending", "com.google.android.feedback"))
        val installer: String? =
            context.packageManager.getInstallerPackageName(context.packageName)
        return installer != null && validInstallers.contains(installer)
    }

    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        if (!bp.handleActivityResult(requestCode, resultCode, data))
            super.onActivityResult(requestCode, resultCode, data)
    }


    public override fun onDestroy() {
        mAdView.destroy()
        bp.release()
        super.onDestroy()
    }

    public override fun onPause() {
        mAdView.pause()
        super.onPause()
    }

    public override fun onResume() {
        super.onResume()
        mAdView.resume()
    }

    override fun onBackPressed() {
        val builder = AlertDialog.Builder(this)
        builder.setCancelable(false)
        builder.setTitle(getString(R.string.are_you_exit_title))
        builder.setMessage(getString(R.string.are_you_exit_msg))
        builder.setPositiveButton(getString(R.string.are_you_exit_yes)) { _, _ ->
            finish()
        }
        builder.setNegativeButton(
            getString(R.string.are_you_exit_no)
        ) { dialog, _ ->
            dialog.cancel()
        }
        val alert = builder.create()
        alert.show()
    }

    private fun loadRewardedInterstitialAd() {
        if (rewardedInterstitialAd == null) {
            isLoadingAds = true
            val adRequest = AdRequest.Builder().build()
            RewardedInterstitialAd.load(
                this,
                getString(R.string.rewarded_Ad_unit_id),
                adRequest,
                object : RewardedInterstitialAdLoadCallback() {
                    override fun onAdFailedToLoad(adError: LoadAdError) {
                        super.onAdFailedToLoad(adError)
                        isLoadingAds = false
                        rewardedInterstitialAd = null
                    }

                    override fun onAdLoaded(rewardedAd: RewardedInterstitialAd) {
                        super.onAdLoaded(rewardedAd)
                        rewardedInterstitialAd = rewardedAd
                        isLoadingAds = false
                    }

                })
        }
    }
}
