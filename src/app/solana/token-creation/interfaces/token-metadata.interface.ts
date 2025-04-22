import { TokenSocials } from "./token-socials.interface";

export interface TokenImageData {
  imageData?: File;
  imageUrl?: string;
}

export interface TokenUploadMetadata {
  mint: string;
  name: string;
  symbol: string;
  description: string;
  creatorName?: string;
  creatorWebsite?: string;
  tags: string[];
  tokenSocials: TokenSocials;
}