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
    /// @dev NFT price in native gas tokens

    uint256 public nftNativePrice;
    /// @dev NFT price in accepted ERC20 tokens
    uint256 public nftErc20Price;
    /// @dev Address of the NFT that is being sold
    address public nftAddress;
    /// @dev Can't buy NFT after this timestamp
    uint256 public saleDeadline;
    /// @dev Mapping of referral code to address that registered it
    mapping(string => address) referrals;
    /// @dev Array of addresses of tokens that are accepted as payment for the NFT sale.
    IERC20[] public supportedCurrencies;

    /// @dev Emitted when an NFT of `tokenId` is minted to `receiver` by `buyer` paying `price` in `paymentToken`.
    event BuyNFT(
        address indexed receiver, address indexed buyer, address indexed paymentToken, uint256 price, uint256 tokenId
    );
    /// @dev Emitted when the `token` is removed from the list of `supportedCurrencies`.
    event RemoveWhitelistedToken(address indexed token);
    /// @dev Emitted when the native tokens NFT price is updated from `oldPrice` to `newPrice`.
    event UpdateNativePrice(uint256 indexed oldPrice, uint256 indexed newPrice);
    /// @dev Emitted when the ERC20 tokens NFT price is updated from `oldPrice` to `newPrice`.
    event UpdateErc20Price(uint256 indexed oldPrice, uint256 indexed newPrice);
    /// @dev Emitted when the `tokens` array is set as the `supportedCurrencies`.
    event WhitelistTokens(address[] indexed tokens);

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(
        address owner,
        address _nftAddress,
        uint256 _nftNativePrice,
        uint256 _nftErc20Price,
        uint256 _saleDeadline
    ) public initializer {
        __Ownable_init();
        __UUPSUpgradeable_init();
        _transferOwnership(owner);

        nftAddress = _nftAddress;
        nftNativePrice = _nftNativePrice;
        nftErc20Price = _nftErc20Price;
        saleDeadline = _saleDeadline;
    }

    /// @dev Purchases NFT for address `receiverAddress`, paying required price in native token.
    /// This function calls the `mint` function on the `AnnotatedMintNft` contract.
    /// Emits the `BuyNFT` event.
    function buyNftNative(address receiverAddress, string memory referralCode) public payable returns (uint256) {
        require(block.timestamp < saleDeadline, "TarochiSale: sale concluded");
        require(msg.value == nftNativePrice, "TarochiSale: incorrect value");
        require(receiverAddress != address(0), "TarochiSale: zero receiver address");

        uint256 tokenId = TarochiSeasonPassNft(nftAddress).mint(receiverAddress, "");

        emit BuyNFT(receiverAddress, msg.sender, address(0), nftNativePrice, tokenId);

        return tokenId;
    }

    /// @dev Purchases NFT for address `receiverAddress`, paying required price in supported ERC20 tokens.
    /// This function calls the `mint` function on the `AnnotatedMintNft` contract.
    /// Emits the `BuyNFT` event.
    function buyNftErc20(IERC20 _tokenAddress, address receiverAddress, string memory referralCode)
        public
        payable
        returns (uint256)
    {
        require(block.timestamp < saleDeadline, "TarochiSale: sale concluded");
        require(tokenIsWhitelisted(_tokenAddress), "TarochiSale: token not whitelisted");
        require(receiverAddress != address(0), "TarochiSale: zero receiver address");

        uint256 price = nftErc20Price;

        // transfer tokens from buyer to contract
        IERC20(_tokenAddress).transferFrom(msg.sender, address(this), price);

        uint256 tokenId = TarochiSeasonPassNft(nftAddress).mint(receiverAddress, "");

        emit BuyNFT(receiverAddress, msg.sender, address(_tokenAddress), price, tokenId);

        return tokenId;
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

    /// @dev Changes the price in native tokens to `_nftNativePrice`.
    /// Callable only by the contract owner.
    function updateNativePrice(uint256 _nftNativePrice) external onlyOwner {
        uint256 oldPrice = nftNativePrice;
        nftNativePrice = _nftNativePrice;

        emit UpdateNativePrice(oldPrice, _nftNativePrice);
    }

    /// @dev Changes the price in accepted ERC20 tokens to `_nftErc20Price`.
    /// Callable only by the contract owner.
    function updateErc20Price(uint256 _nftErc20Price) external onlyOwner {
        uint256 oldPrice = nftErc20Price;
        nftErc20Price = _nftErc20Price;

        emit UpdateErc20Price(oldPrice, _nftErc20Price);
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
