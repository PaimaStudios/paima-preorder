// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

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

    /// @dev Emitted when an NFT of `tokenId` is minted to `receiver` by `buyer` paying `price` in `paymentToken`.
    event BuyNFT(
        address indexed receiver, address indexed buyer, address indexed paymentToken, uint256 price, uint256 tokenId
    );

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
    /// This function calls the `mint` function on the `AnnotatedMintNft` contract, passing provided `initialData`.
    /// Emits the `BuyNFT` event.
    function buyNftNative(address receiverAddress, string memory referralCode) public payable returns (uint256) {
        require(msg.value == nftNativePrice, "TarochiSale: incorrect value");
        require(receiverAddress != address(0), "TarochiSale: zero receiver address");

        uint256 tokenId = TarochiSeasonPassNft(nftAddress).mint(receiverAddress, "");

        emit BuyNFT(receiverAddress, msg.sender, address(0), nftNativePrice, tokenId);

        return tokenId;
    }

    /// @dev Changes the price in native tokens to `_nftNativePrice`.
    /// Callable only by the contract owner.
    function updateNativePrice(uint256 _nftNativePrice) external onlyOwner {
        nftNativePrice = _nftNativePrice;
    }

    /// @dev Changes the price in accepted ERC20 tokens to `_nftErc20Price`.
    /// Callable only by the contract owner.
    function updateErc20Price(uint256 _nftErc20Price) external onlyOwner {
        nftErc20Price = _nftErc20Price;
    }

    /// @dev Withdraws the contract balance to `_account`.
    /// Callable only by the contract owner.
    function withdraw(address payable _account) external onlyOwner {
        uint256 balance = address(this).balance;

        require(balance > 0, "TarochiSale: 0 balance");
        _account.sendValue(balance);
    }

    function _authorizeUpgrade(address) internal override onlyOwner {}
}
