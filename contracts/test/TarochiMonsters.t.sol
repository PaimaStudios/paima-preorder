// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.18;

import "forge-std/Test.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import "../src/TarochiMonsters.sol";
import "../src/ITarochiMonsters.sol";

contract TarochiMonstersTest is Test {
    TarochiMonsters public nft;
    uint256 ownedTokenId;
    string baseURI = "192.168.0.1/";
    address alice = makeAddr("alice");

    function setUp() public {
        nft = new TarochiMonsters("Tarochi Monsters", "TM", address(this));
        ownedTokenId = nft.mint(address(this), "");
        nft.setBaseURI(baseURI);
    }

    function test_CanBurn() public {
        nft.burn(ownedTokenId);
    }

    function test_CanMint() public {
        vm.prank(makeAddr("alice"));
        vm.expectEmit(true, true, true, true);
        emit ITarochiMonsters.Minted(2, "abcd");
        nft.mint(address(this), "abcd");
    }

    function test_CanTransfer() public {
        nft.transferFrom(address(this), makeAddr("alice"), ownedTokenId);
    }

    function test_TokenUriUsesBaseUriByDefault() public {
        string memory result = nft.tokenURI(ownedTokenId);
        assertEq(result, "192.168.0.1/1.json");
    }

    function test_TokenUriUsingCustomBaseUri() public {
        string memory result = nft.tokenURI(ownedTokenId, "1.1.0.0/");
        assertEq(result, "1.1.0.0/1.json");
    }

    function test_SupportsInterface() public {
        assertTrue(nft.supportsInterface(type(IERC165).interfaceId));
        assertTrue(nft.supportsInterface(type(IERC721).interfaceId));
    }

    function test_CannotMintToZeroAddress() public {
        vm.expectRevert("TarochiMonsters: zero receiver address");
        nft.mint(address(0), "");
    }

    function test_CannotBurnUnauthorized() public {
        vm.prank(alice);
        vm.expectRevert("TarochiMonsters: not owner");
        nft.burn(ownedTokenId);
    }

    function test_CannotSetBaseUriUnauthorized() public {
        vm.prank(alice);
        vm.expectRevert(abi.encodeWithSelector(Ownable.OwnableUnauthorizedAccount.selector, alice));
        nft.setBaseURI("test");
    }

    function test_CannotSetBaseExtensionUnauthorized() public {
        vm.prank(alice);
        vm.expectRevert(abi.encodeWithSelector(Ownable.OwnableUnauthorizedAccount.selector, alice));
        nft.setBaseExtension("test");
    }

    function onERC721Received(address, address, uint256, bytes calldata) external pure returns (bytes4) {
        return IERC721Receiver.onERC721Received.selector;
    }
}
