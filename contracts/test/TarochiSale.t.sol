// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.18;

import "forge-std/Test.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import {ERC1967Proxy} from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import "../src/TarochiSeasonPassNft.sol";
import "../src/TarochiSale.sol";

contract MockERC20 is ERC20 {
    constructor(string memory name, string memory symbol) ERC20(name, symbol) {}

    function mint(address account, uint256 amount) public {
        _mint(account, amount);
    }
}

contract TarochiSaleTest is Test {
    TarochiSeasonPassNft public nft;
    TarochiSale public sale;
    MockERC20 public usdc;
    MockERC20 public doge;
    address payable alice = payable(makeAddr("alice"));
    address payable boris = payable(makeAddr("boris"));

    function setUp() public {
        usdc = new MockERC20("USDC", "USDC");
        usdc.mint(address(this), 100 ether);
        doge = new MockERC20("DOGE", "DOGE");
        doge.mint(address(this), 100 ether);

        nft = new TarochiSeasonPassNft(
            "Tarochi Season 1 Pass", "TSP1", type(uint256).max, address(this), block.timestamp + 1000
        );
        TarochiSale saleImpl = new TarochiSale();
        bytes memory initializeData =
            abi.encodeWithSignature("initialize(address,address)", address(this), address(nft));
        sale = TarochiSale(address(new ERC1967Proxy(address(saleImpl), initializeData)));

        IERC20[] memory supportedCurrencies = new IERC20[](1);
        supportedCurrencies[0] = usdc;
        sale.whitelistTokens(supportedCurrencies);

        nft.setMinter(address(sale));
        usdc.approve(address(sale), type(uint256).max);
        doge.approve(address(sale), type(uint256).max);
    }

    function test_CorrectInitialization() public {
        assertEq(sale.owner(), address(this));
        assertEq(sale.nftAddress(), address(nft));
        assertEq(sale.getSupportedCurrencies().length, 1);
        assertEq(address(sale.getSupportedCurrencies()[0]), address(usdc));
    }

    function test_BuyWithNativeWithoutReferral() public {
        address receiver = alice;
        uint256 balance = address(sale).balance;
        uint256 price = 1 ether;

        uint256 tokenId = sale.buyNftNative{value: price}(receiver, payable(address(0)));

        assertEq(address(sale).balance, balance + price);
        assertEq(nft.ownerOf(tokenId), receiver);
    }

    function test_BuyWithNativeWithReferral() public {
        address receiver = alice;
        address payable referrer = boris;
        uint256 saleBalance = address(sale).balance;
        uint256 referrerBalance = referrer.balance;
        uint256 price = 1 ether;
        uint256 referrerReward = sale.getReferrerReward(price, referrer);

        uint256 tokenId = sale.buyNftNative{value: price}(receiver, referrer);

        assertEq(address(sale).balance, saleBalance + price - referrerReward);
        assertEq(referrer.balance, referrerBalance + referrerReward);
        assertEq(nft.ownerOf(tokenId), receiver);
    }

    function test_BuyWithErc20WithoutReferral() public {
        address receiver = alice;
        uint256 balance = usdc.balanceOf(address(sale));
        uint256 price = 1 ether;

        uint256 tokenId = sale.buyNftErc20(usdc, price, receiver, payable(address(0)));

        assertEq(usdc.balanceOf(address(sale)), balance + price);
        assertEq(nft.ownerOf(tokenId), receiver);
    }

    function test_BuyWithErc20WithReferral() public {
        address receiver = alice;
        address payable referrer = boris;
        uint256 saleBalance = usdc.balanceOf(address(sale));
        uint256 referrerBalance = usdc.balanceOf(referrer);
        uint256 price = 1 ether;
        uint256 referrerReward = sale.getReferrerReward(price, referrer);

        uint256 tokenId = sale.buyNftErc20(usdc, price, receiver, referrer);

        assertEq(usdc.balanceOf(address(sale)), saleBalance + price - referrerReward);
        assertEq(usdc.balanceOf(referrer), referrerBalance + referrerReward);
        assertEq(nft.ownerOf(tokenId), receiver);
    }

    function test_CannotBuyWithUnsupportedErc20() public {
        vm.expectRevert("TarochiSale: token not whitelisted");
        sale.buyNftErc20(doge, 1 ether, alice, address(0));
    }

    function test_CannotReferYourselfNative() public {
        vm.expectRevert("TarochiSale: cannot refer yourself or receiver");
        sale.buyNftNative(alice, payable(address(this)));
    }

    function test_CannotReferReceiverNative() public {
        vm.expectRevert("TarochiSale: cannot refer yourself or receiver");
        sale.buyNftNative(alice, alice);
    }

    function test_CannotReferYourselfErc20() public {
        vm.expectRevert("TarochiSale: cannot refer yourself or receiver");
        sale.buyNftErc20(usdc, 1 ether, alice, payable(address(this)));
    }

    function test_CannotReferReceiverErc20() public {
        vm.expectRevert("TarochiSale: cannot refer yourself or receiver");
        sale.buyNftErc20(usdc, 1 ether, alice, alice);
    }

    function test_CannotBuyToZeroAddressNative() public {
        vm.expectRevert("TarochiSale: zero receiver address");
        sale.buyNftNative(address(0), alice);
    }

    function test_CannotBuyToZeroAddressErc20() public {
        vm.expectRevert("TarochiSale: zero receiver address");
        sale.buyNftErc20(usdc, 1 ether, address(0), alice);
    }

    function onERC721Received(address, address, uint256, bytes calldata) external pure returns (bytes4) {
        return IERC721Receiver.onERC721Received.selector;
    }
}
