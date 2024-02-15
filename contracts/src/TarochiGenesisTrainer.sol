// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "erc721a/contracts/ERC721A.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TarochiGenesisTrainer is ERC721A, Ownable {
    string public baseURI;

    constructor(string memory baseURI_, address owner_) Ownable(owner_) ERC721A("Genesis Trainers", "TGT") {
        baseURI = baseURI_;
        _mint(owner_, 9674);
    }

    function setBaseURI(string memory baseURI_) public onlyOwner {
        baseURI = baseURI_;
    }

    function _baseURI() internal view override returns (string memory) {
        return baseURI;
    }
}
