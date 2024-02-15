// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "erc721a/contracts/ERC721A.sol";
// import "erc721a/contracts/IERC721A.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";

contract TarochiGenesisTrainer is ERC721A, Ownable, ERC2981 {
    string public baseURI;

    constructor(string memory baseURI_, address owner_, address royaltyReceiver_)
        Ownable(owner_)
        ERC721A("Genesis Trainers", "TGT")
    {
        baseURI = baseURI_;
        _setDefaultRoyalty(royaltyReceiver_, 690);
        _mint(owner_, 9674);
    }

    function setBaseURI(string memory baseURI_) public onlyOwner {
        baseURI = baseURI_;
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

    function supportsInterface(bytes4 interfaceId) public view override(ERC2981, ERC721A) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    function _baseURI() internal view override returns (string memory) {
        return baseURI;
    }
}
