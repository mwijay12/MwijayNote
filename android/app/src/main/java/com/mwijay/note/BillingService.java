package com.mwijay.note;

import android.app.Activity;
import android.content.Context;
import android.util.Log;
import com.android.billingclient.api.*;
import java.util.ArrayList;
import java.util.List;

/**
 * Mwijay Note Billing Service
 * Handles Google Play In-App Purchases and Subscriptions
 */
public class BillingService {
    private BillingClient billingClient;
    private final Context context;
    private final Activity activity;
    
    public BillingService(Context context, Activity activity) {
        this.context = context;
        this.activity = activity;
        setupBillingClient();
    }
    
    private void setupBillingClient() {
        billingClient = BillingClient.newBuilder(context)
            .setListener((billingResult, purchases) -> {
                if (billingResult.getResponseCode() == BillingClient.BillingResponseCode.OK && purchases != null) {
                    for (Purchase purchase : purchases) {
                        handlePurchase(purchase);
                    }
                }
            })
            .enablePendingPurchases()
            .build();
        
        billingClient.startConnection(new BillingClientStateListener() {
            @Override
            public void onBillingSetupFinished(BillingResult result) {
                if (result.getResponseCode() == BillingClient.BillingResponseCode.OK) {
                    Log.d("MwijayBilling", "Billing client ready");
                }
            }
            
            @Override
            public void onBillingServiceDisconnected() {
                Log.d("MwijayBilling", "Billing service disconnected - retrying...");
                setupBillingClient();
            }
        });
    }
    
    public void launchPremiumPurchase(String productId) {
        if (billingClient == null || !billingClient.isReady()) {
            Log.e("MwijayBilling", "Billing client not ready");
            return;
        }

        List<QueryProductDetailsParams.Product> productList = new ArrayList<>();
        productList.add(
            QueryProductDetailsParams.Product.newBuilder()
                .setProductId(productId)
                .setProductType(BillingClient.ProductType.SUBS)
                .build()
        );

        QueryProductDetailsParams params = QueryProductDetailsParams.newBuilder()
            .setProductList(productList)
            .build();
        
        billingClient.queryProductDetailsAsync(params, (billingResult, productDetailsList) -> {
            if (billingResult.getResponseCode() == BillingClient.BillingResponseCode.OK && productDetailsList != null && !productDetailsList.isEmpty()) {
                ProductDetails productDetails = productDetailsList.get(0);
                List<BillingFlowParams.ProductDetailsParams> productDetailsParamsList = new ArrayList<>();
                
                // For subscriptions, we need to provide the offer token
                List<ProductDetails.SubscriptionOfferDetails> offerDetails = productDetails.getSubscriptionOfferDetails();
                if (offerDetails != null && !offerDetails.isEmpty()) {
                    String offerToken = offerDetails.get(0).getOfferToken();
                    
                    productDetailsParamsList.add(
                        BillingFlowParams.ProductDetailsParams.newBuilder()
                            .setProductDetails(productDetails)
                            .setOfferToken(offerToken)
                            .build()
                    );

                    BillingFlowParams billingFlowParams = BillingFlowParams.newBuilder()
                        .setProductDetailsParamsList(productDetailsParamsList)
                        .build();
                    
                    billingClient.launchBillingFlow(activity, billingFlowParams);
                } else {
                    Log.e("MwijayBilling", "No subscription offer details found for product: " + productId);
                }
            } else {
                Log.e("MwijayBilling", "Query product details failed or returned empty list: " + billingResult.getDebugMessage());
            }
        });
    }
    
    private void handlePurchase(Purchase purchase) {
        if (purchase.getPurchaseState() == Purchase.PurchaseState.PURCHASED) {
            // In a real app, verify purchase with backend and save status
            Log.d("MwijayBilling", "Purchase successful: " + purchase.getOrderId());
            acknowledgePurchase(purchase.getPurchaseToken());
        }
    }
    
    private void acknowledgePurchase(String purchaseToken) {
        AcknowledgePurchaseParams acknowledgePurchaseParams =
            AcknowledgePurchaseParams.newBuilder()
                .setPurchaseToken(purchaseToken)
                .build();
        
        billingClient.acknowledgePurchase(acknowledgePurchaseParams, 
            result -> Log.d("MwijayBilling", "Purchase acknowledged"));
    }
}
