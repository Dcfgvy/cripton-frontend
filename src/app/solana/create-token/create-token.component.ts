import { Component } from '@angular/core';
import { CreateTokenFormComponent } from './create-token-form/create-token-form.component';
import { QuestionAndAnswer, FaqComponent } from '../../components/faq/faq.component';
import { ToolHeaderComponent } from "../../components/tool-header/tool-header.component";

@Component({
  selector: 'app-create-token',
  imports: [CreateTokenFormComponent, FaqComponent, ToolHeaderComponent],
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
      "question": "What is Solana Token Creator?",
      "answer": "Solana Token Creator is a decentralized app (dApp) that lets you easily create and mint SPL tokens without writing any code. Just customize the metadata, name, symbol, logo, and specify the supply."
    },
    {
      "question": "What is SPL token?",
      "answer": "An SPL (Solana Program Library) token is a digital asset built on the Solana blockchain. It works similarly to ERC-20 tokens on Ethereum and supports actions like transferring and minting."
    },
    {
      "question": "What wallets can I use to create and mint SPL tokens?",
      "answer": "You can use any major Solana wallet, such as Phantom, Solflare, and others."
    },
    {
      "question": "How much does it cost to create SPL tokens?",
      "answer": "The current cost is shown at the bottom of the token creation form."
    },
    {
      "question": "How to use Solana Token Creator?",
      "answer": "Step 1. Connect your Solana wallet and choose a network (mainnet or devnet). This wallet will have minting authority, unless you revoke it.\nStep 2. Fill in your token details (name, symbol, decimals, logo, and supply).\nStep 3. Optionally customise your token metadata and revoke authorities for security.\nStep 4. Click the 'Create $TOKEN' button and approve the transaction.\nYour token will be created, and the supply sent to your wallet."
    },
    {
      "question": "Can I try Solana Token Generator for free?",
      "answer": "Yes, you can create unlimited SPL tokens for free on the Solana Devnet."
    },
    {
      "question": "Can I create meme coin on Solana via your tool?",
      "answer": "Yes. Our tool is ideal for launching meme coins on Solana - create, mint, and manage them with ease."
    }
  ]
}
