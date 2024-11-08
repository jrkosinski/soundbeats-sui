import { ApiProperty } from '@nestjs/swagger';

class ResponseDtoBase {
    @ApiProperty({ description: 'The current network (e.g. devnet)' })
    network: string;
}

export class MintBeatsNftDto {
    @ApiProperty({ description: 'Name of the NFT' })
    name: string;
    @ApiProperty({ description: 'The address of the recipient' })
    recipient: string;
    @ApiProperty({ description: 'URL of the NFT image' })
    imageUrl: string;
    @ApiProperty({ description: 'Number of NFT to be minted' })
    quantity?: number = 1;
}

export class MintBeatmapsNftDto {
    @ApiProperty({ description: 'The address of the recipient' })
    recipient: string;
    @ApiProperty({ description: 'Username of the beatmap creator' })
    username: string;
    @ApiProperty({ description: 'Song title or beatmap title' })
    title: string;
    @ApiProperty({ description: 'Song artist' })
    artist: string;
    @ApiProperty({ description: 'Beatmap json' })
    beatmapJson: string;
    @ApiProperty({ description: 'NFT image url' })
    imageUrl: string;
    @ApiProperty({ description: 'Number of NFT to be minted' })
    quantity?: number = 1;
}


export class LocalBeatmapsDto {
    @ApiProperty({ description: 'Username of the beatmap creator' })
    username: string;
    @ApiProperty({ description: 'Song title or beatmap title' })
    title: string;
    @ApiProperty({ description: 'File url' })
    file: string;
}


export class UpdateLocalBeatmapsDto {
    @ApiProperty({ description: 'Auth ID, e.g. EVM wallet address or username' })
    id: any;
    @ApiProperty({ description: 'Auth ID, e.g. EVM wallet address or username' })
    authId: string;
    @ApiProperty({ description: 'Auth type, e.g. "evm"' })
    authType: 'evm' | 'sui';
    @ApiProperty({ description: 'Song username or beatmap username' })
    username: string;
    @ApiProperty({ description: 'Song title or beatmap title' })
    title: string;
    @ApiProperty({ description: 'File url' })
    file: string;
}

export class GetLocalBeatmapResponseDto {
    // @ApiProperty({ description: 'Account unique username' })
    // username: string;
    @ApiProperty({ description: 'Song title or beatmap title' })
    title: string;
    @ApiProperty({ description: 'File url' })
    file: string;
    @ApiProperty({ description: 'Success or failure of the operation' })
    status: string;
}

export class MintTokenDto {
    @ApiProperty({ description: 'The amount of the token' })
    amount: number;
    @ApiProperty({ description: 'The address of the recipient' })
    recipient: string;
    @ApiProperty({ description: 'Optional username of the referral owner' })
    referralOwnerUsername?: string;
}

export class GetTokenBalanceDto {
    @ApiProperty({ description: 'The address of the wallet' })
    wallet: string;
}

export class GetBeatsNftsDto {
    @ApiProperty({ description: 'The address of the wallet' })
    wallet: string;
}

export class GetUserReferralsDto {
    @ApiProperty({ description: 'The User authID' })
    authId: string;
}

export class MintNftResponseDto extends ResponseDtoBase {
    @ApiProperty({ description: 'The signature of the transaction' })
    signature: string;
    @ApiProperty({ description: 'The list of NFT addresses minted' })
    addresses: string[];
    @ApiProperty({ description: 'True if the mint succeeded' })
    success: boolean;
    @ApiProperty({ description: 'Error message (if failed)' })
    message: string;
}

export class RequestNFTResponseDto extends ResponseDtoBase {
    @ApiProperty({ description: 'The signature of the transaction' })
    signature: string;
}

export class MintTokenResponseDto extends ResponseDtoBase {
    @ApiProperty({ description: 'The signature of the transaction' })
    signature: string;
    @ApiProperty({ description: 'True if the mint succeeded' })
    success: boolean;
    @ApiProperty({ description: 'Error message (if failed)' })
    message: string;
    @ApiProperty({ description: 'Current balance after new mint' })
    balance: number; //TODO: should be BigNumber
}

export class GetTokenBalanceResponseDto extends ResponseDtoBase {
    @ApiProperty({ description: 'The balance of the wallet' })
    balance: number; //TODO: should be BigNumber
}

export class BeatsNftDto {
    address: string;
    name: string;
    url: string;
}

export class BeatmapsNftDto {
    address: string;
    username: string;
    title: string;
    artist: string;
    beatmapJson: string;
    uniqueUserCount: number;
    owner: string;
    timestamp: number;
}

export class GetBeatsNftsResponseDto extends ResponseDtoBase {
    @ApiProperty({ description: 'The unique BEATS NFTs owned' })
    nfts: BeatsNftDto[];
}

export class GetBeatmapsNftsResponseDto extends ResponseDtoBase {
    @ApiProperty({ description: 'The BEATMAPS NFTs owned' })
    nfts: BeatmapsNftDto[];
}

export class VerifySignatureDto {
    @ApiProperty({ description: 'The address of the wallet that signed the transaction' })
    address: string;
    @ApiProperty({ description: 'The expected signature' })
    signature: string;
    @ApiProperty({ description: 'The original message that was signed' })
    message: string;
}

export class VerifySignatureResponseDto extends ResponseDtoBase {
    @ApiProperty({ description: 'Whether or not the signature was verified' })
    verified: boolean;
    @ApiProperty({ description: 'The address of the wallet that signed the transaction' })
    address: string;
    @ApiProperty({ description: 'General reason for failure to verify (if not verified)' })
    failureReason: string;
}

/// --- LEADERBOARD --- ///

export class GetLeaderboardDto {
    @ApiProperty({ description: 'The address of the wallet of the user' })
    wallet: string;
    @ApiProperty({ description: 'The max number of records to include in the response' })
    limit: number;
    @ApiProperty({ description: 'Optional unique id of sprint' })
    sprint: string;
    @ApiProperty({ description: 'Optional address of a beatmap' })
    beatmap: string;
}

export class LimitDto {
    @ApiProperty({ description: 'The max number of records to include in the response' })
    limit: number;
}

export class LeaderboardScoreDto {
    @ApiProperty({ description: 'The address of the wallet of the user' })
    wallet: string;
    @ApiProperty({ description: 'The total score of the users' })
    score: number;
    @ApiProperty({ description: 'The username of the user' })
    username: number;
    @ApiProperty({ description: 'Optional unique id of sprint' })
    sprint?: string;
    @ApiProperty({ description: 'Optional address of a beatmap' })
    beatmap?: string;
}

export class GetLeaderboardResponseDto extends ResponseDtoBase {
    @ApiProperty({ description: 'The total score of each user' })
    scores: LeaderboardScoreDto[];
}

export class GetLeaderboardBeatmapsResponseDto extends ResponseDtoBase {
    @ApiProperty({ description: 'The number of unique users for each beatmap' })
    items: { identifier: string; count: number }[];
}

export class AddLeaderboardDto {
    @ApiProperty({ description: 'The address of the wallet of the user' })
    authId: string;
    @ApiProperty({ description: 'The auth type of the user login' })
    authType: string;
    @ApiProperty({ description: 'The score to add' })
    score: number;
    @ApiProperty({ description: 'The present username of the user being added' })
    username: string;
}

export class AddLeaderboardV2Dto {
    @ApiProperty({ description: 'The address of the wallet of the user' })
    wallet: string;
    @ApiProperty({ description: 'The score to add' })
    score: number;
    @ApiProperty({ description: 'The present username of the user being added' })
    username: string;
    @ApiProperty({ description: 'Optional unique id of sprint' })
    sprint: string;
    @ApiProperty({ description: 'Optional address of a beatmap' })
    beatmap: string;
}

export class AddLeaderboardResponseDto extends ResponseDtoBase {
    @ApiProperty({ description: 'The total score of the user' })
    score: number;
}

export class GetLeaderboardSprintDto {
    @ApiProperty({ description: 'Optional unique id of sprint' })
    sprint: string;
    @ApiProperty({ description: 'Optional max number of records to return' })
    limit: number;
}

export class GetLeaderboardSprintResponseDto {
    @ApiProperty({ description: 'Unique id of sprint' })
    sprintId: string;
    @ApiProperty({ description: 'Whether or not sprint is currently active' })
    active: boolean;
    @ApiProperty({ description: 'Sprint start date' })
    startDate: number;
    @ApiProperty({ description: 'Sprint end date' })
    endDate: number;
}

/// --- AUTH --- ///

export class CheckUsernameDto {
    @ApiProperty({ description: 'Username to check' })
    username: string;
}

export class CheckUsernameResponseDto {
    @ApiProperty({ description: 'Username exists or not' })
    exists: boolean;
}

export class GetAccountDto {
    @ApiProperty({ description: 'Auth ID, e.g. EVM wallet address or username' })
    authId: string;
    @ApiProperty({ description: 'Auth type, e.g. "evm"' })
    authType: 'evm' | 'sui';
}

export class GetAccountResponseDto {
    @ApiProperty({ description: 'SUI wallet address' })
    suiWallet: string;
    @ApiProperty({ description: 'Account unique username' })
    username: string;
    @ApiProperty({ description: 'Player level' })
    level: number;
    @ApiProperty({ description: 'Success or failure of the operation' })
    status: string;
}

export class StartAuthSessionDto {
    @ApiProperty({ description: 'EVM wallet address' })
    evmWallet: string;
}

export class StartAuthSessionResponseDto {
    @ApiProperty({ description: 'The unique id of the created session' })
    sessionId: string;
    @ApiProperty({ description: 'A message for the client to sign as a challenge' })
    messageToSign: string;
    @ApiProperty({ description: 'The username of the specified account, if it exists' })
    username: string;
}

export class AuthVerifyDto {
    @ApiProperty({ description: 'Wallet address' })
    wallet: string;
    @ApiProperty({ description: 'Wallet type can be evm or sui' })
    walletType: 'sui' | 'evm';
    @ApiProperty({ description: 'The action being taken; verify signature, or update account' })
    action: 'verify' | 'update';
    @ApiProperty({ description: 'The unique id of this session' })
    sessionId: string;
    @ApiProperty({ description: 'The message that was signed by the client' })
    messageToSign: string;
    @ApiProperty({ description: 'The message signature as signed by caller' })
    signature: string;
    @ApiProperty({ description: 'A unique user-chosen username' })
    username: string;
}

export class AuthVerifyResponseDto {
    @ApiProperty({ description: 'Whether or not the signature was verified' })
    verified: boolean;
    @ApiProperty({ description: 'The address of the wallet that signed the transaction' })
    wallet: string;
    @ApiProperty({ description: 'General reason for failure to verify (if not verified)' })
    failureReason: string;
    @ApiProperty({ description: 'Sui wallet address (if any)' })
    suiWallet: string;
    @ApiProperty({ description: 'Username of user' })
    username: string;
}

export class UpdateUserLevelDto {
    @ApiProperty({ description: 'Auth ID, e.g. EVM wallet address or username' })
    authId: string;
    @ApiProperty({ description: 'Auth type, e.g. "evm"' })
    authType: 'evm' | 'sui';
    @ApiProperty({ description: 'Level of player' })
    level: number;
}

export class UpdateUserOAuthDto {
    @ApiProperty({ description: 'Sui wallet address' })
    suiAddress: string;
    @ApiProperty({ description: 'Token from OAuth login' })
    oauthToken: string;
    @ApiProperty({ description: 'A secret number' })
    nonceToken: string;
    @ApiProperty({ description: 'Normally, the email' })
    username: string;
    @ApiProperty({ description: 'Optional; if referred by another user' })
    referralCode?: string;
}

export class UpdateUserOAuthResponseDto {
    @ApiProperty({ description: '' })
    authId: string;
    @ApiProperty({ description: '' })
    username: string;
    @ApiProperty({ description: 'Success or failure of the operation' })
    status: string;
    @ApiProperty({ description: 'If the user has a referral code, this is the beatmap that it refers to' })
    referralBeatmap: string;
}

export class GetUserOAuthDto {
    @ApiProperty({ description: 'A secret number' })
    nonceToken: string;
}

export class GetUserOAuthResponseDto extends GetAccountResponseDto { }
