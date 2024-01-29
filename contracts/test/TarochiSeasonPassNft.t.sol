// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.18;

import "forge-std/Test.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "../src/TarochiSeasonPassNft.sol";

contract TarochiSeasonPassNftTest is Test {
    TarochiSeasonPassNft public nft;
    uint256 ownedTokenId;

    function setUp() public {
        nft = new TarochiSeasonPassNft(
            "Tarochi Season 1 Pass", "TSP1", type(uint256).max, address(this), block.timestamp + 1000
        );
        ownedTokenId = nft.mint(address(this), "");
    }

    function test_CanBurn() public {
        nft.burn(ownedTokenId);
    }

    function test_CannotTransfer() public {
        vm.expectRevert("TarochiSeasonPassNft: NFT is soulbound - cannot be transferred");
        nft.transferFrom(address(this), makeAddr("alice"), ownedTokenId);
    }

    function onERC721Received(address, address, uint256, bytes calldata) external pure returns (bytes4) {
        return IERC721Receiver.onERC721Received.selector;
    }
}
