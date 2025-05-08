import { isPlatformBrowser, Location } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { environment } from '../../environments/environment';
import { PricesService } from '../app-settings/prices.service';
import { WalletService } from '../wallet/wallet.service';

interface ReferralData {
  solana: string;
}

interface ReferralResponse {
  id: string;
}

@Injectable({
  providedIn: 'root'
})
export class AffiliateService {
  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private route: ActivatedRoute,
    private http: HttpClient,
    private location: Location,
    private pricesService: PricesService,
    private walletService: WalletService,
  ) {}

  /**
   * Check for and process referral code from URL
   * Should be called during app initialization
   */
  init(){
    if(isPlatformBrowser(this.platformId)){
      this.route.queryParams.subscribe(params => {
        if(params['r']){
          const referralCode = params['r'];
          this.removeReferralParamFromUrl();
          this.storeReferralData(referralCode);
        }
      });
    }
  }

  private removeReferralParamFromUrl(): void {
    const url = new URL(window.location.href);
    url.searchParams.delete('r');
    this.location.replaceState(
      url.pathname + (url.search !== '?' ? url.search : '') + url.hash
    );
  }

  private storeReferralData(code: string): void {
    this.http.get(`${environment.apiUrl}/api/referrals/${code}`).subscribe(data => {
      localStorage.setItem('referralData', JSON.stringify(data));
    });
  }

  private referralData: ReferralData | null = null;
  public getReferralData(): ReferralData | null {
    if(this.referralData) return this.referralData;
    const raw = localStorage.getItem('referralData');
    if(!raw) return null;
    try {
      this.referralData = JSON.parse(raw);
      return this.referralData;
    } catch {
      return null;
    }
  }


  // ------------------------------------------------------


  public calculateAffiliateShare(fee: bigint | number, blockchain: string){
    fee = Number(fee.toString())

    if(blockchain !== 'solana') throw new Error('Invalid blockchain');
    const prices = this.pricesService.prices();

    let affiliateShare!: number;
    if(blockchain === 'solana'){
      if(
        !this.getReferralData()?.solana ||
        this.getReferralData()?.solana === this.walletService.selectedWallet?.publicKey // if the affiliate used their own link. It would be impossible and would make no sense to transfer funds to your own wallet
      ) return [0, fee];
      affiliateShare = prices.solanaAffiliateSharePercents.cost / 100;
    }

    const affiliateValue = fee * affiliateShare;
    return [affiliateValue, fee - affiliateValue];
  }

  public createReferralId(wallets: ReferralData){
    return this.http.post<ReferralResponse>(`${environment.apiUrl}/api/referrals/create`, wallets);
  }
}
