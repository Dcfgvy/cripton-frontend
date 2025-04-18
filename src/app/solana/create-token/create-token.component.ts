import { Component } from '@angular/core';
import { CreateTokenFormComponent } from './create-token-form/create-token-form.component';
import { QuestionAndAnswer, FaqComponent } from '../../components/faq/faq.component';

@Component({
  selector: 'app-create-token',
  imports: [CreateTokenFormComponent, FaqComponent],
  templateUrl: './create-token.component.html',
  styleUrl: './create-token.component.scss'
})
export class CreateTokenComponent {
  showForm = true;

  resetForm(){
    // Temporarily destroy the component
    this.showForm = false;
    
    // Use setTimeout to ensure change detection cycle completes
    setTimeout(() => {
      this.showForm = true;
    }, 0);
  }

  faqList: QuestionAndAnswer[] = [
    {
      question: "What is Solana Token Creator?",
      answer: "Solana Token Creator is a dapp that allows you to create and mint your own SPL tokens without coding. You just need customize metadata, name, symbol, logo and enter supply."
    },
    {
      question: "What is SPL token?",
      answer: "SPL (Solana Program Library) token is a type of digital asset on the Solana blockchain. SPL tokens are similar to ERC20 tokens on Ethereum blockchain, as they have specific methods for token management, like transferring, minting etc."
    },
    {
      question: "What wallets can I use to create and mint SPL tokens?",
      answer: "You can use any popular solana wallets, such as Phantom, Solflare etc."
    },
    {
      question: "How much does it cost to create SPL tokens?",
      answer: "The current price is displayed in the bottom of the creation form"
    },
    {
      question: "How to use Solana Token Creator?",
      answer: `Step 1. Connect your Solana wallet and select network (mainnet, devnet or testnet). This wallet will have authority to mint
      Step 2. Enter information about your SPL token (token name, symbol, decimals, logo, supply)
      Step 3. Press 'Create token' button and confirm transaction
      Congratulations! Your token is created and supply is transferred to your wallet`
    },
    {
      question: "Can I try Solana Token Generator for free?",
      answer: "Yes. You can create any number of SPL tokens for free on solana devnet or testnet"
    },
    {
      question: "Can I create meme coin on Solana via your tool?",
      answer: "Yes. Our tool is perfect for creating meme coins on Solana. Create, mint and manage your meme tokens with ease."
    }
  ]
}
