// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import { blake2b } from '@noble/hashes/blake2b';
import type { Keypair } from '../cryptography/keypair.js';
import { toSerializedSignature } from '../cryptography/signature.js';
import type { SerializedSignature } from '../cryptography/signature.js';
import type { JsonRpcProvider } from '../providers/json-rpc-provider.js';
import type { SuiAddress } from '../types/index.js';
import { SignerWithProvider } from './signer-with-provider.js';
import type { SuiClient } from '../client/index.js';

export class RawSigner extends SignerWithProvider {
	private readonly keypair: Keypair;

	constructor(keypair: Keypair, client: JsonRpcProvider | SuiClient) {
		super(client);
		this.keypair = keypair;
	}

	async getAddress(): Promise<SuiAddress> {
		return this.keypair.getPublicKey().toSuiAddress();
	}

	async signData(data: Uint8Array): Promise<SerializedSignature> {
		const pubkey = this.keypair.getPublicKey();
		const digest = blake2b(data, { dkLen: 32 });
		const signature = this.keypair.signData(digest);
		const signatureScheme = this.keypair.getKeyScheme();

		return toSerializedSignature({
			signatureScheme,
			signature,
			pubKey: pubkey,
		});
	}

	connect(client: SuiClient | JsonRpcProvider): SignerWithProvider {
		return new RawSigner(this.keypair, client);
	}
}
