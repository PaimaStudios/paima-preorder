// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import {Address} from "@openzeppelin/contracts/utils/Address.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

import {TarochiSeasonPassNft} from "./TarochiSeasonPassNft.sol";

contract TarochiSale is OwnableUpgradeable, UUPSUpgradeable {
    using Address for address payable;

    /// @dev Address of the NFT that is being sold
    address public nftAddress;
    /// @dev Array of addresses of tokens that are accepted as payment for the NFT sale.
    IERC20[] public supportedCurrencies;

    /// @dev Emitted when an NFT of `tokenId` is minted to `receiver` by `buyer` paying `price` in `paymentToken`.
    event BuyNFT(
        address indexed receiver,
        address indexed buyer,
        address indexed paymentToken,
        uint256 price,
        uint256 tokenId,
        address referrer
    );
    /// @dev Emitted when a `referrer` receives `reward` amount of `paymentToken` in an NFT sale initiated by `buyer`.
    event ReferrerReward(address indexed referrer, address indexed buyer, address indexed paymentToken, uint256 reward);
    /// @dev Emitted when the `token` is removed from the list of `supportedCurrencies`.
    event RemoveWhitelistedToken(address indexed token);
    /// @dev Emitted when the `tokens` array is set as the `supportedCurrencies`.
    event WhitelistTokens(address[] indexed tokens);

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(address owner, address _nftAddress) public initializer {
        __Ownable_init();
        __UUPSUpgradeable_init();
        _transferOwnership(owner);

        nftAddress = _nftAddress;
    }

    /// @dev Purchases NFT for address `receiverAddress`, paying required price in native token.
    /// This function calls the `mint` function on the `AnnotatedMintNft` contract.
    /// Emits the `BuyNFT` event.
    function buyNftNative(address receiverAddress, address payable referrer) public payable returns (uint256) {
        require(msg.sender != referrer && receiverAddress != referrer, "TarochiSale: cannot refer yourself or receiver");
        uint256 referrerReward = getReferrerReward(msg.value, referrer);
        require(receiverAddress != address(0), "TarochiSale: zero receiver address");

        if (referrerReward != 0) {
            referrer.sendValue(referrerReward);
            emit ReferrerReward(referrer, msg.sender, address(0), referrerReward);
        }

        uint256 tokenId = TarochiSeasonPassNft(nftAddress).mint(receiverAddress, "");

        emit BuyNFT(receiverAddress, msg.sender, address(0), msg.value, tokenId, referrer);

        return tokenId;
    }

    /// @dev Purchases NFT for address `receiverAddress`, paying required price in supported ERC20 tokens.
    /// This function calls the `mint` function on the `AnnotatedMintNft` contract.
    /// Emits the `BuyNFT` event.
    function buyNftErc20(IERC20 _tokenAddress, uint256 tokenAmount, address receiverAddress, address referrer)
        public
        returns (uint256)
    {
        require(msg.sender != referrer && receiverAddress != referrer, "TarochiSale: cannot refer yourself or receiver");
        uint256 referrerReward = getReferrerReward(tokenAmount, referrer);
        require(tokenIsWhitelisted(_tokenAddress), "TarochiSale: token not whitelisted");
        require(receiverAddress != address(0), "TarochiSale: zero receiver address");

        if (referrerReward != 0) {
            IERC20(_tokenAddress).transferFrom(msg.sender, referrer, referrerReward);
            emit ReferrerReward(referrer, msg.sender, address(_tokenAddress), referrerReward);
        }

        IERC20(_tokenAddress).transferFrom(msg.sender, address(this), tokenAmount - referrerReward);

        uint256 tokenId = TarochiSeasonPassNft(nftAddress).mint(receiverAddress, "");

        emit BuyNFT(receiverAddress, msg.sender, address(_tokenAddress), tokenAmount, tokenId, referrer);

        return tokenId;
    }

    /// @dev Computes the 5% referrer reward portion from paid price, if referrer is not address(0).
    function getReferrerReward(uint256 price, address referrer) public pure returns (uint256 referrerReward) {
        return referrer == address(0) ? 0 : price / 20;
    }

    /// @dev Returns an array of token addresses that are accepted as payment in the NFT purchase.
    function getSupportedCurrencies() public view returns (IERC20[] memory) {
        return supportedCurrencies;
    }

    /// @dev Returns true if `_token` is part of the `supportedCurrencies`.
    function tokenIsWhitelisted(IERC20 _token) public view returns (bool) {
        IERC20[] memory supportedCurrenciesMem = supportedCurrencies;
        for (uint256 i = 0; i < supportedCurrenciesMem.length; i++) {
            if (supportedCurrenciesMem[i] == _token) return true;
        }

        return false;
    }

    /// @dev Removes `_token` from the list of `supportedCurrencies`.
    /// Callable only by the contract owner.
    /// Emits the `RemoveWhitelistedToken` event.
    function removeWhitelistedToken(IERC20 _token) external onlyOwner {
        require(tokenIsWhitelisted(_token), "TarochiSale: token not whitelisted");

        IERC20[] memory supportedCurrenciesMem = supportedCurrencies;

        uint256 tokenIndex;
        for (uint256 i = 0; i < supportedCurrenciesMem.length; i++) {
            if (supportedCurrenciesMem[i] == _token) {
                tokenIndex = i;
                break;
            }
        }

        require(tokenIndex < supportedCurrenciesMem.length, "TarochiSale: out of bounds");

        supportedCurrencies[tokenIndex] = supportedCurrencies[supportedCurrencies.length - 1];
        supportedCurrencies.pop();

        emit RemoveWhitelistedToken(address(_token));
    }

    /// @dev Adds `_tokens` to the `supportedCurrencies` array.
    /// Callable only by the contract owner.
    /// Emits the `WhitelistTokens` event.
    function whitelistTokens(IERC20[] memory _tokens) external onlyOwner {
        address[] memory newWhiteList = new address[](_tokens.length);

        for (uint256 i = 0; i < _tokens.length; i++) {
            newWhiteList[i] = address(_tokens[i]);
            supportedCurrencies.push(_tokens[i]);
        }

        emit WhitelistTokens(newWhiteList);
    }

    /// @dev Withdraws the contract balance to `_account`.
    /// Callable only by the contract owner.
    function withdraw(address payable _account) external onlyOwner {
        uint256 balance = address(this).balance;
        _account.sendValue(balance);

        IERC20[] memory currencies = supportedCurrencies;

        for (uint256 i = 0; i < currencies.length;) {
            uint256 erc20Balance = currencies[i].balanceOf(address(this));
            if (erc20Balance > 0) {
                currencies[i].transfer(_account, erc20Balance);
            }

            unchecked {
                i++;
            }
        }
    }

    function _authorizeUpgrade(address) internal override onlyOwner {}
}
