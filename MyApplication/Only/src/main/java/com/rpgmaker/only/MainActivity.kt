package com.rpgmaker.only

import android.annotation.SuppressLint
import android.app.AlertDialog
import android.content.ActivityNotFoundException
import android.content.ComponentName
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.text.InputType
import android.view.View
import android.view.Window
import android.view.WindowInsets
import android.view.WindowManager
import android.webkit.WebResourceRequest
import android.webkit.WebResourceResponse
import android.webkit.WebSettings
import android.webkit.WebView
import android.widget.EditText
import androidx.annotation.RequiresApi
import androidx.appcompat.app.AppCompatActivity
import androidx.webkit.WebViewAssetLoader
import androidx.webkit.WebViewClientCompat

class MainActivity : AppCompatActivity() {
    private lateinit var rpgwebview: WebView

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
        rpgwebview = findViewById(R.id.webview)
        setWebView()
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
        rpgwebview.setLayerType(View.LAYER_TYPE_HARDWARE, null)
        val assetLoader = WebViewAssetLoader.Builder()
            .setDomain("example.com") // replace this with your website's domain
            .addPathHandler("/assets/", WebViewAssetLoader.AssetsPathHandler(this))
            .build()
        rpgwebview.webViewClient = LocalContentWebViewClient(assetLoader)
        val inAppHtmlUrl = "https://example.com/assets/www/index.html"
        rpgwebview.loadUrl(inAppHtmlUrl)

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
            return super.shouldOverrideUrlLoading(view, url)
        }
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
}