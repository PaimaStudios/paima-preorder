// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "@paima/evm-contracts/contracts/token/InverseAppProjectedNft.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";

contract TarochiMonsterTrading is InverseAppProjectedNft, ERC2981 {
    constructor(string memory baseURI_, address owner_, address royaltyReceiver_)
        InverseAppProjectedNft("Tarochi Monsters", "TaMo", owner_)
    {
        baseURI = baseURI_;
        _setDefaultRoyalty(royaltyReceiver_, 1000);
    }

    function setDefaultRoyalty(address receiver, uint96 feeNumerator) public onlyOwner {
        _setDefaultRoyalty(receiver, feeNumerator);
    }

    function deleteDefaultRoyalty() public onlyOwner {
        _deleteDefaultRoyalty();
    }

    function setTokenRoyalty(uint256 tokenId, address receiver, uint96 feeNumerator) public onlyOwner {
        _setTokenRoyalty(tokenId, receiver, feeNumerator);
    }

    function resetTokenRoyalty(uint256 tokenId) public onlyOwner {
        _resetTokenRoyalty(tokenId);
    }

    function supportsInterface(bytes4 interfaceId) public view override(InverseAppProjectedNft, ERC2981) returns (bool) {
        return InverseAppProjectedNft.supportsInterface(interfaceId) || ERC2981.supportsInterface(interfaceId);
    }
}
