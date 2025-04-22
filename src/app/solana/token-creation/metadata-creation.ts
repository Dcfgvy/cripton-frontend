import { PublicKey, SystemProgram, SYSVAR_RENT_PUBKEY, TransactionInstruction } from "@solana/web3.js";
import { CreateTokenData } from "./interfaces/create-token-data.interface";

export function createTokenMetadataInstructionsTest(
  data: CreateTokenData,
  userPublicKey: PublicKey,
  updateAuthority: PublicKey
): TransactionInstruction[] {
  const METADATA_PROGRAM_ID = new PublicKey(
    'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s'
  );

  // Derive metadata account PDA
  const metadataAccount = PublicKey.findProgramAddressSync(
    [
      Buffer.from('metadata'),
      METADATA_PROGRAM_ID.toBuffer(),
      data.mint.publicKey.toBuffer(),
    ],
    METADATA_PROGRAM_ID
  )[0];

  // Determine mint authority
  const mintAuthority = data.mint.publicKey;

  // Build data buffer
  const dataBuffer = createMetadataData(data, userPublicKey);

  // Create instruction
  const instruction = new TransactionInstruction({
    keys: [
      { pubkey: metadataAccount, isWritable: true, isSigner: false },
      { pubkey: data.mint.publicKey, isWritable: false, isSigner: false },
      { pubkey: mintAuthority, isWritable: false, isSigner: true },
      { pubkey: userPublicKey, isWritable: true, isSigner: true },
      { pubkey: updateAuthority, isWritable: false, isSigner: false },
      { pubkey: SystemProgram.programId, isWritable: false, isSigner: false },
      { pubkey: SYSVAR_RENT_PUBKEY, isWritable: false, isSigner: false },
    ],
    programId: METADATA_PROGRAM_ID,
    data: dataBuffer,
  });

  return [instruction];
}

function createMetadataData(
  data: CreateTokenData,
  userPublicKey: PublicKey
): Buffer {
  const dataBytes: number[] = [];
  
  // Instruction discriminator (create_metadata_accounts_v3)
  dataBytes.push(0x33);

  // DataV2 structure
  // Name
  const nameBytes = new TextEncoder().encode(data.name);
  dataBytes.push(...toUint32LE(nameBytes.length), ...nameBytes);

  // Symbol
  const symbolBytes = new TextEncoder().encode(data.symbol);
  dataBytes.push(...toUint32LE(symbolBytes.length), ...symbolBytes);

  // URI
  const uriBytes = new TextEncoder().encode(data.metadataUri);
  dataBytes.push(...toUint32LE(uriBytes.length), ...uriBytes);

  // Seller fee basis points
  dataBytes.push(0x00, 0x00); // 0%

  // Creators (array)
  dataBytes.push(0x01); // Some
  dataBytes.push(...toUint32LE(1)); // Array length = 1
  
  // Creator object
  dataBytes.push(...userPublicKey.toBytes()); // 32 bytes
  dataBytes.push(0x01); // verified = true
  dataBytes.push(100); // share = 100%

  // Collection (None)
  dataBytes.push(0x00);

  // Uses (None)
  dataBytes.push(0x00);

  // Additional metadata parameters
  dataBytes.push(data.isMutable ? 0x01 : 0x00); // isMutable
  dataBytes.push(0x00); // Collection details (None)

  return Buffer.from(dataBytes);
}

// Helper functions for little-endian conversions
function toUint32LE(value: number): number[] {
  const buffer = new ArrayBuffer(4);
  new DataView(buffer).setUint32(0, value, true);
  return Array.from(new Uint8Array(buffer));
}